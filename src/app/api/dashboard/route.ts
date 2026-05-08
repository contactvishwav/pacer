// GET /api/dashboard
//
// Returns the full intelligence context shaped for the dashboard view.
// Answers the five coaching questions: phase, risk, race track, weekly focus, coach prompt.

import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { buildAthleteIntelligenceContext } from '../../../lib/intelligence/context'
import { apiSuccess, apiError } from '../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

function formatGoalTime(s: number): string {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export async function GET() {
  // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  try {
    const ctx = await buildAthleteIntelligenceContext(athlete.id)

    const maxHR       = ctx.athlete.maxHeartRate  ?? 185
    const thresholdHR = Math.round(maxHR * 0.919)   // lactate threshold ~92 % maxHR
    const easyHRCeil  = Math.round(maxHR * 0.785)   // Zone 2 upper ~78–79 % maxHR

    const response = NextResponse.json(apiSuccess({
      athlete: {
        name:         ctx.athlete.name,
        thresholdHR,
        easyHRCeiling: easyHRCeil,
      },
      goalRace: ctx.goalRace ? {
        name:              ctx.goalRace.raceName,
        raceDate:          ctx.goalRace.raceDate.toISOString().slice(0, 10),
        distanceKm:        ctx.goalRace.distanceMeters / 1000,
        goalTimeFormatted: ctx.goalRace.goalTimeSeconds
          ? formatGoalTime(ctx.goalRace.goalTimeSeconds)
          : '—',
        daysUntilRace: ctx.phase.daysUntilRace,
      } : null,
      phase: {
        phase:               ctx.phase.phase,
        confidence:          ctx.phase.confidence,
        primaryReason:       ctx.phase.primaryReason,
        coachingImplication: ctx.phase.coachingImplication,
        daysUntilRace:       ctx.phase.daysUntilRace,
      },
      injuryRisk: {
        category:            ctx.injuryRisk.category,
        acwr:                ctx.injuryRisk.acwr,
        explanation:         ctx.injuryRisk.explanation,
        recommendedAction:   ctx.injuryRisk.recommendedAction,
        contributingFactors: ctx.injuryRisk.contributingFactors,
        acwrHistory:         ctx.injuryRisk.acwrHistory,
      },
      trainingLoad: {
        ctl:         ctx.trainingLoad.ctl,
        atl:         ctx.trainingLoad.atl,
        tsb:         ctx.trainingLoad.tsb,
        trend:       ctx.trainingLoad.trend,
        weeklyLoad:  ctx.trainingLoad.weeklyLoad,
        explanation: ctx.trainingLoad.explanation,
      },
      racePrediction: {
        predictedTimeFormatted:  ctx.racePrediction.predictedTimeFormatted,
        confidenceLowFormatted:  ctx.racePrediction.confidenceLowFormatted,
        confidenceHighFormatted: ctx.racePrediction.confidenceHighFormatted,
        confidenceScore:         ctx.racePrediction.confidenceScore,
        gapToGoalFormatted:      ctx.racePrediction.gapToGoalFormatted,
        whatNeedsToHappen:       ctx.racePrediction.whatNeedsToHappen,
      },
      weeklyBrief:       ctx.weeklyBrief,
      recentActivities:  ctx.recentActivities.slice(0, 5),
    }))
    response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return response
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
