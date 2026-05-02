import { z } from 'zod'

export const WorkoutTypeSchema = z.enum([
  'EASY',
  'RECOVERY',
  'STEADY_STATE',
  'TEMPO',
  'THRESHOLD',
  'INTERVAL',
  'LONG_RUN',
  'RACE',
  'UNKNOWN',
])
export type WorkoutType = z.infer<typeof WorkoutTypeSchema>

export const TrainingPhaseSchema = z.enum([
  'BASE',
  'BUILD',
  'PEAK',
  'TAPER',
  'RECOVERY',
  'UNSTRUCTURED',
])
export type TrainingPhase = z.infer<typeof TrainingPhaseSchema>

export const ActivitySourceSchema = z.enum(['GENERATED', 'STRAVA', 'MANUAL'])
export type ActivitySource = z.infer<typeof ActivitySourceSchema>

export const MessageRoleSchema = z.enum(['USER', 'ASSISTANT', 'SYSTEM'])
export type MessageRole = z.infer<typeof MessageRoleSchema>

export const ConversationContextSchema = z.enum([
  'DASHBOARD',
  'ACTIVITY',
  'RACE_GOAL',
  'WEEKLY_BRIEF',
  'GENERAL',
])
export type ConversationContext = z.infer<typeof ConversationContextSchema>
