import { z } from 'zod'

// ─── Re-exports ───────────────────────────────────────────────────────────────

export * from './enums'
export * from './activity'
export * from './training'
export * from './intelligence'
export * from './coach'
export * from './api'

import { GeneratedActivitySchema } from './activity'
import { CoachContextSchema } from './coach'
import { WeeklyBriefResultSchema } from './intelligence'
import { RacePredictionResultSchema } from './intelligence'
import { ApiResponseSchema } from './api'
import type { GeneratedActivity } from './activity'
import type { CoachContext } from './coach'
import type { WeeklyBriefResult, RacePredictionResult } from './intelligence'
import type { ApiResponse } from './api'

// ─── Validation result type ───────────────────────────────────────────────────

// T is always returned — either real validated data or a safe typed fallback.
// Consumers can check success before trusting data quality.
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError; fallback: T }

// ─── Internal helper ──────────────────────────────────────────────────────────

function logZodError(label: string, error: z.ZodError): void {
  if (process.env.NODE_ENV !== 'development') return
  console.warn(`[schemas] ${label} validation failed:`)
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    console.warn(`  ${path}: ${issue.message}`)
  }
}

// ─── validateGeneratedActivity ────────────────────────────────────────────────

const ACTIVITY_FALLBACK: GeneratedActivity = {
  source: 'GENERATED',
  startedAt: new Date(0),
  distanceMeters: 0.001,
  durationSeconds: 1,
  movingTimeSeconds: 1,
  elevationGainMeters: 0,
  avgPaceSecPerKm: 1,
  avgHeartRate: 60,
  maxHeartRate: 60,
  avgCadence: 100,
  calories: 1,
  trainingLoad: 0.001,
  workoutType: 'UNKNOWN',
  workoutTypeConfidence: 0,
  workoutTypeExplanation: 'validation failed',
  executionEvaluation: 'validation failed',
  intendedWorkoutType: 'UNKNOWN',
  trainingPhase: 'UNSTRUCTURED',
  trainingWeek: 1,
  hasGps: false,
  laps: [
    {
      lapNumber: 1,
      distanceMeters: 0.001,
      durationSeconds: 1,
      avgPaceSecPerKm: 1,
      avgHeartRate: null,
      maxHeartRate: null,
      avgCadence: null,
      isRest: false,
    },
  ],
}

export function validateGeneratedActivity(data: unknown): ValidationResult<GeneratedActivity> {
  const result = GeneratedActivitySchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  logZodError('GeneratedActivity', result.error)
  return { success: false, error: result.error, fallback: ACTIVITY_FALLBACK }
}

// ─── validateCoachContext ─────────────────────────────────────────────────────

const COACH_CONTEXT_FALLBACK: CoachContext = {
  athlete: {
    id: '',
    name: 'Unknown',
    goalRaceName: null,
    goalRaceDate: null,
    goalTimeSeconds: null,
  },
  phase: {
    current: 'UNSTRUCTURED',
    weekNumber: 1,
    totalWeeks: 12,
    rationale: '',
  },
  fitness: {
    ctl: 0,
    atl: 0,
    tsb: 0,
    acwr: null,
    acwrCategory: 'insufficient-data',
    trend: 'neutral',
  },
  racePrediction: null,
  weeklyBrief: {
    phaseNote: '',
    keyWorkoutNote: '',
    riskNote: '',
    priorityNote: '',
    trajectoryNote: '',
  },
  recentWorkouts: [],
  conversationHistory: [],
  memorySummary: null,
}

export function validateCoachContext(data: unknown): ValidationResult<CoachContext> {
  const result = CoachContextSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  logZodError('CoachContext', result.error)
  return { success: false, error: result.error, fallback: COACH_CONTEXT_FALLBACK }
}

// ─── validateWeeklyBrief ──────────────────────────────────────────────────────

const WEEKLY_BRIEF_FALLBACK: WeeklyBriefResult = {
  lastWeekReview:       ['No activity data available for last week.', 'Check back after your next training session.'],
  thisWeekPrescription: ['Continue training as planned.', 'Follow your scheduled workouts.'],
  keySignal:            'No signal available.',
  warnings:             [],
  suggestedFocus:       'Maintain consistency.',
}

export function validateWeeklyBrief(data: unknown): ValidationResult<WeeklyBriefResult> {
  const result = WeeklyBriefResultSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  logZodError('WeeklyBriefResult', result.error)
  return { success: false, error: result.error, fallback: WEEKLY_BRIEF_FALLBACK }
}

// ─── validateRacePrediction ───────────────────────────────────────────────────

const RACE_PREDICTION_FALLBACK: RacePredictionResult = {
  predictedTimeSeconds:    7200,  // 2:00:00 neutral placeholder
  predictedTimeFormatted:  '2:00:00',
  confidenceLow:           6912,  // optimistic (faster)
  confidenceLowFormatted:  '1:55:12',
  confidenceHigh:          7488,  // pessimistic (slower)
  confidenceHighFormatted: '2:04:48',
  confidenceScore:         10,
  gapToGoalSeconds:        null,
  gapToGoalFormatted:      '—',
  explanation:             'Insufficient data for race prediction.',
  whatNeedsToHappen:       'Complete more tempo or threshold sessions to generate an estimated trajectory.',
  dataQualityNotes:        ['Insufficient training data — no qualifying activities found.'],
  bestEffortActivity:      null,
}

export function validateRacePrediction(data: unknown): ValidationResult<RacePredictionResult> {
  const result = RacePredictionResultSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  logZodError('RacePrediction', result.error)
  return { success: false, error: result.error, fallback: RACE_PREDICTION_FALLBACK }
}

// ─── validateApiResponse ──────────────────────────────────────────────────────

const API_RESPONSE_FALLBACK: ApiResponse<null> = {
  success: false,
  error: 'Response validation failed',
}

export function validateApiResponse(data: unknown): ValidationResult<ApiResponse> {
  const result = ApiResponseSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data as ApiResponse }
  logZodError('ApiResponse', result.error)
  return { success: false, error: result.error, fallback: API_RESPONSE_FALLBACK }
}
