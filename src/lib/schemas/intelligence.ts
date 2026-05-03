import { z } from 'zod'
import { WorkoutTypeSchema, TrainingPhaseSchema } from './enums'

// ─── Execution evaluation enum ────────────────────────────────────────────────

export const ExecutionEvaluationSchema = z.enum([
  'MATCHED_INTENT',
  'TOO_HARD',
  'TOO_EASY',
  'WELL_EXECUTED',
  'UNEVEN_EXECUTION',
])
export type ExecutionEvaluation = z.infer<typeof ExecutionEvaluationSchema>

// ─── Workout classification result ────────────────────────────────────────────

export const WorkoutClassificationResultSchema = z.object({
  workoutType: WorkoutTypeSchema,
  confidence: z.enum(['high', 'medium', 'low']),
  explanation: z.string().min(1),
  executionEvaluation: ExecutionEvaluationSchema,
  executionNote: z.string(),
  signals: z.object({
    avgHRPercent: z.number(),
    lapHRStdDev: z.number().nullable(),
    lapPaceStdDev: z.number().nullable(),
    durationMinutes: z.number(),
    distanceKm: z.number(),
  }),
})
export type WorkoutClassificationResult = z.infer<typeof WorkoutClassificationResultSchema>

// ─── Injury-risk result ────────────────────────────────────────────────────────

// Language must match AGENT_GUIDELINES: "risk signal", "training-load spike",
// "caution range", "higher-risk pattern". No medical claims.
export const InjuryRiskCategorySchema = z.enum([
  'insufficient-data',
  'underload',
  'optimal',
  'caution',
  'high-risk',
])
export type InjuryRiskCategory = z.infer<typeof InjuryRiskCategorySchema>

export const InjuryRiskResultSchema = z.object({
  acwr: z.number().nonnegative().nullable(),
  category: InjuryRiskCategorySchema,
  explanation: z.string().min(1),
  contributingFactors: z.array(z.string()),
  recommendedAction: z.string().min(1),
})
export type InjuryRiskResult = z.infer<typeof InjuryRiskResultSchema>

// ─── Periodization result ─────────────────────────────────────────────────────

export const PeriodizationResultSchema = z.object({
  phase: TrainingPhaseSchema,
  confidence: z.enum(['high', 'medium', 'low']),
  primaryReason: z.string().min(1),
  supportingSignals: z.array(z.string()),
  coachingImplication: z.string().min(1),
  daysUntilRace: z.number().int().nonnegative(),
  weeksUntilRace: z.number().nonnegative(),
})
export type PeriodizationResult = z.infer<typeof PeriodizationResultSchema>

// ─── Race prediction result ───────────────────────────────────────────────────

// Base: Riegel formula T2 = T1 × (D2/D1)^1.06
// confidenceLow = optimistic bound (fewer seconds), confidenceHigh = pessimistic bound.
// confidenceLow < predictedTimeSeconds < confidenceHigh
// confidenceScore is 0–100 (not 0–1).
// gapToGoalSeconds: positive = behind goal, negative = ahead.
export const RacePredictionResultSchema = z.object({
  predictedTimeSeconds:    z.number().int().nonnegative(),
  predictedTimeFormatted:  z.string(),
  confidenceLow:           z.number().int().nonnegative(),
  confidenceLowFormatted:  z.string(),
  confidenceHigh:          z.number().int().nonnegative(),
  confidenceHighFormatted: z.string(),
  confidenceScore:         z.number().min(0).max(100),
  gapToGoalSeconds:        z.number().int().nullable(),
  gapToGoalFormatted:      z.string(),
  explanation:             z.string().min(1),
  whatNeedsToHappen:       z.string().min(1),
  dataQualityNotes:        z.array(z.string()),
  bestEffortActivity: z.object({
    date:          z.string(),
    distanceKm:    z.number(),
    paceFormatted: z.string(),
    workoutType:   z.string(),
  }).nullable(),
})
export type RacePredictionResult = z.infer<typeof RacePredictionResultSchema>

// ─── Weekly brief result (intelligence API output format) ─────────────────────

// This is the structured output from the intelligence layer for display/AI rewrite.
// Distinct from WeeklyBriefData (DB storage) — richer, UI-oriented format.
export const WeeklyBriefResultSchema = z.object({
  lastWeekReview:       z.array(z.string()).min(2).max(4),
  thisWeekPrescription: z.array(z.string()).min(2).max(4),
  keySignal:            z.string().min(1),
  warnings:             z.array(z.string()),
  suggestedFocus:       z.string().min(1),
})
export type WeeklyBriefResult = z.infer<typeof WeeklyBriefResultSchema>

// ─── Activity metrics (compact signal for coach context) ─────────────────────

export const ActivitySignalSchema = z.object({
  date: z.date(),
  workoutType: WorkoutTypeSchema,
  distanceMeters: z.number().positive(),
  durationSeconds: z.number().int().positive(),
  avgHeartRate: z.number().int().nullable(),
  executionEvaluation: ExecutionEvaluationSchema.nullable(),
})
export type ActivitySignal = z.infer<typeof ActivitySignalSchema>
