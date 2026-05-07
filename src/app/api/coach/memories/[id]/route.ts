// DELETE /api/coach/memories/[id] — delete a specific CoachMemory record
// PATCH  /api/coach/memories/[id] — update the summary of a CoachMemory record

import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db/prisma'
import { deleteMemory, updateMemory } from '../../../../../lib/coach/memory'
import { apiSuccess, apiError } from '../../../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const result = await deleteMemory(id, athlete.id)

  if (result === 'not_found') {
    return NextResponse.json(apiError('Memory not found.'), { status: 404 })
  }
  if (result === 'forbidden') {
    return NextResponse.json(apiError('Access denied.'), { status: 403 })
  }

  return NextResponse.json(apiSuccess({ deleted: true }))
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  let summary: string
  try {
    const body = await request.json()
    summary = typeof body.summary === 'string' ? body.summary.trim() : ''
  } catch {
    summary = ''
  }

  if (summary.length < 10) {
    return NextResponse.json(
      apiError('Summary must be at least 10 characters.'),
      { status: 400 },
    )
  }
  if (summary.length > 300) {
    return NextResponse.json(
      apiError('Summary must be 300 characters or fewer.'),
      { status: 400 },
    )
  }

  const result = await updateMemory(id, athlete.id, summary)

  if (result === 'not_found') {
    return NextResponse.json(apiError('Memory not found.'), { status: 404 })
  }
  if (result === 'forbidden') {
    return NextResponse.json(apiError('Access denied.'), { status: 403 })
  }

  return NextResponse.json(apiSuccess({ memory: result }))
}
