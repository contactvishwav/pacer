// GET  /api/coach/memories — list all CoachMemory records for the demo athlete
// DELETE /api/coach/memories — delete ALL CoachMemory records for the demo athlete

import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import { listMemories, deleteAllMemories } from '../../../../lib/coach/memory'
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

  const memories = await listMemories(athlete.id)
  return NextResponse.json(apiSuccess({ memories }))
}

export async function DELETE() {
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const deleted = await deleteAllMemories(athlete.id)
  return NextResponse.json(apiSuccess({ deleted }))
}
