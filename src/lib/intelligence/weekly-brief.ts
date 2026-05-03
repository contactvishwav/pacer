// ─── Weekly coaching brief generator ──────────────────────────────────────────
//
// Generates a deterministic weekly brief from computed signals — no Claude call.
// Claude can narrativize this in the coach chat, but the brief itself works
// without any AI. This guarantees the brief is always available.
//
// The brief answers five coaching questions:
//   1. What did the athlete actually do last week?        → lastWeekReview
//   2. What should they do this week?                    → thisWeekPrescription
//   3. What is the single most important signal?         → keySignal
//   4. Are there any warnings to surface?                → warnings
//   5. What should they focus on?                        → suggestedFocus
//
// Key signal priority order:
//   1. Injury-risk caution/high-risk (overrides everything)
//   2. Gap to goal > 5 min behind
//   3. CTL declining
//   4. TAPER phase (race approach readiness)
//   5. Default: TSB form status
//
// Prescription override: caution/high-risk injury signal forces
//   recovery-first messaging regardless of the calendar phase.

import type { WeeklyTrainingSummary } from '@prisma/client'
import type { InjuryRiskResult } from './injury-risk'
import type { PeriodizationResult } from './periodization'
import type { TrainingLoadResult } from './training-load'
import type { RacePredictionEngineResult, ActivityWithClassification, GoalRace } from './race-prediction'
import type { WeeklyBriefResult } from '../schemas/intelligence'

// ─── Input type ───────────────────────────────────────────────────────────────

export interface WeeklyBriefInput {
  recentWeeklySummaries:      WeeklyTrainingSummary[]         // last 4 weeks, most recent last
  currentInjuryRisk:          InjuryRiskResult
  currentPhase:               PeriodizationResult
  currentTrainingLoad:        TrainingLoadResult
  racePrediction:             RacePredictionEngineResult
  goalRace:                   GoalRace
  recentClassifiedActivities: ActivityWithClassification[]   // last 2 weeks
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r0(n: number): number { return Math.round(n) }
function r1(n: number): number { return Math.round(n * 10) / 10 }

function formatGapTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── lastWeekReview builder ───────────────────────────────────────────────────

function buildLastWeekReview(
  summaries:        WeeklyTrainingSummary[],
  injuryRisk:       InjuryRiskResult,
  recentActivities: ActivityWithClassification[],
): string[] {
  if (summaries.length === 0) {
    return [
      'No training data available for last week.',
      'Continue following your training plan.',
    ]
  }

  const current = summaries[summaries.length - 1]
  const prior   = summaries.length > 1 ? summaries[summaries.length - 2] : null
  const bullets: string[] = []

  // 1. Total load vs prior week
  if (prior !== null && prior.totalLoad > 0) {
    const pct = Math.abs(r0(((current.totalLoad - prior.totalLoad) / prior.totalLoad) * 100))
    const dir = current.totalLoad >= prior.totalLoad ? 'up' : 'down'
    bullets.push(
      `Logged ${r0(current.totalLoad)} TRIMP — ${pct}% ${dir} from the prior week ` +
      `(${r0(prior.totalLoad)} TRIMP).`,
    )
  } else {
    bullets.push(`Logged ${r0(current.totalLoad)} TRIMP total training load.`)
  }

  // 2. Activity count and quality sessions
  const qCount = current.qualitySessionCount
  const qStr   = qCount > 0
    ? `, including ${qCount} quality session${qCount !== 1 ? 's' : ''}`
    : ', with no quality sessions'
  bullets.push(
    `Completed ${current.activityCount} workout${current.activityCount !== 1 ? 's' : ''}${qStr}.`,
  )

  // 3. ACWR if available and not optimal (caution, high-risk, or underload)
  const cat = injuryRisk.category
  if (
    injuryRisk.acwr !== null &&
    cat !== 'optimal' &&
    cat !== 'insufficient-data'
  ) {
    const label =
      cat === 'high-risk' ? 'a higher-risk pattern'
      : cat === 'caution' ? 'the caution range — a training-load spike signal'
      : 'below the optimal range (recovery or taper pattern)'
    bullets.push(`ACWR this week was ${injuryRisk.acwr.toFixed(2)} — in ${label}.`)
  }

  // 4. Execution quality from last 2 weeks' activities
  const tooHard      = recentActivities.filter(a => a.executionEvaluation === 'TOO_HARD').length
  const wellExecuted = recentActivities.filter(a => a.executionEvaluation === 'WELL_EXECUTED').length

  if (tooHard > 0) {
    bullets.push(
      `${tooHard} session${tooHard !== 1 ? 's' : ''} ran too hard — ` +
      `heart rate exceeded the easy ceiling on what were planned as easy efforts.`,
    )
  } else if (wellExecuted > 0) {
    bullets.push(
      `${wellExecuted} quality session${wellExecuted !== 1 ? 's' : ''} well executed — ` +
      `heart rate and pace matched the prescribed effort.`,
    )
  }

  // Guarantee minimum of 2 bullets
  if (bullets.length < 2) bullets.push('Continue building training consistency.')

  return bullets.slice(0, 4)
}

// ─── thisWeekPrescription builder ────────────────────────────────────────────

function buildPrescription(
  phase:     PeriodizationResult,
  injury:    InjuryRiskResult,
  summaries: WeeklyTrainingSummary[],
): string[] {
  // Injury override — regardless of phase
  if (injury.category === 'caution' || injury.category === 'high-risk') {
    return [
      'Training-load spike detected — reduce all session intensity and volume this week.',
      'No quality sessions (tempo, threshold, intervals) until the workload risk signal normalizes.',
      'Keep all runs easy: heart rate below your easy zone ceiling for every session.',
      'Prioritize rest days and full recovery before resuming progressive training.',
    ]
  }

  const current = summaries.length > 0 ? summaries[summaries.length - 1] : null

  switch (phase.phase) {
    case 'TAPER':    return buildTaperPrescription(phase)
    case 'PEAK':     return buildPeakPrescription(summaries)
    case 'BUILD':    return buildBuildPrescription(current)
    case 'RECOVERY': return buildRecoveryPrescription()
    default:         return buildBasePrescription(current)  // BASE + UNSTRUCTURED
  }
}

function buildTaperPrescription(phase: PeriodizationResult): string[] {
  const bullets = [
    'Reduce total volume by 20–30% from last week — shorter runs, same or fewer sessions.',
    'Include one short quality session: 3–4 × 1 km at goal race pace with full recovery between reps.',
    'Prioritize sleep (8+ hours), hydration, and race-day nutrition practice.',
    'Avoid trying new shoes, routes, or foods this close to race day — trust what has worked.',
  ]
  // Final week: include all 4 bullets for maximum detail
  return phase.daysUntilRace <= 7 ? bullets : bullets.slice(0, 3)
}

function buildPeakPrescription(summaries: WeeklyTrainingSummary[]): string[] {
  const avgQuality = summaries.length > 0
    ? Math.round(summaries.reduce((s, w) => s + w.qualitySessionCount, 0) / summaries.length)
    : 2
  const qTarget = Math.min(Math.max(avgQuality, 2), 3)
  return [
    `Maintain high-quality density: target ${qTarget} quality session${qTarget !== 1 ? 's' : ''} this week (interval, tempo, or threshold).`,
    'Protect recovery between hard sessions — at least one full easy day between each quality effort.',
    'Race-specific intensity is the priority: include one session at goal race pace or faster.',
    'Avoid adding new volume — load is at its peak, the goal now is quality and race specificity.',
  ]
}

function buildBuildPrescription(summary: WeeklyTrainingSummary | null): string[] {
  const lastLoad  = summary?.totalLoad ?? 0
  const targetStr = lastLoad > 0 ? `around ${r0(lastLoad * 1.08)} TRIMP (a 5–10% step-up)` : 'modestly more than last week'
  return [
    `Increase load modestly — target ${targetStr}.`,
    'Include one tempo run: 25–40 min at lactate-threshold pace (comfortably hard, controlled breathing).',
    'Complete your weekly long run — extend by 1–2 km from last week if energy permits.',
    'Monitor fatigue: if TSB drops below −15, insert an easy day before the next quality session.',
  ]
}

function buildRecoveryPrescription(): string[] {
  return [
    'Easy runs only this week — no tempo, threshold, or interval sessions.',
    'Keep heart rate below your easy zone ceiling for every session.',
    'Let your ACWR ratio come back to the optimal range (0.8–1.3) before adding load.',
    'If any session feels harder than expected, cut it short without hesitation.',
  ]
}

function buildBasePrescription(summary: WeeklyTrainingSummary | null): string[] {
  const targetCount = summary?.activityCount ?? 4
  return [
    'Keep all easy runs genuinely easy — heart rate at or below your easy zone ceiling for the full effort.',
    `Aim for ${targetCount} sessions this week, prioritizing consistency over intensity.`,
    'Introduce quality work only when rested: one optional tempo or strides session if TSB is above 0.',
    'Focus on aerobic base development — volume and consistency now will pay off in the build phase.',
  ]
}

// ─── keySignal builder ────────────────────────────────────────────────────────

function buildKeySignal(
  injury:  InjuryRiskResult,
  pred:    RacePredictionEngineResult,
  load:    TrainingLoadResult,
  phase:   PeriodizationResult,
): string {
  // Priority 1 — injury risk spike
  if (injury.category === 'caution' || injury.category === 'high-risk') {
    const acwrNote = injury.acwr !== null ? ` (ACWR ${injury.acwr.toFixed(2)})` : ''
    return (
      `Training-load spike signal detected${acwrNote} — this week's load is significantly above ` +
      `your 4-week chronic average. Prioritize recovery before adding more volume.`
    )
  }

  // Priority 2 — gap to goal > 5 min behind
  if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds > 300) {
    return (
      `Projected finish is ${formatGapTime(pred.gapToGoalSeconds)} behind your goal — ` +
      `targeted tempo sessions will build the race-pace fitness needed to close this gap.`
    )
  }

  // Priority 3 — CTL declining
  if (load.trend === 'declining') {
    return (
      `Fitness (CTL ${r1(load.ctl)}) is declining — ` +
      `consistency this week is important to arrest the trend and rebuild your aerobic base.`
    )
  }

  // Priority 4 — TAPER (race is close)
  if (phase.phase === 'TAPER') {
    return (
      `Race is ${phase.daysUntilRace} days away — fitness is locked in. ` +
      `Trust the taper, stay fresh, and focus on race-day execution.`
    )
  }

  // Default — TSB form status
  const tsb    = load.tsb
  const status =
    tsb > 10  ? 'fresh and well-recovered'
    : tsb > 0 ? 'well-balanced'
    : tsb > -10 ? 'moderately fatigued'
    : 'carrying significant accumulated fatigue'
  return (
    `Training Stress Balance (TSB ${r1(tsb)}) indicates you are currently ${status}. ` +
    `${load.explanation}`
  )
}

// ─── warnings builder ─────────────────────────────────────────────────────────

function buildWarnings(
  injury:  InjuryRiskResult,
  pred:    RacePredictionEngineResult,
  load:    TrainingLoadResult,
  phase:   PeriodizationResult,
): string[] {
  const warnings: string[] = []

  if (injury.category === 'caution' || injury.category === 'high-risk') {
    const acwrNote = injury.acwr !== null ? ` (ACWR ${injury.acwr.toFixed(2)})` : ''
    warnings.push(
      `Training-load spike${acwrNote} in the ${injury.category} range — ` +
      `reduce load before the next hard session.`,
    )
  }

  if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds > 600) {
    warnings.push(
      `Current trajectory is ${formatGapTime(pred.gapToGoalSeconds)} behind goal — ` +
      `significant race-pace improvement is needed.`,
    )
  }

  if (load.tsb < -15) {
    warnings.push(
      `TSB of ${r1(load.tsb)} indicates heavy fatigue — a recovery day is strongly recommended.`,
    )
  }

  if (phase.daysUntilRace > 0 && phase.daysUntilRace <= 14) {
    warnings.push(
      `Race day is ${phase.daysUntilRace} days away — prioritize sleep, hydration, and race-day logistics.`,
    )
  }

  return warnings.slice(0, 2)
}

// ─── suggestedFocus builder ───────────────────────────────────────────────────

function buildSuggestedFocus(
  injury:  InjuryRiskResult,
  pred:    RacePredictionEngineResult,
  load:    TrainingLoadResult,
  phase:   PeriodizationResult,
): string {
  if (injury.category === 'caution' || injury.category === 'high-risk') {
    return (
      'The priority this week is bringing your training-load spike signal down — ' +
      'no hard sessions until the workload risk returns to the optimal range.'
    )
  }

  if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds > 300) {
    return (
      'Focus on consistent quality sessions to build race-pace fitness — ' +
      'the gap to your goal is closeable with targeted tempo work this week.'
    )
  }

  if (phase.phase === 'TAPER') {
    if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds <= 0) {
      return 'You are on track for your goal — stay consistent and trust the taper.'
    }
    return `Race is ${phase.daysUntilRace} days away — reduce volume, stay sharp, and trust your preparation.`
  }

  if (phase.phase === 'PEAK') {
    return 'Focus on quality over quantity this week — your fitness is there, protect it with adequate recovery.'
  }

  if (phase.phase === 'BUILD') {
    return 'Continue progressive build this week — one tempo and one long run are the session priorities.'
  }

  if (phase.phase === 'RECOVERY') {
    return 'Protect recovery this week — easy efforts only, let your body absorb the recent training load.'
  }

  // BASE / UNSTRUCTURED / default
  if (load.tsb < -10) {
    return 'Consistency is the priority this week — keep efforts easy and let accumulated fatigue clear before adding intensity.'
  }
  return 'Build your aerobic base with consistent zone-2 running and gradual volume progression this week.'
}

// ─── Main function ────────────────────────────────────────────────────────────

export function generateWeeklyBrief(input: WeeklyBriefInput): WeeklyBriefResult {
  return {
    lastWeekReview: buildLastWeekReview(
      input.recentWeeklySummaries,
      input.currentInjuryRisk,
      input.recentClassifiedActivities,
    ),
    thisWeekPrescription: buildPrescription(
      input.currentPhase,
      input.currentInjuryRisk,
      input.recentWeeklySummaries,
    ),
    keySignal: buildKeySignal(
      input.currentInjuryRisk,
      input.racePrediction,
      input.currentTrainingLoad,
      input.currentPhase,
    ),
    warnings: buildWarnings(
      input.currentInjuryRisk,
      input.racePrediction,
      input.currentTrainingLoad,
      input.currentPhase,
    ),
    suggestedFocus: buildSuggestedFocus(
      input.currentInjuryRisk,
      input.racePrediction,
      input.currentTrainingLoad,
      input.currentPhase,
    ),
  }
}
