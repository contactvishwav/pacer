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
import { buildDeterministicCoachingResponse } from '../../../../../../lib/coach/deterministic'
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

  // ── Gap 2A: deterministic fallback when API key is absent ─────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Pacer] ANTHROPIC_API_KEY not configured — using deterministic coaching fallback')
    const fallbackText = buildDeterministicCoachingResponse(coachCtx)
    const enc = new TextEncoder()
    const fallbackStream = new ReadableStream({
      async start(controller) {
        controller.enqueue(enc.encode('__FALLBACK__\n'))
        const tokens = fallbackText.split(' ')
        for (const token of tokens) {
          controller.enqueue(enc.encode(token + ' '))
          await new Promise(r => setTimeout(r, 20))
        }
        controller.close()
      },
    })
    await prisma.coachMessage.create({
      data: {
        conversationId,
        role:       'ASSISTANT',
        content:    fallbackText,
        tokenCount: Math.ceil(fallbackText.length / 4),
      },
    })
    return new Response(fallbackStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

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

        controller.close()

      } catch (err) {
        console.error('[Pacer] Claude API call failed — using deterministic coaching fallback', err)
        const fallbackText = buildDeterministicCoachingResponse(coachCtx)
        const combinedContent = fullText
          ? fullText + '\n\n' + fallbackText
          : fallbackText

        const tokens = fallbackText.split(' ')
        for (const token of tokens) {
          controller.enqueue(encoder.encode(token + ' '))
          await new Promise(r => setTimeout(r, 20))
        }

        await prisma.coachMessage.create({
          data: {
            conversationId,
            role:       'ASSISTANT',
            content:    combinedContent,
            tokenCount: Math.ceil(combinedContent.length / 4),
          },
        })

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
