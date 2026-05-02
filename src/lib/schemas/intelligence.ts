import { z } from 'zod'
import { WorkoutTypeSchema, TrainingPhaseSchema } from './enums'

// ─── Workout classification result ────────────────────────────────────────────

export const WorkoutClassificationResultSchema = z.object({
  workoutType: WorkoutTypeSchema,
  confidence: z.number().min(0).max(1),
  explanation: z.string().min(1),
  executionEvaluation: z.string().min(1),
})
export type WorkoutClassificationResult = z.infer<typeof WorkoutClassificationResultSchema>

// ─── Injury-risk result ────────────────────────────────────────────────────────

// Language must match AGENT_GUIDELINES: "risk signal", "training-load spike",
// "caution range", "higher-risk pattern". No medical claims.
export const InjuryRiskCategorySchema = z.enum(['optimal', 'caution', 'spike', 'low'])
export type InjuryRiskCategory = z.infer<typeof InjuryRiskCategorySchema>

export const InjuryRiskResultSchema = z.object({
  acwr: z.number().nonnegative(),
  category: InjuryRiskCategorySchema,
  explanation: z.string().min(1),
  contributingFactors: z.array(z.string()),
  recommendedAction: z.string().min(1),
})
export type InjuryRiskResult = z.infer<typeof InjuryRiskResultSchema>

// ─── Periodization result ─────────────────────────────────────────────────────

export const PeriodizationResultSchema = z.object({
  phase: TrainingPhaseSchema,
  confidence: z.number().min(0).max(1),
  primaryReason: z.string().min(1),
  supportingSignals: z.array(z.string()),
  coachingImplication: z.string().min(1),
})
export type PeriodizationResult = z.infer<typeof PeriodizationResultSchema>

// ─── Race prediction result ───────────────────────────────────────────────────

// Base: Riegel formula T2 = T1 × (D2/D1)^1.06
// confidenceLow/High are pessimistic/optimistic bounds in seconds.
export const RacePredictionResultSchema = z.object({
  predictedTimeSeconds: z.number().int().positive(),
  confidenceLow: z.number().int().positive(),
  confidenceHigh: z.number().int().positive(),
  confidenceScore: z.number().min(0).max(1),
  gapToGoalSeconds: z.number().int().nullable(),
  explanation: z.string().min(1),
  whatNeedsToHappen: z.string().min(1),
})
export type RacePredictionResult = z.infer<typeof RacePredictionResultSchema>

// ─── Weekly brief result (intelligence API output format) ─────────────────────

// This is the structured output from the intelligence layer for display/AI rewrite.
// Distinct from WeeklyBriefData (DB storage) — richer, UI-oriented format.
export const WeeklyBriefResultSchema = z.object({
  lastWeekReview: z.string().min(1),
  thisWeekPrescription: z.string().min(1),
  keySignal: z.string().min(1),
  warnings: z.array(z.string()),
  suggestedFocus: z.string().min(1),
})
export type WeeklyBriefResult = z.infer<typeof WeeklyBriefResultSchema>

// ─── Activity metrics (compact signal for coach context) ─────────────────────

export const ActivitySignalSchema = z.object({
  date: z.date(),
  workoutType: WorkoutTypeSchema,
  distanceMeters: z.number().positive(),
  durationSeconds: z.number().int().positive(),
  avgHeartRate: z.number().int().nullable(),
  executionEvaluation: z.string().nullable(),
})
export type ActivitySignal = z.infer<typeof ActivitySignalSchema>
