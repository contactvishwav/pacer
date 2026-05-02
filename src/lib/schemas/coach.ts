import { z } from 'zod'
import { TrainingPhaseSchema, MessageRoleSchema } from './enums'
import { RacePredictionResultSchema, ActivitySignalSchema } from './intelligence'
import { LapSchema } from './activity'
import { WorkoutTypeSchema } from './enums'

// ─── Coach context schema ─────────────────────────────────────────────────────

// The compact object serialized into the system prompt for every Claude call.
// Must not contain raw per-second GPS/HR streams — only computed signals.
// See AGENT_GUIDELINES §Claude streaming and APPROACH_DRAFT §The unified intelligence context.

export const CoachContextSchema = z.object({
  athlete: z.object({
    id: z.string(),
    name: z.string().min(1),
    goalRaceName: z.string().nullable(),
    goalRaceDate: z.date().nullable(),
    goalTimeSeconds: z.number().int().positive().nullable(),
  }),

  phase: z.object({
    current: TrainingPhaseSchema,
    weekNumber: z.number().int().min(1),
    totalWeeks: z.number().int().min(1),
    rationale: z.string(),
  }),

  fitness: z.object({
    ctl: z.number().nonnegative(),
    atl: z.number().nonnegative(),
    tsb: z.number(),
    acwr: z.number().nonnegative(),
    acwrCategory: z.enum(['optimal', 'caution', 'spike', 'low']),
  }),

  racePrediction: RacePredictionResultSchema.nullable(),

  weeklyBrief: z.object({
    phaseNote: z.string(),
    keyWorkoutNote: z.string(),
    riskNote: z.string(),
    priorityNote: z.string(),
    trajectoryNote: z.string(),
  }),

  recentWorkouts: z.array(ActivitySignalSchema),

  conversationHistory: z.array(
    z.object({
      role: MessageRoleSchema,
      content: z.string(),
    }),
  ),

  memorySummary: z.string().nullable(),

  // Only present for ACTIVITY-context conversations
  activityDetail: z
    .object({
      id: z.string(),
      workoutType: WorkoutTypeSchema,
      distanceMeters: z.number().positive(),
      durationSeconds: z.number().int().positive(),
      executionEvaluation: z.string().nullable(),
      laps: z.array(LapSchema),
    })
    .nullable()
    .optional(),
})

export type CoachContext = z.infer<typeof CoachContextSchema>
