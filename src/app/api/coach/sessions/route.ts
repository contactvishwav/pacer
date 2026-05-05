// GET  /api/coach/sessions — list all sessions for the athlete
// POST /api/coach/sessions — create a new session

import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import { listSessions, createSession } from '../../../../lib/coach/sessions'
import { apiSuccess, apiError } from '../../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const sessions = await listSessions(athlete.id)
  return NextResponse.json(apiSuccess({ sessions }))
}

export async function POST() {
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const session = await createSession(athlete.id)
  return NextResponse.json(apiSuccess(session), { status: 201 })
}
