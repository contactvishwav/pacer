// PATCH  /api/coach/sessions/[sessionId] — rename a session
// DELETE /api/coach/sessions/[sessionId] — delete a session and all its messages

import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db/prisma'
import { renameSession, deleteSession } from '../../../../../lib/coach/sessions'
import { apiSuccess, apiError } from '../../../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found.'),
      { status: 404 },
    )
  }

  let name: string
  try {
    const body = await request.json()
    name = typeof body.name === 'string' ? body.name : ''
  } catch {
    name = ''
  }

  if (!name.trim()) {
    return NextResponse.json(
      apiError('Request body must include a non-empty "name" field.'),
      { status: 400 },
    )
  }

  const updated = await renameSession(sessionId, athlete.id, name)
  if (!updated) {
    return NextResponse.json(apiError('Session not found.'), { status: 404 })
  }

  return NextResponse.json(apiSuccess(updated))
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found.'),
      { status: 404 },
    )
  }

  const deleted = await deleteSession(sessionId, athlete.id)
  if (!deleted) {
    return NextResponse.json(apiError('Session not found.'), { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
