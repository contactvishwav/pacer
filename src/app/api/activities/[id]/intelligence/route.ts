// GET /api/activities/[id]/intelligence
//
// Returns deterministic activity intelligence: classification, coaching notes,
// and current fitness context. No Claude call — entirely rule-based.

import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db/prisma'
import { buildAthleteIntelligenceContext } from '../../../../../lib/intelligence/context'
import type { PeriodizationResult } from '../../../../../lib/intelligence/periodization'
import type { TrainingLoadResult } from '../../../../../lib/intelligence/training-load'
import { apiSuccess, apiError } from '../../../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

// ─── Presentation helpers ─────────────────────────────────────────────────────

function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm) % 60
  return `${m}:${String(s).padStart(2, '0')}/km`
}

function activityName(type: string, distanceKm: number): string {
  const labels: Record<string, string> = {
    EASY:         'Easy Run',
    RECOVERY:     'Recovery Run',
    STEADY_STATE: 'Steady State Run',
    TEMPO:        'Tempo Run',
    THRESHOLD:    'Threshold Run',
    INTERVAL:     'Interval Session',
    LONG_RUN:     'Long Run',
    RACE:         'Race',
    UNKNOWN:      'Run',
  }
  return `${distanceKm.toFixed(1)}km ${labels[type] ?? 'Run'}`
}

function workoutLabel(type: string): string {
  const labels: Record<string, string> = {
    EASY:         'easy run',
    RECOVERY:     'recovery run',
    STEADY_STATE: 'steady-state run',
    TEMPO:        'tempo session',
    THRESHOLD:    'threshold session',
    INTERVAL:     'interval workout',
    LONG_RUN:     'long run',
    RACE:         'race',
  }
  return labels[type] ?? 'workout'
}

// ─── Coaching copy builders (deterministic, no AI) ────────────────────────────

function buildPhaseSummary(workoutType: string, phase: PeriodizationResult): string {
  return (
    `This ${workoutLabel(workoutType)} fits your current ` +
    `${phase.phase.toLowerCase()} phase — ${phase.coachingImplication}`
  )
}

function buildLoadImpact(load: number, tl: TrainingLoadResult): string {
  const direction =
    tl.trend === 'improving'  ? 'building' :
    tl.trend === 'declining'  ? 'declining' :
    'stable'
  return (
    `This session contributed ${Math.round(load)} TRIMP to your weekly load. ` +
    `CTL is ${tl.ctl.toFixed(1)} — fitness is ${direction}.`
  )
}

function executionLabel(ev: string | null): string {
  const labels: Record<string, string> = {
    MATCHED_INTENT:   'Workout executed as intended.',
    WELL_EXECUTED:    'Clean execution — session matched the target stimulus.',
    TOO_HARD:         'Effort exceeded the prescribed training zone.',
    TOO_EASY:         'Effort was below the prescribed training zone.',
    UNEVEN_EXECUTION: 'Uneven effort across the session.',
  }
  return ev ? (labels[ev] ?? ev) : ''
}

function buildFollowUpQuestion(workoutType: string, execEval: string | null): string {
  const isEasyOrRecovery = workoutType === 'EASY' || workoutType === 'RECOVERY'

  if (execEval === 'TOO_HARD' && isEasyOrRecovery) {
    return 'Why does it matter that I ran this easy run too hard?'
  }
  if (execEval === 'WELL_EXECUTED' && workoutType === 'TEMPO') {
    return 'How does this tempo session affect my race prediction?'
  }
  if (workoutType === 'INTERVAL' && execEval === 'WELL_EXECUTED') {
    return 'Are my interval sessions building the right fitness for my goal race?'
  }
  return 'How does this workout fit into my current training phase?'
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  try {
    // Load activity and intelligence context in parallel
    const [activity, ctx] = await Promise.all([
      prisma.activity.findUnique({ where: { id } }),
      buildAthleteIntelligenceContext(athlete.id),
    ])

    if (!activity || activity.athleteId !== athlete.id) {
      return NextResponse.json(apiError('Activity not found.'), { status: 404 })
    }

    const distanceKm = Math.round(activity.distanceMeters / 100) / 10

    return NextResponse.json(apiSuccess({
      activity: {
        id:              activity.id,
        name:            activityName(activity.workoutType, distanceKm),
        date:            activity.startedAt.toISOString().slice(0, 10),
        distanceKm,
        durationMinutes: Math.round(activity.durationSeconds / 60),
        avgHR:           activity.avgHeartRate,
        avgPaceFormatted: formatPace(activity.avgPaceSecPerKm),
        elevationGain:   activity.elevationGainMeters,
      },
      classification: {
        workoutType:         activity.workoutType,
        confidence:          activity.workoutTypeConfidence,
        executionEvaluation: activity.executionEvaluation,
        executionNote:       activity.workoutTypeExplanation,
      },
      coaching: {
        phaseSummary:    buildPhaseSummary(activity.workoutType, ctx.phase),
        loadImpact:      buildLoadImpact(activity.trainingLoad, ctx.trainingLoad),
        executionNote:   executionLabel(activity.executionEvaluation),
        followUpQuestion: buildFollowUpQuestion(activity.workoutType, activity.executionEvaluation),
      },
      currentFitness: {
        ctl:  ctx.trainingLoad.ctl,
        atl:  ctx.trainingLoad.atl,
        tsb:  ctx.trainingLoad.tsb,
        acwr: ctx.injuryRisk.acwr,
      },
    }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        success: false,
        error:   'Failed to compute intelligence context',
        ...(process.env.NODE_ENV !== 'production' ? { details: msg } : {}),
      },
      { status: 500 },
    )
  }
}
