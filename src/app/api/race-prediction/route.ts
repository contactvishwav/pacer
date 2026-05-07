// GET /api/race-prediction
//
// Returns the full race prediction result plus the supporting fitness signals
// that informed the projection.

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

    const response = NextResponse.json(apiSuccess({
      prediction: ctx.racePrediction,
      goalRace: ctx.goalRace ? {
        name:              ctx.goalRace.raceName,
        raceDate:          ctx.goalRace.raceDate.toISOString().slice(0, 10),
        distanceKm:        ctx.goalRace.distanceMeters / 1000,
        goalTimeFormatted: ctx.goalRace.goalTimeSeconds
          ? formatGoalTime(ctx.goalRace.goalTimeSeconds)
          : '—',
      } : null,
      supportingSignals: {
        phase:      ctx.phase.phase,
        ctl:        ctx.trainingLoad.ctl,
        tsb:        ctx.trainingLoad.tsb,
        trend:      ctx.trainingLoad.trend,
        weeksOfData: ctx.weeklySummaries.length,
      },
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
