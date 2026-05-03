// GET /api/context/debug
//
// Returns the full AthleteIntelligenceContext as JSON for the seeded athlete.
// Development only — returns 404 in production.

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { buildAthleteIntelligenceContext } from '../../../../lib/intelligence/context'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      { error: 'No athlete found. Run `npx prisma db seed` first.' },
      { status: 404 },
    )
  }

  const ctx = await buildAthleteIntelligenceContext(athlete.id)

  // Serialize safely — Dates become ISO strings via JSON
  return NextResponse.json(ctx)
}
