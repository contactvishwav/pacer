// Verifies that the intelligence pipeline is deterministic and that key computed
// values fall within expected ranges for the seeded athlete.
//
// Runs two full builds of AthleteIntelligenceContext and compares results.
// No Claude API calls required.
//
// Usage: npm run validate:context-drift   (requires seeded DB only)

import { PrismaClient } from '@prisma/client'
import { buildAthleteIntelligenceContext } from '../src/lib/intelligence/context'
import { invalidateCachedContext } from '../src/lib/intelligence/context-cache'
import type { ValidationResult } from './validate-coaching'

let failures = 0

function pass(label: string, detail?: string) {
  console.log(`  PASS  ${label}${detail ? ` (${detail})` : ''}`)
}

function fail(label: string, detail?: string) {
  failures++
  console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
}

function assertRange(
  label:  string,
  actual: number,
  lo:     number,
  hi:     number,
) {
  if (actual >= lo && actual <= hi) {
    pass(label, `${actual} ∈ [${lo}, ${hi}]`)
  } else {
    fail(label, `expected [${lo}, ${hi}], got ${actual}`)
  }
}

function assertOneOf(label: string, actual: string, allowed: string[]) {
  if (allowed.includes(actual)) {
    pass(label, actual)
  } else {
    fail(label, `expected one of [${allowed.join(', ')}], got "${actual}"`)
  }
}

export async function runContextDriftValidation(): Promise<ValidationResult> {
  failures = 0
  const start = Date.now()

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

    // ── Determinism check ──────────────────────────────────────────────────────
    // Run twice with cache invalidation between — same DB data must yield equal
    // JSON. Note: minor float rounding across two Date.now() calls is expected
    // to produce identical results since no activity falls at the exact boundary.

    invalidateCachedContext(athlete.id)
    const result1 = await buildAthleteIntelligenceContext(athlete.id)

    invalidateCachedContext(athlete.id)
    const result2 = await buildAthleteIntelligenceContext(athlete.id)

    const json1 = JSON.stringify(result1)
    const json2 = JSON.stringify(result2)

    console.log('\n── Determinism ──')
    if (json1 === json2) {
      pass('Two consecutive builds produce identical JSON')
    } else {
      // Identify the first diverging key for a useful error message
      const r1 = JSON.parse(json1) as Record<string, unknown>
      const r2 = JSON.parse(json2) as Record<string, unknown>
      const diverging = Object.keys(r1).filter(k => JSON.stringify(r1[k]) !== JSON.stringify(r2[k]))
      fail('Two consecutive builds produce identical JSON', `diverging keys: ${diverging.join(', ')}`)
    }

    // ── Value range assertions ─────────────────────────────────────────────────
    // Ranges are calibrated to the seeded 12-week half-marathon training block
    // for Alex Chen. If any value falls outside the range, the intelligence
    // pipeline has silently changed — investigate before shipping.

    const ctx = result1

    console.log('\n── Training load ──')
    assertRange('trainingLoad.ctl',       ctx.trainingLoad.ctl,       55,   70)
    assertRange('trainingLoad.tsb',       ctx.trainingLoad.tsb,        0,   20)

    console.log('\n── Injury risk ──')
    const acwr = ctx.injuryRisk.acwr ?? 0
    assertRange('injuryRisk.acwr',        acwr,                       0.2,  0.7)
    assertOneOf('injuryRisk.category',    ctx.injuryRisk.category,   ['underload', 'optimal', 'low'])

    console.log('\n── Training phase ──')
    assertOneOf('phase.phase',            ctx.phase.phase,            ['RECOVERY', 'TAPER', 'BUILD', 'BASE'])

    console.log('\n── Race prediction ──')
    assertRange(
      'racePrediction.predictedTimeSeconds',
      ctx.racePrediction.predictedTimeSeconds,
      6600,  // 1:50:00
      7200,  // 2:00:00
    )
    assertRange('racePrediction.confidenceScore', ctx.racePrediction.confidenceScore, 60, 95)

    console.log('\n── Weekly brief completeness ──')
    if (ctx.weeklyBrief.lastWeekReview.length > 0) {
      pass('weeklyBrief.lastWeekReview populated')
    } else {
      fail('weeklyBrief.lastWeekReview populated', 'array is empty')
    }
    if (ctx.weeklyBrief.thisWeekPrescription.length > 0) {
      pass('weeklyBrief.thisWeekPrescription populated')
    } else {
      fail('weeklyBrief.thisWeekPrescription populated', 'array is empty')
    }
    if (ctx.weeklyBrief.keySignal.length > 0) {
      pass('weeklyBrief.keySignal populated')
    } else {
      fail('weeklyBrief.keySignal populated', 'empty string')
    }
    if (ctx.weeklyBrief.suggestedFocus.length > 0) {
      pass('weeklyBrief.suggestedFocus populated')
    } else {
      fail('weeklyBrief.suggestedFocus populated', 'empty string')
    }
    // warnings can legitimately be empty — no assertion
    pass('weeklyBrief.warnings present (can be empty)', `${ctx.weeklyBrief.warnings.length} warnings`)

    const passed  = failures === 0
    return { passed, duration: Date.now() - start }

  } finally {
    await prisma.$disconnect()
  }
}

// ─── Direct invocation guard ──────────────────────────────────────────────────

if (process.argv[1]?.includes('validate-context-drift')) {
  console.log('Context Drift Detection\n')
  runContextDriftValidation()
    .then(result => {
      console.log()
      if (!result.passed) {
        if (result.details) console.error(result.details)
        console.error(`${failures} assertion(s) failed.`)
        process.exit(1)
      }
      console.log('All assertions passed.')
      console.log(`Completed in ${result.duration}ms`)
    })
    .catch(err => { console.error(err); process.exit(1) })
}
