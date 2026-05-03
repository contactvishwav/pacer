import { createHash } from 'crypto'

// ─── Version ──────────────────────────────────────────────────────────────────

export const DEMO_VERSION = '1.1.1'

// Fixed reference date — must NOT use new Date() so output is always identical.
// All activity dates are computed backwards from this Saturday.
const REF_DATE = new Date('2026-05-02T00:00:00Z')

// ─── Athlete constants ────────────────────────────────────────────────────────

export const DEMO_ATHLETE = {
  name: 'Alex Chen',
  email: 'alex@pacer.demo',
  restingHeartRate: 52,
  maxHeartRate: 185,
  thresholdHeartRate: 170,
  easyHrCeiling: 145,
  preferredUnit: 'KM' as const,
  timezone: 'America/Los_Angeles',
}

export const DEMO_RACE = {
  name: 'SF Half Marathon',
  date: new Date('2026-08-02T15:00:00Z'), // 08:00 PDT
  distanceMeters: 21097,
  goalTimeSeconds: 6900, // 1:55:00
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkoutType =
  | 'EASY' | 'RECOVERY' | 'STEADY_STATE' | 'TEMPO'
  | 'THRESHOLD' | 'INTERVAL' | 'LONG_RUN' | 'RACE' | 'UNKNOWN'

export type TrainingPhase =
  | 'BASE' | 'BUILD' | 'PEAK' | 'TAPER' | 'RECOVERY' | 'UNSTRUCTURED'

export interface LapData {
  lapNumber: number
  distanceMeters: number
  durationSeconds: number
  avgPaceSecPerKm: number
  avgHeartRate: number | null
  maxHeartRate: number | null
  avgCadence: number | null
  isRest: boolean
}

export interface ActivityData {
  source: 'GENERATED'
  startedAt: Date
  distanceMeters: number
  durationSeconds: number
  movingTimeSeconds: number
  elevationGainMeters: number
  avgPaceSecPerKm: number
  avgHeartRate: number
  maxHeartRate: number
  avgCadence: number
  calories: number
  trainingLoad: number
  workoutType: WorkoutType
  workoutTypeConfidence: number
  workoutTypeExplanation: string
  executionEvaluation: string
  intendedWorkoutType: WorkoutType
  trainingPhase: TrainingPhase
  trainingWeek: number
  hasGps: boolean
  laps: LapData[]
}

export interface WeeklySummaryData {
  weekStartDate: Date
  weekNumber: number
  totalDistanceMeters: number
  totalDurationSeconds: number
  totalMovingTimeSeconds: number
  activityCount: number
  totalLoad: number
  avgHeartRate: number
  longRunDistanceMeters: number
  qualitySessionCount: number
  ctl: number
  atl: number
  tsb: number
  acwr: number
  trainingPhase: TrainingPhase
  phaseRationale: string
}

export interface WeeklyBriefData {
  weekStartDate: Date
  weekNumber: number
  trainingPhase: TrainingPhase
  acwr: number
  projectedTimeSeconds: number | null
  gapToGoalSeconds: number | null
  phaseNote: string
  keyWorkoutNote: string
  riskNote: string
  priorityNote: string
  trajectoryNote: string
}

export interface DemoPlan {
  activities: ActivityData[]
  weeklySummaries: WeeklySummaryData[]
  weeklyBriefs: WeeklyBriefData[]
  seedHash: string
  version: string
}

// ─── Deterministic PRNG (mulberry32, seed=42) ─────────────────────────────────

function makePrng(seed: number): () => number {
  let s = seed
  return () => {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// One shared instance — callers consume in deterministic order.
const rng = makePrng(42)

function jitter(base: number, spread: number): number {
  return Math.round(base + (rng() - 0.5) * 2 * spread)
}

function jitterF(base: number, spread: number): number {
  return base + (rng() - 0.5) * 2 * spread
}

// ─── Workout characteristics ──────────────────────────────────────────────────

const INTENSITY_FACTOR: Record<WorkoutType, number> = {
  RECOVERY:     1.0,
  EASY:         1.5,
  STEADY_STATE: 2.0,
  TEMPO:        2.5,
  THRESHOLD:    3.0,
  INTERVAL:     3.0,
  LONG_RUN:     1.5,
  RACE:         3.5,
  UNKNOWN:      1.5,
}

// Base pace (seconds/km) for each workout type — Alex Chen level fitness
const BASE_PACE: Record<WorkoutType, number> = {
  RECOVERY:     455,
  EASY:         400,
  STEADY_STATE: 370,
  TEMPO:        323,
  THRESHOLD:    300,
  INTERVAL:     285, // work rep pace; overall avg is higher due to rest
  LONG_RUN:     405,
  RACE:         327, // goal pace
  UNKNOWN:      400,
}

const BASE_HR: Record<WorkoutType, number> = {
  RECOVERY:     125,
  EASY:         138,
  STEADY_STATE: 155,
  TEMPO:        166,
  THRESHOLD:    173,
  INTERVAL:     162, // blended work+rest avg
  LONG_RUN:     140,
  RACE:         168,
  UNKNOWN:      140,
}

const BASE_MAX_HR: Record<WorkoutType, number> = {
  RECOVERY:     133,
  EASY:         150,
  STEADY_STATE: 163,
  TEMPO:        174,
  THRESHOLD:    181,
  INTERVAL:     179,
  LONG_RUN:     154,
  RACE:         178,
  UNKNOWN:      152,
}

const BASE_CADENCE: Record<WorkoutType, number> = {
  RECOVERY:     163,
  EASY:         169,
  STEADY_STATE: 172,
  TEMPO:        175,
  THRESHOLD:    178,
  INTERVAL:     178,
  LONG_RUN:     168,
  RACE:         176,
  UNKNOWN:      170,
}

// ─── Lap generator ────────────────────────────────────────────────────────────

function easyLap(n: number, distM: number, pace: number, hr: number, maxHr: number, cad: number): LapData {
  return {
    lapNumber: n,
    distanceMeters: distM,
    durationSeconds: Math.round((distM / 1000) * pace),
    avgPaceSecPerKm: pace,
    avgHeartRate: hr,
    maxHeartRate: maxHr,
    avgCadence: cad,
    isRest: false,
  }
}

function buildLaps(
  type: WorkoutType,
  distKm: number,
  avgPace: number,
  avgHr: number,
  maxHr: number,
  cad: number,
): LapData[] {
  const easyPace = jitter(BASE_PACE.EASY, 8)
  const easyHr   = jitter(BASE_HR.EASY, 3)

  if (type === 'EASY' || type === 'RECOVERY' || type === 'STEADY_STATE') {
    return [easyLap(1, distKm * 1000, avgPace, avgHr, maxHr, cad)]
  }

  if (type === 'LONG_RUN') {
    const half = (distKm * 1000) / 2
    return [
      easyLap(1, half, avgPace, avgHr - 3, maxHr - 5, cad - 1),
      easyLap(2, half, avgPace + 5, avgHr + 3, maxHr, cad + 1),
    ]
  }

  if (type === 'TEMPO' || type === 'THRESHOLD') {
    const warmupM = 2000
    const mainM   = distKm * 1000 - warmupM
    return [
      easyLap(1, warmupM, easyPace, easyHr, easyHr + 12, cad - 6),
      easyLap(2, mainM, avgPace, avgHr, maxHr, cad),
    ]
  }

  if (type === 'INTERVAL') {
    // Structure: warmup(1.5km) + N work reps + (N-1) jog rests + cooldown
    // 7km → 4×1km work; 8km → 5×800m work
    const laps: LapData[] = []
    let lapNum = 1

    const warmupM = 1500
    laps.push(easyLap(lapNum++, warmupM, easyPace, easyHr, easyHr + 10, cad - 6))

    const useShortRep = distKm >= 8
    const repDist  = useShortRep ? 800  : 1000
    const restDist = useShortRep ? 350  : 333
    const nReps    = useShortRep ? 5    : 4
    const workPace  = jitter(BASE_PACE.INTERVAL, 5)
    const workHr    = jitter(181, 3)
    const restPace  = jitter(430, 10)
    const restHr    = jitter(138, 4)

    for (let i = 0; i < nReps; i++) {
      laps.push({
        lapNumber: lapNum++,
        distanceMeters: repDist,
        durationSeconds: Math.round((repDist / 1000) * workPace),
        avgPaceSecPerKm: workPace,
        avgHeartRate: workHr,
        maxHeartRate: jitter(workHr + 8, 2),
        avgCadence: jitter(180, 2),
        isRest: false,
      })
      if (i < nReps - 1) {
        laps.push({
          lapNumber: lapNum++,
          distanceMeters: restDist,
          durationSeconds: Math.round((restDist / 1000) * restPace),
          avgPaceSecPerKm: restPace,
          avgHeartRate: restHr,
          maxHeartRate: jitter(restHr + 10, 3),
          avgCadence: jitter(162, 3),
          isRest: true,
        })
      }
    }

    // Cooldown: whatever distance remains
    const usedM = warmupM + nReps * repDist + (nReps - 1) * restDist
    const coolM  = Math.max(200, distKm * 1000 - usedM)
    laps.push(easyLap(lapNum, coolM, easyPace + 10, easyHr - 5, easyHr + 5, cad - 8))
    return laps
  }

  return [easyLap(1, distKm * 1000, avgPace, avgHr, maxHr, cad)]
}

// ─── Activity builder ─────────────────────────────────────────────────────────

interface WorkoutSpec {
  weekNumber: number
  weekStartDate: Date
  phase: TrainingPhase
  dow: number           // 0=Mon … 6=Sun
  type: WorkoutType
  distKm: number
  executedTooHard?: boolean  // easy run above easy HR ceiling
  extraRun?: boolean         // additional run causing load spike
}

function buildActivity(spec: WorkoutSpec): ActivityData {
  const { weekNumber, weekStartDate, phase, dow, type, distKm } = spec

  const startedAt = new Date(weekStartDate)
  startedAt.setUTCDate(startedAt.getUTCDate() + dow)
  startedAt.setUTCHours(13, 30, 0, 0) // 06:30 PDT

  let avgPace = jitter(BASE_PACE[type], 8)
  let avgHr   = jitter(BASE_HR[type], 4)
  const maxHr = jitter(BASE_MAX_HR[type], 4)
  const cad   = jitter(BASE_CADENCE[type], 3)

  // For interval workouts the overall pace is blended (work + rest avg)
  if (type === 'INTERVAL') {
    avgPace = jitter(340, 10)
    avgHr   = jitter(162, 4)
  }

  // The deliberate execution anomaly: easy run executed at steady-state effort
  const isMisexecuted = spec.executedTooHard === true
  if (isMisexecuted) {
    avgPace = jitter(370, 6)   // faster than easy
    avgHr   = 157              // fixed: >145+10 = exceeds easy ceiling by 12
  }

  const durationSec = Math.round(distKm * avgPace)
  const movingTime  = Math.round(durationSec * jitterF(0.99, 0.005))
  const elevation   = Math.round(distKm * jitterF(2.5, 1.0))
  const calories    = Math.round(distKm * 63 + durationSec / 60 * 1.5)

  const trainingLoad = (durationSec / 60) * INTENSITY_FACTOR[type]

  // Classifier output — in generated data we pre-populate what the classifier would produce.
  // executionEvaluation stores the canonical enum value so route logic (buildFollowUpQuestion)
  // can match against it directly. workoutTypeExplanation carries the human-readable rationale.
  let detectedType    = type
  let confidence      = jitterF(0.88, 0.06)
  let explanation     = classifierExplanation(type, avgHr, avgPace, distKm)
  let executionEnum   = 'MATCHED_INTENT'

  if (isMisexecuted) {
    detectedType  = 'STEADY_STATE'
    confidence    = 0.82
    // Combine classifier rationale + execution narrative so the full context
    // is available in workoutTypeExplanation (surfaced as classification.executionNote).
    explanation   = (
      `Average heart rate (${avgHr} bpm) and pace (${Math.floor(avgPace / 60)}:${String(avgPace % 60).padStart(2, '0')}/km) ` +
      `indicate a moderate aerobic effort (Zone 3), classified as steady state rather than easy. ` +
      `Run intended as easy (Zone 2) but executed above the easy HR ceiling of ${DEMO_ATHLETE.easyHrCeiling} bpm. ` +
      `Average HR was ${avgHr} bpm — ${avgHr - DEMO_ATHLETE.easyHrCeiling} bpm over ceiling.`
    )
    executionEnum = 'TOO_HARD'
  } else if (type === 'TEMPO' || type === 'THRESHOLD' || type === 'INTERVAL') {
    executionEnum = 'WELL_EXECUTED'
  }

  const laps = buildLaps(detectedType, distKm, avgPace, avgHr, maxHr, cad)

  return {
    source: 'GENERATED',
    startedAt,
    distanceMeters: distKm * 1000,
    durationSeconds: durationSec,
    movingTimeSeconds: movingTime,
    elevationGainMeters: elevation,
    avgPaceSecPerKm: avgPace,
    avgHeartRate: avgHr,
    maxHeartRate: maxHr,
    avgCadence: cad,
    calories,
    trainingLoad,
    workoutType: detectedType,
    workoutTypeConfidence: Math.min(0.99, Math.max(0.6, confidence)),
    workoutTypeExplanation: explanation,
    executionEvaluation: executionEnum,
    intendedWorkoutType: type,
    trainingPhase: phase,
    trainingWeek: weekNumber,
    hasGps: true,
    laps,
  }
}

function classifierExplanation(type: WorkoutType, hr: number, pace: number, distKm: number): string {
  const paceStr = `${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')}/km`
  switch (type) {
    case 'EASY':
      return `Average HR (${hr} bpm) and pace (${paceStr}) consistent with aerobic base effort (Zone 2). Distance ${distKm} km within easy run range.`
    case 'RECOVERY':
      return `Very low HR (${hr} bpm) and slow pace (${paceStr}) indicate active recovery effort.`
    case 'TEMPO':
      return `Sustained pace (${paceStr}) and elevated HR (${hr} bpm, near threshold) consistent with tempo effort.`
    case 'THRESHOLD':
      return `High sustained HR (${hr} bpm, at/above lactate threshold) and fast pace (${paceStr}) indicate threshold work.`
    case 'INTERVAL':
      return `Blended HR (${hr} bpm avg) and pace variation across laps indicate structured interval session with work/rest alternation.`
    case 'LONG_RUN':
      return `Extended distance (${distKm} km) at aerobic pace (${paceStr}) with steady HR (${hr} bpm) consistent with long aerobic run.`
    default:
      return `HR ${hr} bpm, pace ${paceStr} recorded.`
  }
}

// ─── Week schedule ────────────────────────────────────────────────────────────

// Week start dates, computed as: REF_DATE minus (12 - weekNum) * 7 days,
// then snapped to the preceding Monday.
function weekStartDate(weekNum: number): Date {
  const d = new Date(REF_DATE)
  d.setUTCDate(d.getUTCDate() - (12 - weekNum) * 7)
  // Snap to Monday (UTC)
  const dow = d.getUTCDay()
  const toMon = dow === 0 ? -6 : 1 - dow
  d.setUTCDate(d.getUTCDate() + toMon)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

type WeekDef = {
  weekNum: number
  phase: TrainingPhase
  workouts: Array<{
    dow: number
    type: WorkoutType
    distKm: number
    executedTooHard?: boolean
    extraRun?: boolean
  }>
}

const WEEK_DEFS: WeekDef[] = [
  // ── Weeks 1–3: BASE ──────────────────────────────────────────────────────
  { weekNum: 1, phase: 'BASE', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 2, type: 'EASY',     distKm:  9 },
    { dow: 5, type: 'LONG_RUN', distKm: 13 },
    { dow: 6, type: 'RECOVERY', distKm:  7 },
  ]},
  { weekNum: 2, phase: 'BASE', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 2, type: 'EASY',     distKm:  9 },
    { dow: 3, type: 'EASY',     distKm:  8 },
    { dow: 5, type: 'LONG_RUN', distKm: 14 },
  ]},
  { weekNum: 3, phase: 'BASE', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 2, type: 'EASY',     distKm:  9 },
    { dow: 4, type: 'EASY',     distKm:  8 },
    { dow: 5, type: 'LONG_RUN', distKm: 15 },
    { dow: 6, type: 'RECOVERY', distKm:  6 },
  ]},

  // ── Weeks 4–7: BUILD ────────────────────────────────────────────────────
  { weekNum: 4, phase: 'BUILD', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 1, type: 'INTERVAL', distKm:  7 },
    { dow: 3, type: 'TEMPO',    distKm:  8 },
    { dow: 5, type: 'LONG_RUN', distKm: 16 },
    // Sunday easy run — executed too hard (HR will be set to 157)
    { dow: 6, type: 'EASY',     distKm:  8, executedTooHard: true },
  ]},
  { weekNum: 5, phase: 'BUILD', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 1, type: 'INTERVAL', distKm:  7 },
    { dow: 3, type: 'TEMPO',    distKm:  8 },
    { dow: 5, type: 'LONG_RUN', distKm: 17 },
    { dow: 6, type: 'EASY',     distKm:  8 },
  ]},
  { weekNum: 6, phase: 'BUILD', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 1, type: 'INTERVAL', distKm:  8 },
    { dow: 3, type: 'TEMPO',    distKm:  9 },
    { dow: 5, type: 'LONG_RUN', distKm: 18 },
    { dow: 6, type: 'EASY',     distKm:  8 },
  ]},
  { weekNum: 7, phase: 'BUILD', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 2, type: 'EASY',     distKm:  9 },
    { dow: 3, type: 'TEMPO',    distKm:  9 },
    { dow: 4, type: 'INTERVAL', distKm:  8 },
    { dow: 5, type: 'LONG_RUN', distKm: 18 },
  ]},

  // ── Week 8: PEAK — deliberate load spike (6th run on Sunday) ────────────
  { weekNum: 8, phase: 'PEAK', workouts: [
    { dow: 0, type: 'EASY',      distKm: 10 },
    { dow: 1, type: 'INTERVAL',  distKm:  8 },
    { dow: 3, type: 'THRESHOLD', distKm:  9 },
    { dow: 4, type: 'EASY',      distKm: 10 },
    { dow: 5, type: 'LONG_RUN',  distKm: 22 },
    // Extra Sunday run — unplanned, pushes ACWR above 1.3
    { dow: 6, type: 'EASY',      distKm: 10, extraRun: true },
  ]},

  // ── Week 9: RECOVERY — ~40 % volume reduction ───────────────────────────
  { weekNum: 9, phase: 'RECOVERY', workouts: [
    { dow: 0, type: 'EASY',     distKm:  8 },
    { dow: 2, type: 'EASY',     distKm:  8 },
    { dow: 5, type: 'LONG_RUN', distKm: 13 },
  ]},

  // ── Week 10: BUILD — return to quality ──────────────────────────────────
  { weekNum: 10, phase: 'BUILD', workouts: [
    { dow: 0, type: 'EASY',     distKm: 10 },
    { dow: 1, type: 'INTERVAL', distKm:  8 },
    { dow: 3, type: 'TEMPO',    distKm:  9 },
    { dow: 5, type: 'LONG_RUN', distKm: 18 },
    { dow: 6, type: 'EASY',     distKm:  8 },
  ]},

  // ── Weeks 11–12: TAPER ──────────────────────────────────────────────────
  { weekNum: 11, phase: 'TAPER', workouts: [
    { dow: 0, type: 'EASY',     distKm:  8 },
    { dow: 3, type: 'TEMPO',    distKm:  7 },
    { dow: 4, type: 'EASY',     distKm:  6 },
    { dow: 5, type: 'LONG_RUN', distKm: 15 },
  ]},
  { weekNum: 12, phase: 'TAPER', workouts: [
    { dow: 0, type: 'EASY',     distKm:  6 },
    { dow: 3, type: 'TEMPO',    distKm:  5 },
    { dow: 5, type: 'EASY',     distKm: 10 },
  ]},
]

// ─── Weekly summary computation ───────────────────────────────────────────────

const EWA_CTL = Math.exp(-7 / 42) // ≈ 0.8465
const EWA_ATL = Math.exp(-7 / 7)  // ≈ 0.3679

function computeWeeklySummaries(
  activities: ActivityData[],
): WeeklySummaryData[] {
  const byWeek = new Map<number, ActivityData[]>()
  for (const act of activities) {
    const w = act.trainingWeek!
    if (!byWeek.has(w)) byWeek.set(w, [])
    byWeek.get(w)!.push(act)
  }

  const summaries: WeeklySummaryData[] = []
  let ctl = 0
  let atl = 0

  // Weekly loads in order, for rolling ACWR
  const weeklyLoads: number[] = []

  for (const def of WEEK_DEFS) {
    const wActs = byWeek.get(def.weekNum) ?? []
    const totalDist    = wActs.reduce((s, a) => s + a.distanceMeters, 0)
    const totalDur     = wActs.reduce((s, a) => s + a.durationSeconds, 0)
    const totalMoving  = wActs.reduce((s, a) => s + a.movingTimeSeconds, 0)
    const totalLoad    = wActs.reduce((s, a) => s + a.trainingLoad, 0)
    const sumHr        = wActs.reduce((s, a) => s + a.avgHeartRate, 0)
    const avgHr        = wActs.length > 0 ? Math.round(sumHr / wActs.length) : 0
    const longRunDist  = wActs.reduce((m, a) => a.distanceMeters > m ? a.distanceMeters : m, 0)
    const qualitySessions = wActs.filter(a =>
      ['TEMPO', 'THRESHOLD', 'INTERVAL'].includes(a.workoutType)
    ).length

    weeklyLoads.push(totalLoad)

    const avgDailyLoad = totalLoad / 7
    ctl = ctl * EWA_CTL + avgDailyLoad * (1 - EWA_CTL)
    atl = atl * EWA_ATL + avgDailyLoad * (1 - EWA_ATL)
    const tsb = ctl - atl

    // Gabbett ACWR: acute (this week) / rolling 4-week chronic average.
    // Requires a minimum of 4 prior weeks before the ratio is meaningful —
    // fewer weeks produces a volatile denominator and false spike signals.
    // Weeks 1–4 return 1.0 (neutral) because there is no stable chronic baseline.
    const priorLoads = weeklyLoads.slice(Math.max(0, weeklyLoads.length - 5), weeklyLoads.length - 1)
    const acwr = priorLoads.length >= 4
      ? totalLoad / (priorLoads.reduce((s, l) => s + l, 0) / priorLoads.length)
      : 1.0

    const rationale = phaseRationale(def.phase, def.weekNum, acwr)

    summaries.push({
      weekStartDate: weekStartDate(def.weekNum),
      weekNumber: def.weekNum,
      totalDistanceMeters: totalDist,
      totalDurationSeconds: totalDur,
      totalMovingTimeSeconds: totalMoving,
      activityCount: wActs.length,
      totalLoad,
      avgHeartRate: avgHr,
      longRunDistanceMeters: longRunDist,
      qualitySessionCount: qualitySessions,
      ctl: Math.round(ctl * 100) / 100,
      atl: Math.round(atl * 100) / 100,
      tsb: Math.round(tsb * 100) / 100,
      acwr: Math.round(acwr * 1000) / 1000,
      trainingPhase: def.phase,
      phaseRationale: rationale,
    })
  }

  return summaries
}

function phaseRationale(phase: TrainingPhase, week: number, acwr: number): string {
  switch (phase) {
    case 'BASE':
      return `Week ${week}: building aerobic base with easy runs. Volume increasing gradually. ACWR ${acwr.toFixed(2)} — within safe range.`
    case 'BUILD':
      return `Week ${week}: structured quality sessions added. Tempo and interval work increasing lactate threshold. ACWR ${acwr.toFixed(2)}.`
    case 'PEAK':
      return acwr > 1.3
        ? `Week ${week}: peak load week. ACWR ${acwr.toFixed(2)} — training-load spike detected. Monitor recovery closely.`
        : `Week ${week}: peak stimulus. Highest training stress of the block. ACWR ${acwr.toFixed(2)}.`
    case 'RECOVERY':
      return `Week ${week}: planned recovery week. Volume reduced ~40 %. ACWR ${acwr.toFixed(2)} — load returning to safe range.`
    case 'TAPER':
      return `Week ${week}: taper phase. Volume reducing progressively toward race. ACWR ${acwr.toFixed(2)} — freshness building.`
    default:
      return `Week ${week}: ACWR ${acwr.toFixed(2)}.`
  }
}

// ─── Race prediction (Riegel) ─────────────────────────────────────────────────

function riegelPredict(refTimeSeconds: number, refDistMeters: number, targetDistMeters: number): number {
  return refTimeSeconds * Math.pow(targetDistMeters / refDistMeters, 1.06)
}

function bestTempoPerformance(activities: ActivityData[]): { timeSeconds: number; distMeters: number } | null {
  const tempos = activities.filter(a => a.workoutType === 'TEMPO' || a.workoutType === 'THRESHOLD')
  if (tempos.length === 0) return null
  // Best = fastest average pace
  const best = tempos.reduce((b, a) => a.avgPaceSecPerKm < b.avgPaceSecPerKm ? a : b)
  return {
    timeSeconds:  Math.round((best.distanceMeters / 1000) * best.avgPaceSecPerKm),
    distMeters:   best.distanceMeters,
  }
}

// ─── Weekly brief generator ───────────────────────────────────────────────────

function buildWeeklyBrief(
  summary: WeeklySummaryData,
  activitiesUpToNow: ActivityData[],
  goalTimeSeconds: number,
): WeeklyBriefData {
  const { weekNumber, trainingPhase, acwr, weekStartDate: wsd } = summary

  // Race projection
  const bestTempo = bestTempoPerformance(activitiesUpToNow)
  let projectedTime: number | null = null
  let gap: number | null = null
  if (bestTempo) {
    let raw = riegelPredict(bestTempo.timeSeconds, bestTempo.distMeters, DEMO_RACE.distanceMeters)
    // Apply taper freshness bonus in taper weeks
    if (trainingPhase === 'TAPER') raw *= 0.97
    projectedTime = Math.round(raw)
    gap = projectedTime - goalTimeSeconds
  }

  const paceStr = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // Phase note
  const phaseNote = trainingPhase === 'TAPER'
    ? `Week ${weekNumber} of 12 — taper phase. Volume is reducing to build freshness for race day on ${DEMO_RACE.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
    : trainingPhase === 'RECOVERY'
    ? `Week ${weekNumber} of 12 — recovery week. Planned volume reduction to absorb the peak training block.`
    : `Week ${weekNumber} of 12 — ${trainingPhase.toLowerCase()} phase. ${summary.activityCount} runs, ${Math.round(summary.totalDistanceMeters / 1000)} km total.`

  // Key workout note
  const weekActs = activitiesUpToNow.filter(a => a.trainingWeek === weekNumber)
  const quality  = weekActs.filter(a => ['TEMPO', 'THRESHOLD', 'INTERVAL'].includes(a.workoutType))
  const longRun  = weekActs.find(a => a.workoutType === 'LONG_RUN')
  let keyNote = 'No quality sessions this week — aerobic base work only.'
  if (quality.length > 0) {
    const q = quality[quality.length - 1]
    keyNote = `Key session: ${q.workoutType.toLowerCase().replace('_', ' ')} — ${Math.round(q.distanceMeters / 1000)} km at ${paceStr(q.avgPaceSecPerKm)}/km avg, HR ${q.avgHeartRate} bpm.`
  } else if (longRun) {
    keyNote = `Key session: long run — ${Math.round(longRun.distanceMeters / 1000)} km at ${paceStr(longRun.avgPaceSecPerKm)}/km, HR ${longRun.avgHeartRate} bpm.`
  }

  // Risk note
  let riskNote: string
  if (acwr > 1.3) {
    riskNote = `Training-load spike detected. ACWR is ${acwr.toFixed(2)} — in the higher-risk range (>1.3). This week included an extra run on a planned rest day. Monitor for fatigue or soreness.`
  } else if (acwr > 1.15) {
    riskNote = `ACWR is ${acwr.toFixed(2)} — in the caution range. Load is elevated but manageable. Prioritize sleep and nutrition.`
  } else if (acwr < 0.7) {
    riskNote = `ACWR is ${acwr.toFixed(2)} — recovery week load is low, as planned. Freshness building ahead of next training block.`
  } else {
    riskNote = `ACWR is ${acwr.toFixed(2)} — within the optimal training range (0.8–1.3). No injury risk signal.`
  }

  // Priority note
  const nextPhase = WEEK_DEFS.find(d => d.weekNum === weekNumber + 1)?.phase
  let priorityNote: string
  if (trainingPhase === 'TAPER') {
    priorityNote = 'Keep runs short and easy. One quality sharpener at race pace. Prioritize rest and nutrition.'
  } else if (nextPhase === 'RECOVERY') {
    priorityNote = 'Recovery week follows. Reduce effort on all runs. No quality sessions — let the peak training block absorb.'
  } else if (trainingPhase === 'RECOVERY') {
    priorityNote = 'Return to structured training next week. Build back into tempo and interval sessions gradually.'
  } else {
    priorityNote = 'Continue structured build. Include at least one tempo or interval session to maintain lactate threshold development.'
  }

  // Trajectory note
  let trajectoryNote: string
  if (projectedTime === null) {
    trajectoryNote = 'Race prediction unavailable — no tempo performances recorded yet. Continue base building.'
  } else if (gap !== null && gap <= 0) {
    trajectoryNote = `On track: current projection ${paceStr(projectedTime)} (${paceStr(DEMO_RACE.goalTimeSeconds)} goal) — ${Math.abs(gap)}s ahead of goal pace.`
  } else if (gap !== null && gap <= 180) {
    trajectoryNote = `Close to goal: projection ${paceStr(projectedTime)} vs ${paceStr(DEMO_RACE.goalTimeSeconds)} goal — ${gap}s behind. Achievable with continued build.`
  } else {
    trajectoryNote = `Projection ${paceStr(projectedTime!)} is behind ${paceStr(DEMO_RACE.goalTimeSeconds)} goal by ${gap}s. More tempo work needed.`
  }

  return {
    weekStartDate: wsd,
    weekNumber,
    trainingPhase,
    acwr,
    projectedTimeSeconds: projectedTime,
    gapToGoalSeconds: gap,
    phaseNote,
    keyWorkoutNote: keyNote,
    riskNote,
    priorityNote,
    trajectoryNote,
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateDemoPlan(): DemoPlan {
  const activities: ActivityData[] = []

  for (const def of WEEK_DEFS) {
    const wStart = weekStartDate(def.weekNum)
    for (const w of def.workouts) {
      activities.push(buildActivity({
        weekNumber:    def.weekNum,
        weekStartDate: wStart,
        phase:         def.phase,
        dow:           w.dow,
        type:          w.type,
        distKm:        w.distKm,
        executedTooHard: w.executedTooHard,
        extraRun:      w.extraRun,
      }))
    }
  }

  const weeklySummaries = computeWeeklySummaries(activities)

  // Build briefs for all 12 weeks
  const weeklyBriefs: WeeklyBriefData[] = []
  for (const summary of weeklySummaries) {
    const actsUpToNow = activities.filter(a => a.trainingWeek! <= summary.weekNumber)
    weeklyBriefs.push(buildWeeklyBrief(summary, actsUpToNow, DEMO_RACE.goalTimeSeconds))
  }

  const seedHash = createHash('sha256')
    .update(`alex@pacer.demo:2026-08-02:6900:${DEMO_VERSION}`)
    .digest('hex')

  return { activities, weeklySummaries, weeklyBriefs, seedHash, version: DEMO_VERSION }
}
