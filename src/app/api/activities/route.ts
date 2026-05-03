// GET /api/activities?limit=N
//
// Paginated list of activities for the seeded athlete.
// limit: 1–50, default 20.

import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { apiSuccess, apiError } from '../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

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

export async function GET(request: Request) {
  // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const raw   = parseInt(searchParams.get('limit') ?? '20', 10)
    const limit = Math.min(Math.max(isNaN(raw) ? 20 : raw, 1), 50)

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where:   { athleteId: athlete.id },
        orderBy: { startedAt: 'desc' },
        take:    limit,
      }),
      prisma.activity.count({ where: { athleteId: athlete.id } }),
    ])

    return NextResponse.json(apiSuccess({
      activities: activities.map(a => {
        const distanceKm = Math.round(a.distanceMeters / 100) / 10
        return {
          id:                  a.id,
          name:                activityName(a.workoutType, distanceKm),
          date:                a.startedAt.toISOString().slice(0, 10),
          workoutType:         a.workoutType,
          executionEvaluation: a.executionEvaluation,
          distanceKm,
          durationMinutes:     Math.round(a.durationSeconds / 60),
          avgHR:               a.avgHeartRate,
          avgPaceFormatted:    formatPace(a.avgPaceSecPerKm),
          trainingLoad:        a.trainingLoad,
          elevationGain:       a.elevationGainMeters,
        }
      }),
      total,
    }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        success: false,
        error:   'Failed to load activities',
        ...(process.env.NODE_ENV !== 'production' ? { details: msg } : {}),
      },
      { status: 500 },
    )
  }
}
