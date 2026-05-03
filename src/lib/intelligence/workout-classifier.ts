// ─── Rule-based workout type classifier ───────────────────────────────────────
//
// Classifies a single activity into a WorkoutType using ordered rule checks
// against HR, duration, distance, and lap-variance signals. First match wins.
//
// Ordering rationale (least → most ambiguous):
//   RECOVERY  → short + very low HR is unambiguous
//   INTERVAL  → high lap variance is unambiguous when present
//   TEMPO     → sustained HR in threshold band + bounded duration
//   LONG_RUN  → distance exceeds recent baseline at aerobic HR
//   EASY      → remaining aerobic-zone sessions
//   default   → EASY (no rule fired; classifier expresses low confidence)
//
// Execution evaluation compares the classified type against the activity's
// intendedWorkoutType to surface zone mismatches and missing intensity.

import type { WorkoutType } from '../schemas/enums'

// ─── Input types ──────────────────────────────────────────────────────────────

export interface AthleteThresholds {
  thresholdHR: number      // lactate-threshold HR in bpm (demo: 170)
  easyHRCeiling: number    // top of Zone 2 in bpm (demo: 145)
  restingHR: number        // resting HR in bpm (demo: 52)
}

export interface ActivityLapData {
  lapNumber: number
  avgHeartRate: number | null
  avgPaceSecPerKm: number
  isRest: boolean
}

export interface ActivityWithLaps {
  distanceMeters: number
  movingTimeSeconds: number
  avgHeartRate: number | null
  maxHeartRate: number | null
  avgPaceSecPerKm: number
  avgCadence: number | null
  trainingLoad: number
  intendedWorkoutType: WorkoutType | null
  laps: ActivityLapData[]
}

// ─── Output types ─────────────────────────────────────────────────────────────

export type ExecutionEvaluation =
  | 'MATCHED_INTENT'     // computed type matches intended type
  | 'TOO_HARD'           // intended easy/recovery but HR exceeded easy ceiling
  | 'TOO_EASY'           // intended intensity but HR stayed below threshold
  | 'WELL_EXECUTED'      // intended and computed intensity types align
  | 'UNEVEN_EXECUTION'   // intended INTERVAL but lap variance too low

export interface WorkoutClassificationResult {
  workoutType: WorkoutType
  confidence: 'high' | 'medium' | 'low'
  explanation: string
  executionEvaluation: ExecutionEvaluation
  executionNote: string
  signals: {
    avgHRPercent: number        // avgHR as % of thresholdHR (e.g. 97.6)
    lapHRStdDev: number | null  // standard deviation of per-lap avg HR
    lapPaceStdDev: number | null // standard deviation of per-lap avg pace
    durationMinutes: number
    distanceKm: number
  }
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const RECOVERY_MAX_MINUTES   = 25
const RECOVERY_HR_FACTOR     = 0.92   // < easyHRCeiling × 0.92
const INTERVAL_HR_STDDEV     = 15     // bpm
const INTERVAL_PACE_STDDEV   = 30     // sec/km
const TEMPO_HR_LOW_FACTOR    = 0.88   // ≥ thresholdHR × 0.88
const TEMPO_HR_HIGH_FACTOR   = 1.02   // ≤ thresholdHR × 1.02
const TEMPO_MIN_MINUTES      = 18
const TEMPO_MAX_MINUTES      = 50
const LONG_RUN_DIST_FACTOR   = 0.85   // > recentLongRunDistance × 0.85
const LONG_RUN_HR_FACTOR     = 0.84   // < thresholdHR × 0.84
const LONG_RUN_MIN_METERS    = 11000  // floor when no prior long run exists
const EASY_HR_FACTOR         = 1.08   // < easyHRCeiling × 1.08

// ─── Helpers ──────────────────────────────────────────────────────────────────

function popStdDev(values: number[]): number | null {
  if (values.length < 2) return null
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function r1(n: number): number { return Math.round(n * 10) / 10 }

// ─── Execution evaluation ─────────────────────────────────────────────────────

function evaluateExecution(
  intended: WorkoutType | null,
  computed: WorkoutType,
  avgHR: number,
  athlete: AthleteThresholds,
  lapHRStdDev: number | null,
): { executionEvaluation: ExecutionEvaluation; executionNote: string } {
  if (!intended) {
    return {
      executionEvaluation: 'MATCHED_INTENT',
      executionNote: 'No intended workout type recorded — execution not evaluated.',
    }
  }

  const isEasyIntent      = intended === 'EASY' || intended === 'RECOVERY'
  const isIntensityIntent = intended === 'TEMPO' || intended === 'THRESHOLD' || intended === 'INTERVAL'

  // TOO_HARD: easy or recovery intent but HR exceeded the easy ceiling
  if (isEasyIntent && avgHR > athlete.easyHRCeiling) {
    return {
      executionEvaluation: 'TOO_HARD',
      executionNote:
        `Intended as ${intended.toLowerCase()} but avg HR ${avgHR} bpm exceeded ` +
        `the easy ceiling of ${athlete.easyHRCeiling} bpm by ` +
        `${avgHR - athlete.easyHRCeiling} bpm. ` +
        `Keep future easy runs below ${athlete.easyHRCeiling} bpm for adequate recovery.`,
    }
  }

  // TOO_EASY: intensity intent but HR stayed well below threshold
  if (isIntensityIntent && avgHR < athlete.thresholdHR * 0.85) {
    return {
      executionEvaluation: 'TOO_EASY',
      executionNote:
        `Intended as ${intended.toLowerCase()} but avg HR ${avgHR} bpm ` +
        `was well below threshold (${athlete.thresholdHR} bpm). ` +
        `Session may not have achieved the intended training stimulus.`,
    }
  }

  // UNEVEN_EXECUTION: interval intent but lap variance too low
  if (intended === 'INTERVAL' && (lapHRStdDev === null || lapHRStdDev < INTERVAL_HR_STDDEV)) {
    const sdStr = lapHRStdDev !== null ? `${r1(lapHRStdDev)} bpm std dev` : 'no lap data'
    return {
      executionEvaluation: 'UNEVEN_EXECUTION',
      executionNote:
        `Intended as intervals but lap HR variation was low (${sdStr}). ` +
        `Athlete may not have executed distinct work/rest splits.`,
    }
  }

  // WELL_EXECUTED: intensity workout matched at both type and HR level
  if (isIntensityIntent && computed === intended) {
    return {
      executionEvaluation: 'WELL_EXECUTED',
      executionNote:
        `${intended.toLowerCase()} session well executed — HR and pace signals match the prescribed effort.`,
    }
  }

  // MATCHED_INTENT: type matches or execution is within expected range
  if (computed === intended) {
    return {
      executionEvaluation: 'MATCHED_INTENT',
      executionNote: 'Workout executed as intended.',
    }
  }

  return {
    executionEvaluation: 'MATCHED_INTENT',
    executionNote: `Session broadly matches intended effort (${intended.toLowerCase()}).`,
  }
}

// ─── Main classifier ──────────────────────────────────────────────────────────

export function classifyWorkout(
  activity: ActivityWithLaps,
  athlete: AthleteThresholds,
  recentLongRunDistance: number,
): WorkoutClassificationResult {
  const durationMinutes = activity.movingTimeSeconds / 60
  const distanceKm      = activity.distanceMeters / 1000
  const avgHR           = activity.avgHeartRate ?? 0

  const avgHRPercent = athlete.thresholdHR > 0
    ? r1((avgHR / athlete.thresholdHR) * 100)
    : 0

  // ── Lap variance signals ───────────────────────────────────────────────────
  const lapHRValues = activity.laps
    .map(l => l.avgHeartRate)
    .filter((v): v is number => v !== null)
  const lapPaceValues = activity.laps.map(l => l.avgPaceSecPerKm)

  const lapHRStdDev   = lapHRValues.length >= 2 ? r1(popStdDev(lapHRValues)!) : null
  const lapPaceStdDev = lapPaceValues.length >= 2 ? r1(popStdDev(lapPaceValues)!) : null

  const signals = {
    avgHRPercent,
    lapHRStdDev,
    lapPaceStdDev,
    durationMinutes: r1(durationMinutes),
    distanceKm: Math.round(distanceKm * 100) / 100,
  }

  // ── Rule chain (first match wins) ─────────────────────────────────────────
  let workoutType: WorkoutType
  let confidence: 'high' | 'medium' | 'low'
  let explanation: string

  // 1. RECOVERY
  if (
    durationMinutes < RECOVERY_MAX_MINUTES &&
    avgHR < athlete.easyHRCeiling * RECOVERY_HR_FACTOR
  ) {
    workoutType = 'RECOVERY'
    confidence  = 'high'
    explanation =
      `Short session (${signals.durationMinutes} min) at very low HR ` +
      `(${avgHR} bpm, below the ${Math.round(athlete.easyHRCeiling * RECOVERY_HR_FACTOR)} bpm ` +
      `recovery ceiling). Active recovery pattern.`

  // 2. INTERVAL: alternating work and rest laps detected via lap variance.
  // Requires ≥ 3 laps — a 2-lap warmup+main structure can produce high HR/pace
  // variance without representing true interval structure.
  } else if (
    activity.laps.length >= 3 &&
    lapHRStdDev !== null && lapHRStdDev > INTERVAL_HR_STDDEV &&
    lapPaceStdDev !== null && lapPaceStdDev > INTERVAL_PACE_STDDEV
  ) {
    workoutType = 'INTERVAL'
    confidence  = 'high'
    explanation =
      `Lap HR spread ${lapHRStdDev} bpm and pace spread ${lapPaceStdDev} s/km — ` +
      `alternating work and rest intervals detected.`

  // 3. TEMPO: sustained effort in the lactate-threshold HR band, bounded duration
  } else if (
    avgHR >= athlete.thresholdHR * TEMPO_HR_LOW_FACTOR &&
    avgHR <= athlete.thresholdHR * TEMPO_HR_HIGH_FACTOR &&
    durationMinutes >= TEMPO_MIN_MINUTES &&
    durationMinutes <= TEMPO_MAX_MINUTES
  ) {
    workoutType = 'TEMPO'
    confidence  = 'high'
    explanation =
      `HR ${avgHR} bpm (${avgHRPercent}% of threshold) and ` +
      `duration ${signals.durationMinutes} min place this in the ` +
      `tempo / lactate-threshold zone.`

  // 4. LONG_RUN: distance exceeds recent baseline at aerobic HR
  } else if (
    activity.distanceMeters > Math.max(recentLongRunDistance * LONG_RUN_DIST_FACTOR, LONG_RUN_MIN_METERS) &&
    avgHR < athlete.thresholdHR * LONG_RUN_HR_FACTOR
  ) {
    workoutType = 'LONG_RUN'
    confidence  = 'high'
    explanation =
      `${signals.distanceKm} km exceeds 85% of the recent long-run baseline ` +
      `(${Math.round(recentLongRunDistance / 1000)} km) at aerobic HR ${avgHR} bpm.`

  // 5. EASY: aerobic-zone session
  } else if (avgHR < athlete.easyHRCeiling * EASY_HR_FACTOR) {
    workoutType = 'EASY'
    confidence  = avgHR <= athlete.easyHRCeiling ? 'high' : 'medium'
    explanation =
      `HR ${avgHR} bpm (${avgHRPercent}% of threshold) is within the easy aerobic zone.`

  // Default: EASY with low confidence (no rule fired)
  } else {
    workoutType = 'EASY'
    confidence  = 'low'
    explanation =
      `No specific pattern matched. Defaulting to easy — ` +
      `HR ${avgHR} bpm, duration ${signals.durationMinutes} min.`
  }

  // ── Execution evaluation ───────────────────────────────────────────────────
  const { executionEvaluation, executionNote } = evaluateExecution(
    activity.intendedWorkoutType,
    workoutType,
    avgHR,
    athlete,
    lapHRStdDev,
  )

  return {
    workoutType,
    confidence,
    explanation,
    executionEvaluation,
    executionNote,
    signals,
  }
}
