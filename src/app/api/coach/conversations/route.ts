// POST /api/coach/conversations
//
// Creates a new coaching conversation anchored to a context type.
// Returns the conversation ID used for all subsequent message calls.
//
// Body: { contextType?, activityId?, title? }
//   contextType: 'DASHBOARD' | 'ACTIVITY' | 'RACE_GOAL' | 'WEEKLY_BRIEF' | 'GENERAL' (default)

import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import { apiSuccess, apiError } from '../../../../lib/schemas/api'

export const dynamic = 'force-dynamic'

const CONTEXT_TITLES: Record<string, string> = {
  DASHBOARD:    'Training Overview',
  ACTIVITY:     'Activity Debrief',
  RACE_GOAL:    'Race Planning',
  WEEKLY_BRIEF: 'Weekly Brief',
  GENERAL:      'Coach Chat',
}

const VALID_CONTEXTS = new Set(Object.keys(CONTEXT_TITLES))

export async function POST(request: Request) {
  // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const contextType =
    typeof body.contextType === 'string' && VALID_CONTEXTS.has(body.contextType)
      ? (body.contextType as keyof typeof CONTEXT_TITLES)
      : 'GENERAL'

  const activityId =
    contextType === 'ACTIVITY' && typeof body.activityId === 'string'
      ? body.activityId
      : undefined

  // Validate activityId belongs to this athlete
  if (activityId) {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity || activity.athleteId !== athlete.id) {
      return NextResponse.json(apiError('Activity not found.'), { status: 404 })
    }
  }

  const title =
    typeof body.title === 'string' && body.title.trim()
      ? body.title.trim()
      : CONTEXT_TITLES[contextType]

  const conversation = await prisma.coachConversation.create({
    data: {
      athleteId:   athlete.id,
      contextType: contextType as never,
      activityId:  activityId ?? null,
      title,
    },
  })

  return NextResponse.json(
    apiSuccess({
      conversationId: conversation.id,
      contextType:    conversation.contextType,
      title:          conversation.title,
      createdAt:      conversation.createdAt.toISOString(),
    }),
    { status: 201 },
  )
}
