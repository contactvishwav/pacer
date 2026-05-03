// GET  /api/coach/conversations/[id]/messages — conversation history
// POST /api/coach/conversations/[id]/messages — send message, stream Claude response
//
// Streaming format: plain UTF-8 text chunks.
// Suggested follow-up question appears on the last line prefixed with "→ ".

import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db/prisma'
import { buildCoachContext } from '../../../../../../lib/intelligence/context'
import { buildSystemPrompt } from '../../../../../../lib/coach/system-prompt'
import { anthropic, COACH_MODEL } from '../../../../../../lib/coach/claude'
import { apiSuccess, apiError } from '../../../../../../lib/schemas/api'

export const runtime    = 'nodejs'
export const maxDuration = 60
export const dynamic    = 'force-dynamic'

// ─── GET: conversation history ────────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: conversationId } = await params

  // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const conversation = await prisma.coachConversation.findUnique({
    where: { id: conversationId },
  })
  if (!conversation || conversation.athleteId !== athlete.id) {
    return NextResponse.json(apiError('Conversation not found.'), { status: 404 })
  }

  const messages = await prisma.coachMessage.findMany({
    where:   { conversationId },
    orderBy: { createdAt: 'asc' },
    take:    50,
  })

  return NextResponse.json(apiSuccess({
    conversationId,
    contextType: conversation.contextType,
    title:       conversation.title,
    messages: messages
      .filter(m => m.role !== 'SYSTEM')
      .map(m => ({
        id:        m.id,
        role:      m.role.toLowerCase() as 'user' | 'assistant',
        content:   m.content,
        createdAt: m.createdAt.toISOString(),
        metadata:  m.metadata ?? null,
      })),
  }))
}

// ─── POST: send message + stream response ─────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: conversationId } = await params

  // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const conversation = await prisma.coachConversation.findUnique({
    where: { id: conversationId },
  })
  if (!conversation || conversation.athleteId !== athlete.id) {
    return NextResponse.json(apiError('Conversation not found.'), { status: 404 })
  }

  let userMessage: string
  try {
    const body = await request.json()
    userMessage = typeof body.message === 'string' ? body.message.trim() : ''
  } catch {
    userMessage = ''
  }
  if (!userMessage) {
    return NextResponse.json(
      apiError('Request body must include a non-empty "message" field.'),
      { status: 400 },
    )
  }

  // Build context (loads last 8 messages + memories from DB)
  const coachCtx = await buildCoachContext(
    athlete.id,
    conversation.activityId ?? undefined,
  )

  const systemPrompt = buildSystemPrompt(coachCtx)

  // Messages to send to Claude: bounded history + new user turn
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...coachCtx.conversationHistory,
    { role: 'user', content: userMessage },
  ]

  // Persist user message before starting stream
  await prisma.coachMessage.create({
    data: { conversationId, role: 'USER', content: userMessage },
  })

  const encoder  = new TextEncoder()
  let   fullText = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model:      COACH_MODEL,
          max_tokens: 1024,
          system:     systemPrompt,
          messages,
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullText  += text
            controller.enqueue(encoder.encode(text))
          }
        }

        // Extract suggested question from "→ ..." line for metadata
        const suggestedMatch = fullText.match(/→\s+(.+)$/)
        const suggestedQuestion = suggestedMatch?.[1]?.trim() ?? null

        // Persist assistant message with optional metadata
        await prisma.coachMessage.create({
          data: {
            conversationId,
            role:     'ASSISTANT',
            content:  fullText,
            metadata: suggestedQuestion
              ? { suggestedQuestions: [suggestedQuestion] }
              : undefined,
          },
        })

      } catch (err) {
        console.error('[Pacer] Coach stream error:', err)
        controller.enqueue(
          encoder.encode('\n\n[Coach unavailable — please try again]'),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':           'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control':          'no-cache',
    },
  })
}
