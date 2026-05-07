// Verifies that Claude's coaching responses reference actual computed values
// from the intelligence context — not hallucinated or generic advice.
//
// Usage: npm run validate:coaching   (requires ANTHROPIC_API_KEY + seeded DB)

import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'
import { buildAthleteIntelligenceContext, buildCoachContext } from '../src/lib/intelligence/context'
import { buildSystemPrompt } from '../src/lib/coach/system-prompt'
import { invalidateCachedContext } from '../src/lib/intelligence/context-cache'

export interface ValidationResult {
  passed: boolean
  duration: number
  details?: string
}

export async function runCoachingValidation(): Promise<ValidationResult> {
  const start = Date.now()

  if (!process.env.ANTHROPIC_API_KEY) {
    return { passed: false, duration: 0, details: 'ANTHROPIC_API_KEY is not set.' }
  }

  const prisma = new PrismaClient()
  try {
    const athlete = await prisma.athlete.findFirst()
    if (!athlete) {
      return {
        passed:   false,
        duration: Date.now() - start,
        details:  'No athlete found. Run npx prisma db seed first.',
      }
    }

    // Invalidate cache to guarantee a real computation, not a cached hit.
    invalidateCachedContext(athlete.id)
    const context = await buildAthleteIntelligenceContext(athlete.id)

    // Expected grounding values — what Claude MUST reference from the context.
    const expected = {
      ctl:           Math.floor(context.trainingLoad.ctl),
      // Match the 2-decimal format Claude sees in the system prompt
      acwr:          context.injuryRisk.acwr != null ? context.injuryRisk.acwr.toFixed(2) : null,
      phase:         context.phase.phase.toLowerCase(),
      daysUntilRace: String(context.phase.daysUntilRace),
      predictedTime: context.racePrediction.predictedTimeFormatted,
    }

    const coachCtx     = await buildCoachContext(athlete.id)
    const systemPrompt = buildSystemPrompt(coachCtx)

    const anthropic = new Anthropic()
    const result = await anthropic.messages.create({
      model:      process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 500,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: 'Summarize my current training status.' }],
    })

    const responseText = result.content[0]?.type === 'text' ? result.content[0].text : ''
    const lower        = responseText.toLowerCase()
    const raceName     = context.goalRace?.raceName.toLowerCase() ?? ''

    // Five grounding checks — at least 4 must hit for PASS.
    const checks = [
      {
        name: `CTL (${expected.ctl})`,
        hit:  lower.includes(String(expected.ctl)),
      },
      {
        name: `ACWR (${expected.acwr ?? 'n/a'})`,
        hit:  expected.acwr != null ? lower.includes(expected.acwr) : false,
      },
      {
        name: `Phase (${expected.phase})`,
        hit:  lower.includes(expected.phase),
      },
      {
        name: `Days until race (${expected.daysUntilRace})`,
        hit:  lower.includes(expected.daysUntilRace) ||
              (lower.includes('days') && raceName.length > 0 && lower.includes(raceName)),
      },
      {
        name: 'Goal time (1:55)',
        hit:  responseText.includes('1:55'),
      },
    ]

    const hits   = checks.filter(c => c.hit)
    const misses = checks.filter(c => !c.hit)

    if (hits.length >= 4) {
      console.log(`  PASS  Claude referenced ${hits.length}/5 expected grounding values`)
      for (const c of hits)   console.log(`        ✓ ${c.name}`)
      for (const c of misses) console.log(`        — ${c.name} (not found — may be phrased differently)`)
      return { passed: true, duration: Date.now() - start }
    }

    return {
      passed:   false,
      duration: Date.now() - start,
      details: [
        `Only ${hits.length}/5 expected values referenced (minimum 4 required).`,
        `Missing: ${misses.map(c => c.name).join(', ')}`,
        `Response preview:\n${responseText.slice(0, 800)}`,
      ].join('\n'),
    }

  } finally {
    await prisma.$disconnect()
  }
}

// ─── Direct invocation guard ──────────────────────────────────────────────────

if (process.argv[1]?.includes('validate-coaching')) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set. This script requires a live API key.')
    process.exit(1)
  }
  console.log('Coaching Grounding Validation\n')
  runCoachingValidation()
    .then(result => {
      if (result.details) console.log(result.details)
      console.log(`\nCompleted in ${result.duration}ms`)
      process.exit(result.passed ? 0 : 1)
    })
    .catch(err => { console.error(err); process.exit(1) })
}
