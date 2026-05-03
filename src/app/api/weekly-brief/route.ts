// GET /api/weekly-brief
//
// Returns the deterministic weekly coaching brief plus a summary card
// of the key signals that drove it.

import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { buildAthleteIntelligenceContext } from '../../../lib/intelligence/context'
import { apiSuccess, apiError } from '../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

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

    return NextResponse.json(apiSuccess({
      brief: ctx.weeklyBrief,
      summary: {
        weeklyLoad:        ctx.trainingLoad.weeklyLoad,
        acwr:              ctx.injuryRisk.acwr,
        phase:             ctx.phase.phase,
        daysUntilRace:     ctx.phase.daysUntilRace,
        racePredictionGap: ctx.racePrediction.gapToGoalFormatted,
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
