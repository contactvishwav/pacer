// ─── Race prediction engine ────────────────────────────────────────────────────
//
// Transparent heuristic: Riegel formula + fatigue/taper adjustments.
// This is an estimated trajectory based on current training data, not a
// scientific guarantee or clinical prediction.
//
// Riegel formula: T2 = T1 × (D2 / D1)^1.06
//   T1 = best qualifying effort time (seconds)
//   D1 = best qualifying effort distance (meters)
//   D2 = goal race distance (meters)
//
// Best effort: fastest avg pace across TEMPO, LONG_RUN, RACE activities
//   ≥ 5000 m from the last 8 weeks (caller pre-filters the window).
//
// Adjustments applied in order:
//   1. Fatigue (TSB-based): < −10 → ×1.02, > 5 → ×0.98, else no-op
//   2. Taper bonus: TAPER phase + ≤ 21 days to race → ×0.99
//   Both adjustments are independent and can stack.
//
// Confidence band: multiplicative adjustments to the ±4 % base.
//   All matching conditions apply; they compound.
//
// Language rule: use "projected finish", "estimated trajectory",
//   "confidence range". Never "you will finish in X".

import type { TrainingLoadResult } from './training-load'
import type { PeriodizationResult } from './periodization'

// ─── Input types ──────────────────────────────────────────────────────────────

export interface GoalRace {
  raceName:        string
  raceDate:        Date
  distanceMeters:  number   // 21097.5 for half marathon, 42195 for marathon
  goalTimeSeconds: number | null  // null = finish only, no time goal
}

// Minimal activity shape needed by the race prediction engine.
// Caller is responsible for pre-filtering to the relevant date window.
export interface ActivityWithClassification {
  startedAt:         Date
  distanceMeters:    number
  movingTimeSeconds: number
  avgPaceSecPerKm:   number
  workoutType:       string  // WorkoutType enum value
}

export interface WeeklySummaryForPrediction {
  weekNumber:    number
  weekStartDate: Date
  totalLoad:     number
}

export interface RacePredictionInput {
  goalRace:            GoalRace
  recentActivities:    ActivityWithClassification[]  // pre-filtered to last 8 weeks
  weeklySummaries:     WeeklySummaryForPrediction[]  // pre-filtered to last 8 weeks
  currentTrainingLoad: TrainingLoadResult
  currentPhase:        PeriodizationResult
}

// ─── Output type ──────────────────────────────────────────────────────────────

export interface RacePredictionEngineResult {
  predictedTimeSeconds:    number
  predictedTimeFormatted:  string        // "H:MM:SS"
  confidenceLow:           number        // optimistic bound (fewer seconds = faster)
  confidenceLowFormatted:  string
  confidenceHigh:          number        // pessimistic bound (more seconds = slower)
  confidenceHighFormatted: string
  confidenceScore:         number        // 0–100
  gapToGoalSeconds:        number | null // positive = behind goal, negative = ahead
  gapToGoalFormatted:      string        // "2:34 behind goal pace" or "3:21 ahead of goal pace"
  explanation:             string
  whatNeedsToHappen:       string
  dataQualityNotes:        string[]
  bestEffortActivity: {
    date:          string   // "YYYY-MM-DD"
    distanceKm:    number
    paceFormatted: string   // "M:SS/km"
    workoutType:   string
  } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RIEGEL_EXPONENT           = 1.06

const QUALIFYING_TYPES          = new Set(['TEMPO', 'LONG_RUN', 'RACE'])
const MIN_QUALIFY_DISTANCE_M    = 5000

// Confidence band — multiplicative adjustments on base ±4 %
const BAND_BASE                 = 0.04
const BAND_WIDEN_SHORT_EFFORT   = 1.15   // × factor when best effort < 8 km
const BAND_NARROW_CONSISTENT    = 0.90   // × factor when last 4 wks all > 200 load
const BAND_NARROW_TAPER         = 0.95   // × factor in taper + ≤ 21 days to race

const CONSISTENT_LOAD_THRESHOLD = 200    // TRIMP per week
const TAPER_DAYS_THRESHOLD      = 21

// Confidence score
const SCORE_BASE                = 70
const SCORE_LONG_EFFORT_BONUS   = 15   // best effort ≥ 10 km
const SCORE_CONSISTENT_BONUS    = 10   // last 4 weeks all > 200 load
const SCORE_SHORT_EFFORT_PENALTY  = 20 // best effort < 8 km
const SCORE_FEW_ACTIVITIES_PENALTY = 10 // fewer than 3 qualifying activities
const SCORE_CAP                 = 95
const SCORE_FLOOR               = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r0(n: number): number { return Math.round(n) }

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—'
  const s = r0(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60)
  const s = r0(secPerKm) % 60
  return `${m}:${String(s).padStart(2, '0')}/km`
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)  // "YYYY-MM-DD" UTC
}

// ─── Gap formatter ────────────────────────────────────────────────────────────

function buildGapString(gap: number | null): string {
  if (gap === null) return '—'
  if (gap === 0)    return 'exactly on goal pace'
  const abs = Math.abs(gap)
  const m   = Math.floor(abs / 60)
  const s   = abs % 60
  const timeStr = `${m}:${String(s).padStart(2, '0')}`
  return gap > 0
    ? `${timeStr} behind goal pace`
    : `${timeStr} ahead of goal pace`
}

// ─── whatNeedsToHappen builder ────────────────────────────────────────────────

function buildWhatNeedsToHappen(
  gap:              number | null,
  goalTimeSeconds:  number | null,
  goalDistanceM:    number,
  phase:            PeriodizationResult,
  confidenceScore:  number,
  qualifyingCount:  number,
): string {
  if (gap === null) {
    return 'Set a goal time to unlock gap analysis and see what pace you need on race day.'
  }

  const phaseAdvice: Record<string, string> = {
    BASE:         'Aerobic base development is the priority now — speed comes later.',
    BUILD:        'The build phase is the right time to sharpen race-pace fitness with tempo and threshold sessions.',
    PEAK:         'Peak phase: race-specific sessions are the priority. Protect recovery between hard efforts.',
    TAPER:        'The hay is in the barn. Trust the taper and focus on race-day execution.',
    RECOVERY:     'Recovery phase: protect this week. Fitness is preserved during planned rest.',
    UNSTRUCTURED: 'Follow the training plan to build race-specific fitness.',
  }
  const phaseNote = phaseAdvice[phase.phase] ?? ''

  const lowConfidenceNote = confidenceScore < 50
    ? ' Complete more qualifying sessions (tempo, long run, or race of ≥ 5 km) to sharpen the estimate.'
    : ''
  const fewActivitiesNote = qualifyingCount < 3
    ? ' More qualifying activities will improve estimate accuracy.'
    : ''

  if (gap <= 0) {
    const absGap  = Math.abs(gap)
    const cushion = gap === 0 ? 'exactly on target' : `${buildGapString(gap)}`
    return (
      `Current projected finish is ${cushion} — you are on track. ` +
      `${phaseNote}` +
      `${lowConfidenceNote || fewActivitiesNote || ' Maintain consistency through race day.'}`
    ).trim()
  }

  // Athlete is behind goal — compute pace improvement needed per km
  const distanceKm = goalDistanceM / 1000
  const paceGapSecPerKm = gap / distanceKm
  const paceGapM  = Math.floor(paceGapSecPerKm / 60)
  const paceGapS  = r0(paceGapSecPerKm) % 60
  const paceGapStr = paceGapM > 0
    ? `${paceGapM}:${String(paceGapS).padStart(2, '0')}/km`
    : `${r0(paceGapSecPerKm)} sec/km`

  const goalPaceSecPerKm = goalTimeSeconds !== null
    ? goalTimeSeconds / distanceKm
    : 0
  const goalPaceStr = formatPace(r0(goalPaceSecPerKm))

  return (
    `To hit the goal, target ~${goalPaceStr} average race pace — that's ~${paceGapStr} ` +
    `faster per km than the current projected finish. ` +
    `${phaseNote}` +
    `${lowConfidenceNote || fewActivitiesNote}`
  ).trim()
}

// ─── No-data fallback result ──────────────────────────────────────────────────

function noDataResult(goalRace: GoalRace): RacePredictionEngineResult {
  return {
    predictedTimeSeconds:    0,
    predictedTimeFormatted:  '—',
    confidenceLow:           0,
    confidenceLowFormatted:  '—',
    confidenceHigh:          0,
    confidenceHighFormatted: '—',
    confidenceScore:         SCORE_FLOOR,
    gapToGoalSeconds:        null,
    gapToGoalFormatted:      '—',
    explanation:
      `No qualifying activities (TEMPO, LONG_RUN, or RACE ≥ ${MIN_QUALIFY_DISTANCE_M / 1000} km) ` +
      `found in the last 8 weeks. Cannot generate a projected finish for ${goalRace.raceName}.`,
    whatNeedsToHappen:
      `Complete at least one tempo run, long run, or race of ${MIN_QUALIFY_DISTANCE_M / 1000} km ` +
      `or more to generate an estimated trajectory.`,
    dataQualityNotes: [
      `No qualifying activities found in the last 8 weeks. ` +
      `A minimum of 1 activity is required; 3 or more improves reliability.`,
    ],
    bestEffortActivity: null,
  }
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export function predictRaceTime(input: RacePredictionInput): RacePredictionEngineResult {
  const { goalRace, recentActivities, weeklySummaries, currentTrainingLoad, currentPhase } = input

  // ── Filter qualifying activities ─────────────────────────────────────────
  const qualifying = recentActivities.filter(a =>
    QUALIFYING_TYPES.has(a.workoutType) &&
    a.distanceMeters >= MIN_QUALIFY_DISTANCE_M,
  )

  if (qualifying.length === 0) {
    return noDataResult(goalRace)
  }

  // ── Best effort: lowest avgPaceSecPerKm ───────────────────────────────────
  const bestEffort = qualifying.reduce((best, a) =>
    a.avgPaceSecPerKm < best.avgPaceSecPerKm ? a : best,
  )

  // ── Last 4 weeks consistency check ───────────────────────────────────────
  const sorted4 = [...weeklySummaries]
    .sort((a, b) => b.weekNumber - a.weekNumber)
    .slice(0, 4)
  const allLast4Consistent =
    sorted4.length === 4 && sorted4.every(w => w.totalLoad > CONSISTENT_LOAD_THRESHOLD)

  // ── Riegel base ───────────────────────────────────────────────────────────
  const t1 = bestEffort.movingTimeSeconds
  const d1 = bestEffort.distanceMeters
  const d2 = goalRace.distanceMeters
  const rawRiegel = t1 * Math.pow(d2 / d1, RIEGEL_EXPONENT)

  // ── Adjustments ───────────────────────────────────────────────────────────
  const tsb = currentTrainingLoad.tsb
  let timeMultiplier = 1.0
  const adjustmentNotes: string[] = []

  // 1. Fatigue (mutually exclusive TSB bands)
  if (tsb < -10) {
    timeMultiplier *= 1.02
    adjustmentNotes.push(`fatigue (+2 %, TSB ${tsb.toFixed(1)})`)
  } else if (tsb > 5) {
    timeMultiplier *= 0.98
    adjustmentNotes.push(`freshness (−2 %, TSB ${tsb.toFixed(1)})`)
  }

  // 2. Taper bonus (independent — can stack with fatigue adjustment)
  const isTaper =
    currentPhase.phase === 'TAPER' && currentPhase.daysUntilRace < TAPER_DAYS_THRESHOLD
  if (isTaper) {
    timeMultiplier *= 0.99
    adjustmentNotes.push(`taper bonus (−1 %, race in ${currentPhase.daysUntilRace} days)`)
  }

  const predictedTimeSeconds = r0(rawRiegel * timeMultiplier)

  // ── Confidence band (multiplicative adjustments on base ±4 %) ─────────────
  const dataQualityNotes: string[] = []
  let bandFactor = BAND_BASE

  if (bestEffort.distanceMeters < 8000) {
    bandFactor *= BAND_WIDEN_SHORT_EFFORT
    dataQualityNotes.push(
      `Best qualifying effort is ${(bestEffort.distanceMeters / 1000).toFixed(1)} km — ` +
      `under 8 km. Confidence range is wider due to the high extrapolation ratio to ` +
      `${(d2 / 1000).toFixed(1)} km.`,
    )
  }
  if (allLast4Consistent) {
    bandFactor *= BAND_NARROW_CONSISTENT
  }
  if (isTaper) {
    bandFactor *= BAND_NARROW_TAPER
  }

  // confidenceLow < predictedTime < confidenceHigh is guaranteed by construction
  const confidenceLow  = r0(predictedTimeSeconds * (1 - bandFactor))
  const confidenceHigh = r0(predictedTimeSeconds * (1 + bandFactor))

  // ── Confidence score ──────────────────────────────────────────────────────
  let score = SCORE_BASE
  if (bestEffort.distanceMeters >= 10000)  score += SCORE_LONG_EFFORT_BONUS
  else if (bestEffort.distanceMeters < 8000) score -= SCORE_SHORT_EFFORT_PENALTY
  if (allLast4Consistent)                  score += SCORE_CONSISTENT_BONUS
  if (qualifying.length < 3)               score -= SCORE_FEW_ACTIVITIES_PENALTY

  const confidenceScore = Math.min(SCORE_CAP, Math.max(SCORE_FLOOR, score))

  // ── Gap to goal ───────────────────────────────────────────────────────────
  const gapToGoalSeconds = goalRace.goalTimeSeconds !== null
    ? predictedTimeSeconds - goalRace.goalTimeSeconds
    : null

  // ── Explanation ───────────────────────────────────────────────────────────
  const distKm  = (bestEffort.distanceMeters / 1000).toFixed(1)
  const pace    = formatPace(bestEffort.avgPaceSecPerKm)
  const dateStr = formatDate(bestEffort.startedAt)
  const typeStr = bestEffort.workoutType.toLowerCase().replace('_', ' ')

  let explanation =
    `Projected finish estimated from your ${typeStr} on ${dateStr} ` +
    `(${distKm} km at ${pace}). The Riegel formula extrapolates this effort ` +
    `to ${(d2 / 1000).toFixed(1)} km.`

  if (adjustmentNotes.length > 0) {
    explanation += ` Applied: ${adjustmentNotes.join(', ')}.`
  }
  explanation +=
    ` Estimated trajectory based on current training data — ` +
    `confidence range: ${formatTime(confidenceLow)}–${formatTime(confidenceHigh)}.`

  // ── What needs to happen ──────────────────────────────────────────────────
  const whatNeedsToHappen = buildWhatNeedsToHappen(
    gapToGoalSeconds,
    goalRace.goalTimeSeconds,
    d2,
    currentPhase,
    confidenceScore,
    qualifying.length,
  )

  return {
    predictedTimeSeconds,
    predictedTimeFormatted:  formatTime(predictedTimeSeconds),
    confidenceLow,
    confidenceLowFormatted:  formatTime(confidenceLow),
    confidenceHigh,
    confidenceHighFormatted: formatTime(confidenceHigh),
    confidenceScore,
    gapToGoalSeconds,
    gapToGoalFormatted:      buildGapString(gapToGoalSeconds),
    explanation,
    whatNeedsToHappen,
    dataQualityNotes,
    bestEffortActivity: {
      date:          dateStr,
      distanceKm:    Math.round(bestEffort.distanceMeters / 100) / 10,
      paceFormatted: pace,
      workoutType:   bestEffort.workoutType,
    },
  }
}
