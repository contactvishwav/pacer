import { z } from 'zod'
import { TrainingPhaseSchema } from './enums'

// ─── Weekly training summary ───────────────────────────────────────────────────

// Validates WeeklySummaryData from generate-training-plan (in-memory shape)
export const WeeklyTrainingSummarySchema = z.object({
  weekStartDate: z.date(),
  weekNumber: z.number().int().min(1),
  totalDistanceMeters: z.number().nonnegative(),
  totalDurationSeconds: z.number().int().nonnegative(),
  totalMovingTimeSeconds: z.number().int().nonnegative(),
  activityCount: z.number().int().nonnegative(),
  totalLoad: z.number().nonnegative(),
  avgHeartRate: z.number().int().min(30).max(220),
  longRunDistanceMeters: z.number().nonnegative(),
  qualitySessionCount: z.number().int().nonnegative(),
  ctl: z.number().nonnegative(),
  atl: z.number().nonnegative(),
  tsb: z.number(),
  acwr: z.number().nonnegative(),
  trainingPhase: TrainingPhaseSchema,
  phaseRationale: z.string().min(1),
})
export type WeeklyTrainingSummary = z.infer<typeof WeeklyTrainingSummarySchema>

// Validates a Prisma WeeklyTrainingSummary record
export const DbWeeklyTrainingSummarySchema = WeeklyTrainingSummarySchema.extend({
  id: z.string(),
  athleteId: z.string(),
  avgHeartRate: z.number().int().min(30).max(220).nullable(),
  longRunDistanceMeters: z.number().nonnegative().nullable(),
  phaseRationale: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type DbWeeklyTrainingSummary = z.infer<typeof DbWeeklyTrainingSummarySchema>

// ─── Weekly brief data (DB storage format) ────────────────────────────────────

// Validates WeeklyBriefData from generate-training-plan (in-memory shape).
// This is the deterministic 5-note format stored in WeeklyCoachingBrief.
export const WeeklyBriefDataSchema = z.object({
  weekStartDate: z.date(),
  weekNumber: z.number().int().min(1),
  trainingPhase: TrainingPhaseSchema,
  acwr: z.number().nonnegative(),
  projectedTimeSeconds: z.number().int().positive().nullable(),
  gapToGoalSeconds: z.number().int().nullable(),
  phaseNote: z.string().min(1),
  keyWorkoutNote: z.string().min(1),
  riskNote: z.string().min(1),
  priorityNote: z.string().min(1),
  trajectoryNote: z.string().min(1),
})
export type WeeklyBriefData = z.infer<typeof WeeklyBriefDataSchema>

// Validates a Prisma WeeklyCoachingBrief record
export const DbWeeklyCoachingBriefSchema = WeeklyBriefDataSchema.extend({
  id: z.string(),
  athleteId: z.string(),
  goalRaceId: z.string().nullable(),
  aiRewrite: z.string().nullable(),
  isAiRewritten: z.boolean(),
  generatedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type DbWeeklyCoachingBrief = z.infer<typeof DbWeeklyCoachingBriefSchema>
