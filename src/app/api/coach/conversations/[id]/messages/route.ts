// GET  /api/coach/conversations/[id]/messages — conversation history
// POST /api/coach/conversations/[id]/messages — send message, stream Claude response
//
// Streaming format: plain UTF-8 text chunks.
// Suggested follow-up question appears on the last line prefixed with "→ ".

import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db/prisma'
import { buildCoachContext, estimateContextTokens } from '../../../../../../lib/intelligence/context'
import { buildSystemPrompt } from '../../../../../../lib/coach/system-prompt'
import { anthropic, COACH_MODEL } from '../../../../../../lib/coach/claude'
import { buildDeterministicCoachingResponse } from '../../../../../../lib/coach/deterministic'
import { enforceMemoryRetentionPolicy } from '../../../../../../lib/coach/memory'
import { classifyCoachingResponse } from '../../../../../../lib/coach/safety-classifier'
import { apiSuccess, apiError } from '../../../../../../lib/schemas/api'

export const runtime    = 'nodejs'
export const maxDuration = 60
export const dynamic    = 'force-dynamic'

// ─── Memory extraction ────────────────────────────────────────────────────────
//
// After the assistant message is saved in the Claude success path, a small
// secondary Claude call determines whether the turn contained durable coaching
// context (preferences, constraints, injury history, goals). If so, a
// CoachMemory record is persisted so future sessions can surface it.
//
// Called fire-and-forget (void) — never blocks the streaming response.
// Errors are caught and logged silently; memory extraction is best-effort.

async function maybeExtractMemory(
  athleteId:         string,
  conversationId:    string,
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
    // Per-conversation extraction limit — diminishing returns past 5 memories
    const existingMemoriesForConversation = await prisma.coachMemory.count({
      where: { conversationId },
    })
    if (existingMemoriesForConversation >= 5) return

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

    // Isolated try-catch so a count failure never surfaces to the outer catch
    let messageCount = 0
    try {
      messageCount = await prisma.coachMessage.count({ where: { conversationId } })
    } catch {
      // non-fatal — use 0 as fallback turn marker
    }

    await prisma.coachMemory.create({
      data: {
        athleteId,
        conversationId,
        summary:        text,
        turnRangeStart: messageCount,
        turnRangeEnd:   messageCount,
      },
    })

    void enforceMemoryRetentionPolicy(athleteId)
  } catch (err) {
    console.error('[Pacer] Memory extraction failed silently:', err)
  }
}

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

  const MAX_MESSAGES_PER_CONVERSATION = 50

  const conversationMessageCount = await prisma.coachMessage.count({
    where: { conversationId: conversation.id },
  })
  if (conversationMessageCount >= MAX_MESSAGES_PER_CONVERSATION) {
    return NextResponse.json(
      {
        success: false,
        error: `Conversation limit reached (${MAX_MESSAGES_PER_CONVERSATION} messages). Start a new conversation to continue coaching.`,
      },
      { status: 429 },
    )
  }

  let userMessage: string
  try {
    const body = await request.json()
    userMessage = typeof body.message === 'string' ? body.message.trim() : ''
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

  // Build context (loads last 8 messages + memories from DB)
  const coachCtx = await buildCoachContext(
    athlete.id,
    conversation.activityId ?? undefined,
  )
  const contextTokenEstimate = estimateContextTokens(coachCtx)

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

        // Run safety classification — appends a disclaimer to the stream and
        // stored content if the response crosses the health-advice boundary.
        // The streamed tokens already reached the client; we cannot retract them,
        // but we can append a disclaimer and store the amended content in the DB.
        const SAFETY_DISCLAIMER = '\n\n---\n_Note: For medical concerns or injury assessment, please consult a qualified sports medicine professional._'

        const safetyResult = await classifyCoachingResponse(fullText, anthropic)
        let storedContent = fullText

        if (!safetyResult.passed) {
          console.log(JSON.stringify({
            event:   'safety_disclaimer_appended',
            reason:  safetyResult.reason,
            conversationId,
            timestamp: new Date().toISOString(),
          }))
          storedContent = fullText + SAFETY_DISCLAIMER
          // Stream the disclaimer token by token so it appears naturally
          const disclaimerTokens = SAFETY_DISCLAIMER.split(' ')
          for (const token of disclaimerTokens) {
            controller.enqueue(encoder.encode(token + ' '))
            await new Promise(r => setTimeout(r, 15))
          }
        }

        // Extract suggested question from "→ ..." line for metadata
        const suggestedMatch = storedContent.match(/→\s+(.+)$/)
        const suggestedQuestion = suggestedMatch?.[1]?.trim() ?? null

        // Persist assistant message with optional metadata
        await prisma.coachMessage.create({
          data: {
            conversationId,
            role:     'ASSISTANT',
            content:  storedContent,
            metadata: suggestedQuestion
              ? { suggestedQuestions: [suggestedQuestion] }
              : undefined,
          },
        })

        // Cost estimation — visible in Vercel function logs from day one
        const INPUT_COST_PER_MTK  = 3.00   // claude-sonnet-4-6 input $/MTok
        const OUTPUT_COST_PER_MTK = 15.00  // claude-sonnet-4-6 output $/MTok
        const estimatedOutputTokens = Math.ceil(storedContent.length / 4)
        const estimatedCostUSD =
          (contextTokenEstimate / 1_000_000 * INPUT_COST_PER_MTK) +
          (estimatedOutputTokens / 1_000_000 * OUTPUT_COST_PER_MTK)
        console.log(JSON.stringify({
          event:               'coach_turn_cost_estimate',
          conversationId,
          inputTokensEstimate:  contextTokenEstimate,
          outputTokensEstimate: estimatedOutputTokens,
          estimatedCostUSD:     estimatedCostUSD.toFixed(6),
          timestamp:            new Date().toISOString(),
        }))

        // Fire-and-forget memory extraction — runs after stream is closed,
        // never blocks the response.
        void maybeExtractMemory(athlete.id, conversationId, userMessage, storedContent)

        controller.close()

      } catch (error: unknown) {
        const isAuthError = error instanceof Anthropic.AuthenticationError

        if (isAuthError) {
          console.warn('[Pacer] Anthropic API authentication failed — using deterministic fallback')
          controller.enqueue(encoder.encode('__FALLBACK__\n'))
        } else {
          console.error('[Pacer] Claude API call failed — using deterministic fallback', error)
        }

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
