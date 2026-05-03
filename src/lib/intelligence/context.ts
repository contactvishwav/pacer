// ─── Central intelligence context builder ─────────────────────────────────────
//
// Single integration point for all six intelligence engines.
// Every API route and Claude call goes through this file.
// Never call individual engines directly from route handlers.
//
// Two exported functions:
//   buildAthleteIntelligenceContext(athleteId)
//     → Full context for the dashboard and all read API routes.
//       Runs all six engines and returns everything needed to render the product.
//
//   buildCoachContext(athleteId, activityId?)
//     → Compact context sent to Claude on every coaching API call.
//       Targets < 2,000 tokens before the system prompt and user message.

import { prisma } from '../db/prisma'
import type {
  Athlete,
  GoalRace as PrismaGoalRace,
  WeeklyTrainingSummary,
  CoachMemory,
} from '@prisma/client'
import { computeTrainingLoad } from './training-load'
import type { TrainingLoadResult } from './training-load'
import { computeInjuryRisk } from './injury-risk'
import type { InjuryRiskResult } from './injury-risk'
import {
  detectTrainingPhase,
  type PeriodizationWeeklySummary,
} from './periodization'
import type { PeriodizationResult } from './periodization'
import {
  predictRaceTime,
  type ActivityWithClassification,
  type WeeklySummaryForPrediction,
  type GoalRace as EngineGoalRace,
  type RacePredictionEngineResult,
} from './race-prediction'
import { generateWeeklyBrief, type WeeklyBriefInput } from './weekly-brief'
import type { WeeklyBriefResult } from '../schemas/intelligence'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm) % 60
  return `${m}:${String(s).padStart(2, '0')}/km`
}

function formatGoalTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface RecentActivitySummary {
  id: string
  date: string              // "YYYY-MM-DD"
  workoutType: string
  executionEvaluation: string | null
  distanceKm: number
  durationMinutes: number
  avgHR: number | null
  trainingLoad: number
}

export interface AthleteIntelligenceContext {
  athlete: Athlete
  goalRace: PrismaGoalRace | null
  trainingLoad: TrainingLoadResult
  injuryRisk: InjuryRiskResult
  phase: PeriodizationResult
  racePrediction: RacePredictionEngineResult
  weeklyBrief: WeeklyBriefResult
  recentActivities: RecentActivitySummary[]  // last 10, most recent first
  weeklySummaries: WeeklyTrainingSummary[]   // last 12, chronological
  coachMemories: CoachMemory[]               // last 5, most recent first
}

// Compact context sent to Claude — kept under 2,000 tokens.
// Named CoachContext (canonical); the legacy coach.ts schema is a separate concern.
export interface CoachContext {
  athlete: {
    name: string
    thresholdHR: number
    easyHRCeiling: number
    restingHR: number
  }
  goalRace: {
    name: string
    raceDate: string           // "YYYY-MM-DD"
    distanceKm: number
    goalTimeFormatted: string  // "H:MM:SS" or "—"
    daysUntilRace: number
  } | null
  fitness: {
    ctl: number
    atl: number
    tsb: number
    acwr: number | null
    acwrCategory: string
    trend: string
    phase: string
    phaseConfidence: string
    daysUntilRace: number
  }
  injuryRisk: {
    category: string
    explanation: string
    recommendedAction: string
    contributingFactors: string[]
  }
  racePrediction: {
    predictedTimeFormatted: string
    confidenceScore: number
    gapToGoalFormatted: string
    whatNeedsToHappen: string
  } | null
  weeklyBrief: {
    lastWeekReview: string[]
    thisWeekPrescription: string[]
    keySignal: string
    warnings: string[]
    suggestedFocus: string
  }
  selectedActivity: {
    date: string
    workoutType: string
    distanceKm: number
    durationMinutes: number
    avgHR: number | null
    avgPaceFormatted: string
    executionEvaluation: string | null
    executionNote: string | null
    trainingLoad: number
  } | null
  recentActivities: Array<{
    date: string
    workoutType: string
    distanceKm: number
    executionEvaluation: string | null
    trainingLoad: number
  }>
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  memorySummary: string | null
}

// ─── buildAthleteIntelligenceContext ──────────────────────────────────────────

export async function buildAthleteIntelligenceContext(
  athleteId: string,
): Promise<AthleteIntelligenceContext> {
  const now            = new Date()
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 86_400_000)
  const eightWeeksAgo  = new Date(now.getTime() -  8 * 7 * 86_400_000)
  const fourWeeksAgo   = new Date(now.getTime() -  4 * 7 * 86_400_000)
  const twoWeeksAgo    = new Date(now.getTime() -  2 * 7 * 86_400_000)

  // Parallel DB loads — athlete, goal race, summaries, memories
  const [athlete, goalRace, allSummaries, coachMemories] = await Promise.all([
    prisma.athlete.findUniqueOrThrow({ where: { id: athleteId } }),
    prisma.goalRace.findFirst({
      where: { athleteId, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.weeklyTrainingSummary.findMany({
      where: { athleteId },
      orderBy: { weekNumber: 'asc' },
    }),
    prisma.coachMemory.findMany({
      where: { athleteId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Activities for the last 12 weeks, with laps for the classifier
  const activities = await prisma.activity.findMany({
    where: { athleteId, startedAt: { gte: twelveWeeksAgo } },
    include: { laps: true },
    orderBy: { startedAt: 'asc' },
  })

  const last12Summaries = allSummaries.slice(-12)

  // ── Engine 1: training load ───────────────────────────────────────────────
  const trainingLoad = computeTrainingLoad(
    activities.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })),
  )

  // ── Engine 2: injury risk ─────────────────────────────────────────────────
  const injuryRisk = computeInjuryRisk(
    activities.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })),
    last12Summaries,
  )

  // ── Engine 3: training phase ──────────────────────────────────────────────
  const periodizationSummaries: PeriodizationWeeklySummary[] = last12Summaries.map(s => ({
    weekNumber:          s.weekNumber,
    weekStartDate:       s.weekStartDate,
    totalLoad:           s.totalLoad,
    qualitySessionCount: s.qualitySessionCount,
    ctl:                 s.ctl,
    atl:                 s.atl,
    tsb:                 s.tsb,
    acwr:                s.acwr,
  }))

  // Fallback race date if no goal race: 90 days from now
  const raceDateForPhase = goalRace?.raceDate ?? new Date(now.getTime() + 90 * 86_400_000)

  const phase = detectTrainingPhase({
    goalRaceDate:     raceDateForPhase,
    weeklySummaries:  periodizationSummaries,
    currentInjuryRisk:   injuryRisk,
    currentTrainingLoad: trainingLoad,
    recentActivities: activities
      .filter(a => a.startedAt >= fourWeeksAgo)
      .map(a => ({
        startedAt:    a.startedAt,
        workoutType:  a.workoutType,
        trainingLoad: a.trainingLoad,
      })),
    referenceDate: now,
  })

  // ── Engine 4: race prediction ─────────────────────────────────────────────
  let racePrediction: RacePredictionEngineResult

  if (goalRace) {
    const engineGoalRace: EngineGoalRace = {
      raceName:        goalRace.raceName,
      raceDate:        goalRace.raceDate,
      distanceMeters:  goalRace.distanceMeters,
      goalTimeSeconds: goalRace.goalTimeSeconds,
    }

    const recentForPrediction: ActivityWithClassification[] = activities
      .filter(a => a.startedAt >= eightWeeksAgo)
      .map(a => ({
        startedAt:           a.startedAt,
        distanceMeters:      a.distanceMeters,
        movingTimeSeconds:   a.movingTimeSeconds,
        avgPaceSecPerKm:     a.avgPaceSecPerKm,
        workoutType:         a.workoutType,
        executionEvaluation: a.executionEvaluation,
      }))

    const summariesForPrediction: WeeklySummaryForPrediction[] = last12Summaries
      .filter(s => s.weekStartDate >= eightWeeksAgo)
      .map(s => ({
        weekNumber:    s.weekNumber,
        weekStartDate: s.weekStartDate,
        totalLoad:     s.totalLoad,
      }))

    racePrediction = predictRaceTime({
      goalRace:            engineGoalRace,
      recentActivities:    recentForPrediction,
      weeklySummaries:     summariesForPrediction,
      currentTrainingLoad: trainingLoad,
      currentPhase:        phase,
    })
  } else {
    racePrediction = {
      predictedTimeSeconds:    0,
      predictedTimeFormatted:  '—',
      confidenceLow:           0,
      confidenceLowFormatted:  '—',
      confidenceHigh:          0,
      confidenceHighFormatted: '—',
      confidenceScore:         10,
      gapToGoalSeconds:        null,
      gapToGoalFormatted:      '—',
      explanation:             'No active goal race set.',
      whatNeedsToHappen:       'Set a goal race to enable race prediction.',
      dataQualityNotes:        [],
      bestEffortActivity:      null,
    }
  }

  // ── Engine 5: weekly brief ────────────────────────────────────────────────
  const recentClassifiedActivities: ActivityWithClassification[] = activities
    .filter(a => a.startedAt >= twoWeeksAgo)
    .map(a => ({
      startedAt:           a.startedAt,
      distanceMeters:      a.distanceMeters,
      movingTimeSeconds:   a.movingTimeSeconds,
      avgPaceSecPerKm:     a.avgPaceSecPerKm,
      workoutType:         a.workoutType,
      executionEvaluation: a.executionEvaluation,
    }))

  const briefGoalRace: EngineGoalRace = goalRace
    ? {
        raceName:        goalRace.raceName,
        raceDate:        goalRace.raceDate,
        distanceMeters:  goalRace.distanceMeters,
        goalTimeSeconds: goalRace.goalTimeSeconds,
      }
    : {
        raceName:        'No race set',
        raceDate:        new Date(now.getTime() + 90 * 86_400_000),
        distanceMeters:  21097.5,
        goalTimeSeconds: null,
      }

  const briefInput: WeeklyBriefInput = {
    recentWeeklySummaries:      last12Summaries.slice(-4),
    currentInjuryRisk:          injuryRisk,
    currentPhase:               phase,
    currentTrainingLoad:        trainingLoad,
    racePrediction,
    goalRace:                   briefGoalRace,
    recentClassifiedActivities,
  }

  const weeklyBrief = generateWeeklyBrief(briefInput)

  // ── Recent activities for display ─────────────────────────────────────────
  const recentActivities: RecentActivitySummary[] = [...activities]
    .reverse()
    .slice(0, 10)
    .map(a => ({
      id:                  a.id,
      date:                a.startedAt.toISOString().slice(0, 10),
      workoutType:         a.workoutType,
      executionEvaluation: a.executionEvaluation,
      distanceKm:          Math.round(a.distanceMeters / 100) / 10,
      durationMinutes:     Math.round(a.durationSeconds / 60),
      avgHR:               a.avgHeartRate,
      trainingLoad:        a.trainingLoad,
    }))

  return {
    athlete,
    goalRace,
    trainingLoad,
    injuryRisk,
    phase,
    racePrediction,
    weeklyBrief,
    recentActivities,
    weeklySummaries: last12Summaries,
    coachMemories,
  }
}

// ─── buildCoachContext ────────────────────────────────────────────────────────

export async function buildCoachContext(
  athleteId: string,
  activityId?: string,
): Promise<CoachContext> {
  // Step 1: full intelligence context
  const ctx = await buildAthleteIntelligenceContext(athleteId)

  // Step 2: selected activity (if provided)
  let selectedActivity: CoachContext['selectedActivity'] = null
  if (activityId) {
    const act = await prisma.activity.findUnique({
      where: { id: activityId },
    })
    if (act) {
      selectedActivity = {
        date:                act.startedAt.toISOString().slice(0, 10),
        workoutType:         act.workoutType,
        distanceKm:          Math.round(act.distanceMeters / 100) / 10,
        durationMinutes:     Math.round(act.durationSeconds / 60),
        avgHR:               act.avgHeartRate,
        avgPaceFormatted:    formatPace(act.avgPaceSecPerKm),
        executionEvaluation: act.executionEvaluation,
        executionNote:       act.workoutTypeExplanation,
        trainingLoad:        act.trainingLoad,
      }
    }
  }

  // Steps 3 & 4: conversation history and memories — parallel
  const [rawMessages, memories] = await Promise.all([
    prisma.coachMessage.findMany({
      where:   { conversation: { athleteId } },
      orderBy: { createdAt: 'desc' },
      take:    8,
    }),
    prisma.coachMemory.findMany({
      where:   { athleteId },
      orderBy: { createdAt: 'desc' },
      take:    3,
    }),
  ])

  // Chronological order, filter system messages
  const conversationHistory = rawMessages
    .reverse()
    .filter(m => m.role !== 'SYSTEM')
    .map(m => ({
      role:    m.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }))

  // Concatenate memory summaries in chronological order
  const memorySummary = memories.length > 0
    ? [...memories].reverse().map(m => m.summary).join('\n\n')
    : null

  // HR zone derivation from stored maxHR / restingHR
  const maxHR     = ctx.athlete.maxHeartRate  ?? 185
  const restingHR = ctx.athlete.restingHeartRate ?? 52
  const easyHRCeiling = Math.round(maxHR * 0.785)   // Zone 2 upper bound (~78–79 %)
  const thresholdHR   = Math.round(maxHR * 0.919)   // Lactate threshold (~92 % max HR)

  // Step 5: assemble compact context
  const context: CoachContext = {
    athlete: {
      name:         ctx.athlete.name,
      thresholdHR,
      easyHRCeiling,
      restingHR,
    },
    goalRace: ctx.goalRace
      ? {
          name:               ctx.goalRace.raceName,
          raceDate:           ctx.goalRace.raceDate.toISOString().slice(0, 10),
          distanceKm:         ctx.goalRace.distanceMeters / 1000,
          goalTimeFormatted:  ctx.goalRace.goalTimeSeconds
            ? formatGoalTime(ctx.goalRace.goalTimeSeconds)
            : '—',
          daysUntilRace:      ctx.phase.daysUntilRace,
        }
      : null,
    fitness: {
      ctl:            ctx.trainingLoad.ctl,
      atl:            ctx.trainingLoad.atl,
      tsb:            ctx.trainingLoad.tsb,
      acwr:           ctx.injuryRisk.acwr,
      acwrCategory:   ctx.injuryRisk.category,
      trend:          ctx.trainingLoad.trend,
      phase:          ctx.phase.phase,
      phaseConfidence: ctx.phase.confidence,
      daysUntilRace:  ctx.phase.daysUntilRace,
    },
    injuryRisk: {
      category:            ctx.injuryRisk.category,
      explanation:         ctx.injuryRisk.explanation,
      recommendedAction:   ctx.injuryRisk.recommendedAction,
      contributingFactors: ctx.injuryRisk.contributingFactors,
    },
    racePrediction: ctx.racePrediction.predictedTimeSeconds > 0
      ? {
          predictedTimeFormatted: ctx.racePrediction.predictedTimeFormatted,
          confidenceScore:        ctx.racePrediction.confidenceScore,
          gapToGoalFormatted:     ctx.racePrediction.gapToGoalFormatted,
          whatNeedsToHappen:      ctx.racePrediction.whatNeedsToHappen,
        }
      : null,
    weeklyBrief: {
      lastWeekReview:       ctx.weeklyBrief.lastWeekReview,
      thisWeekPrescription: ctx.weeklyBrief.thisWeekPrescription,
      keySignal:            ctx.weeklyBrief.keySignal,
      warnings:             ctx.weeklyBrief.warnings,
      suggestedFocus:       ctx.weeklyBrief.suggestedFocus,
    },
    selectedActivity,
    recentActivities: ctx.recentActivities.map(a => ({
      date:                a.date,
      workoutType:         a.workoutType,
      distanceKm:          a.distanceKm,
      executionEvaluation: a.executionEvaluation,
      trainingLoad:        a.trainingLoad,
    })),
    conversationHistory,
    memorySummary,
  }

  // Step 6: token estimate warning
  const tokenCount = estimateContextTokens(context)
  if (tokenCount > 2500) {
    console.warn(
      `[Pacer] Coach context exceeds 2,500 estimated tokens (${tokenCount}) — ` +
      `consider compressing conversation history`,
    )
  }

  return context
}

// ─── estimateContextTokens ────────────────────────────────────────────────────

export function estimateContextTokens(context: CoachContext): number {
  return Math.round(JSON.stringify(context).length / 4)
}
