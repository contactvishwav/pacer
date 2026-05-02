import { z } from 'zod'
import { WorkoutTypeSchema, TrainingPhaseSchema, ActivitySourceSchema } from './enums'

// ─── Lap schemas ──────────────────────────────────────────────────────────────

// Validates LapData from generate-training-plan (in-memory generated shape)
export const LapSchema = z.object({
  lapNumber: z.number().int().min(1),
  distanceMeters: z.number().positive(),
  durationSeconds: z.number().int().positive(),
  avgPaceSecPerKm: z.number().int().positive(),
  avgHeartRate: z.number().int().min(30).max(220).nullable(),
  maxHeartRate: z.number().int().min(30).max(220).nullable(),
  avgCadence: z.number().int().min(100).max(230).nullable(),
  isRest: z.boolean(),
})
export type Lap = z.infer<typeof LapSchema>

// Validates ActivityLap Prisma record (adds id, activityId, createdAt)
export const DbLapSchema = LapSchema.extend({
  id: z.string().cuid(),
  activityId: z.string(),
  createdAt: z.date(),
})
export type DbLap = z.infer<typeof DbLapSchema>

// ─── Generated activity schema ────────────────────────────────────────────────

// Validates ActivityData from generate-training-plan.
// All numeric fields are required (generated data never produces nulls for HR/cadence).
export const GeneratedActivitySchema = z.object({
  source: ActivitySourceSchema,
  startedAt: z.date(),
  distanceMeters: z.number().positive(),
  durationSeconds: z.number().int().positive(),
  movingTimeSeconds: z.number().int().positive(),
  elevationGainMeters: z.number(),
  avgPaceSecPerKm: z.number().int().positive(),
  avgHeartRate: z.number().int().min(30).max(220),
  maxHeartRate: z.number().int().min(30).max(220),
  avgCadence: z.number().int().min(100).max(230),
  calories: z.number().int().positive(),
  trainingLoad: z.number().positive(),
  workoutType: WorkoutTypeSchema,
  workoutTypeConfidence: z.number().min(0).max(1),
  workoutTypeExplanation: z.string().min(1),
  executionEvaluation: z.string().min(1),
  intendedWorkoutType: WorkoutTypeSchema,
  trainingPhase: TrainingPhaseSchema,
  trainingWeek: z.number().int().min(1),
  hasGps: z.boolean(),
  laps: z.array(LapSchema).min(1),
})
export type GeneratedActivity = z.infer<typeof GeneratedActivitySchema>

// ─── DB activity schema ───────────────────────────────────────────────────────

// Validates a Prisma Activity record.
// Prisma defines some aggregate fields as nullable (Int?) even for generated data.
export const DbActivitySchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  source: ActivitySourceSchema,
  stravaActivityId: z.bigint().nullable(),
  startedAt: z.date(),
  distanceMeters: z.number().positive(),
  durationSeconds: z.number().int().positive(),
  movingTimeSeconds: z.number().int().positive(),
  elevationGainMeters: z.number().nullable(),
  avgPaceSecPerKm: z.number().int().positive(),
  avgHeartRate: z.number().int().min(30).max(220).nullable(),
  maxHeartRate: z.number().int().min(30).max(220).nullable(),
  avgCadence: z.number().int().min(100).max(230).nullable(),
  calories: z.number().int().positive().nullable(),
  trainingLoad: z.number().positive(),
  workoutType: WorkoutTypeSchema,
  workoutTypeConfidence: z.number().min(0).max(1).nullable(),
  workoutTypeExplanation: z.string().nullable(),
  executionEvaluation: z.string().nullable(),
  intendedWorkoutType: WorkoutTypeSchema.nullable(),
  trainingPhase: TrainingPhaseSchema.nullable(),
  trainingWeek: z.number().int().min(1).nullable(),
  hasGps: z.boolean(),
  tcxPath: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type DbActivity = z.infer<typeof DbActivitySchema>

// DB activity with laps included (Prisma include: { laps: true })
export const DbActivityWithLapsSchema = DbActivitySchema.extend({
  laps: z.array(DbLapSchema),
})
export type DbActivityWithLaps = z.infer<typeof DbActivityWithLapsSchema>
