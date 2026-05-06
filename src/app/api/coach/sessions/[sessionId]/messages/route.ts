// GET  /api/coach/sessions/[sessionId]/messages — message history for a session
// POST /api/coach/sessions/[sessionId]/messages — send message, stream Claude response
//
// Streaming format: plain UTF-8 text chunks.
// Fallback sentinel: __FALLBACK__\n prepended when API key absent or Claude returns 401.
// Memory extraction: fire-and-forget secondary Claude call after each successful turn.
// Memory is global per athlete — CoachMemory is never scoped to a session.

import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db/prisma'
import { buildCoachContext } from '../../../../../../lib/intelligence/context'
import { buildSystemPrompt } from '../../../../../../lib/coach/system-prompt'
import { anthropic, COACH_MODEL } from '../../../../../../lib/coach/claude'
import { buildDeterministicCoachingResponse } from '../../../../../../lib/coach/deterministic'
import { getSessionMessages, touchSession } from '../../../../../../lib/coach/sessions'
import { apiSuccess, apiError } from '../../../../../../lib/schemas/api'

export const runtime    = 'nodejs'
export const maxDuration = 60
export const dynamic    = 'force-dynamic'

// ─── Memory extraction ────────────────────────────────────────────────────────
// Unchanged from the conversations route — memory is global per athlete.
// sessionId is passed as the tracking reference in CoachMemory.conversationId
// (CoachMemory.conversationId is a plain nullable string with no FK, safe to repurpose).

async function maybeExtractMemory(
  athleteId:         string,
  sessionId:         string,
  userMessage:       string,
  assistantResponse: string,
): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) return

  // Pre-filter: skip extraction for short messages with no durable-
  // context signals. Reduces API cost ~60-70% at scale.
  // See docs/PRODUCTION_AUDIT.md §13.3
  const HIGH_SIGNAL_KEYWORDS = [
    'prefer', 'prefer not', 'like to', "don't like", "can't", 'cannot',
    'injury', 'injured', 'hurt', 'pain', 'knee', 'ankle', 'shin', 'calf',
    'schedule', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
    'morning', 'evening', 'weekend',
    'goal', 'target', 'hoping to', 'want to', 'trying to',
    'history', "i've been", "i have been", 'always', 'usually', 'tend to',
  ]

  const messageIsLong = userMessage.length > 60
  const hasHighSignalKeyword = HIGH_SIGNAL_KEYWORDS.some(kw =>
    userMessage.toLowerCase().includes(kw)
  )

  if (!messageIsLong && !hasHighSignalKeyword) return

  try {
    const extractionResponse = await anthropic.messages.create({
      model:      COACH_MODEL,
      max_tokens: 150,
      messages: [{
        role:    'user',
        content: `You are extracting durable coaching context from a conversation turn.

Athlete message: "${userMessage}"
Coach response: "${assistantResponse.slice(0, 500)}"

Does this turn contain durable athlete context worth remembering across future sessions? Examples of durable context: injury history, training preferences, schedule constraints, personal goals, race history.

Respond with ONLY one of:
1. The word: null
2. A summary starting with exactly "Athlete: " (capital A, colon, space — no preamble before it)

Valid example: "Athlete: prefers morning runs and has a history of left knee pain that flares during high-mileage weeks."
Invalid: "Athlete prefers..." (missing colon) or "Sure! Athlete: ..." (has preamble)`,
      }],
    })

    const content = extractionResponse.content[0]
    if (content.type !== 'text') return
    const text = content.text.trim()
    if (text === 'null' || !text.startsWith('Athlete: ')) return

    let messageCount = 0
    try {
      messageCount = await prisma.coachMessage.count({ where: { sessionId } })
    } catch {
      // non-fatal — use 0 as fallback turn marker
    }

    await prisma.coachMemory.create({
      data: {
        athleteId,
        conversationId: sessionId,   // repurposed as session tracking reference
        summary:        text,
        turnRangeStart: messageCount,
        turnRangeEnd:   messageCount,
      },
    })
  } catch (err) {
    console.error('[Pacer] Memory extraction failed silently:', err)
  }
}

// ─── GET: session message history ─────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  const messages = await getSessionMessages(sessionId, athlete.id)
  if (messages === null) {
    return NextResponse.json(apiError('Session not found.'), { status: 404 })
  }

  return NextResponse.json(apiSuccess({ sessionId, messages }))
}

// ─── POST: send message + stream response ─────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params

  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    return NextResponse.json(
      apiError('No athlete data found. Run npx prisma db seed first.'),
      { status: 404 },
    )
  }

  // Verify session belongs to this athlete
  const session = await prisma.coachSession.findUnique({ where: { id: sessionId } })
  if (!session || session.athleteId !== athlete.id) {
    return NextResponse.json(apiError('Session not found.'), { status: 404 })
  }

  let userMessage: string
  let activityId: string | undefined
  try {
    const body = await request.json()
    userMessage = typeof body.message === 'string' ? body.message.trim() : ''
    activityId  = typeof body.activityId === 'string' ? body.activityId : undefined
  } catch {
    userMessage = ''
  }
  if (!userMessage || userMessage.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'Message cannot be empty.' },
      { status: 400 },
    )
  }
  if (userMessage.length > 4000) {
    return NextResponse.json(
      { success: false, error: 'Message too long. Maximum 4000 characters.' },
      { status: 400 },
    )
  }

  // Build context scoped to this session's message history
  const coachCtx = await buildCoachContext(athlete.id, activityId, sessionId)
  const systemPrompt = buildSystemPrompt(coachCtx)

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...coachCtx.conversationHistory,
    { role: 'user', content: userMessage },
  ]

  // Persist user message (no conversationId — session-based messages only need sessionId)
  await prisma.coachMessage.create({
    data: { sessionId, role: 'USER', content: userMessage },
  })

  // ── Gap 2A: deterministic fallback when API key is absent ──────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY
  const keyIsMissing = !apiKey || apiKey.trim() === ''
  if (keyIsMissing) {
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
        sessionId,
        role:       'ASSISTANT',
        content:    fallbackText,
        tokenCount: Math.ceil(fallbackText.length / 4),
      },
    })
    void touchSession(sessionId)
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

        const suggestedMatch    = fullText.match(/→\s+(.+)$/)
        const suggestedQuestion = suggestedMatch?.[1]?.trim() ?? null

        await prisma.coachMessage.create({
          data: {
            sessionId,
            role:     'ASSISTANT',
            content:  fullText,
            metadata: suggestedQuestion
              ? { suggestedQuestions: [suggestedQuestion] }
              : undefined,
          },
        })

        void touchSession(sessionId)
        void maybeExtractMemory(athlete.id, sessionId, userMessage, fullText)

        controller.close()

      } catch (error: unknown) {
        const isAuthError = error instanceof Anthropic.AuthenticationError

        if (isAuthError) {
          console.warn('[Pacer] Anthropic API authentication failed — using deterministic fallback')
          controller.enqueue(encoder.encode('__FALLBACK__\n'))
        } else {
          console.error('[Pacer] Claude API call failed — using deterministic fallback', error)
        }

        const fallbackText    = buildDeterministicCoachingResponse(coachCtx)
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
            sessionId,
            role:       'ASSISTANT',
            content:    combinedContent,
            tokenCount: Math.ceil(combinedContent.length / 4),
          },
        })

        void touchSession(sessionId)
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
