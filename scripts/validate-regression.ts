// Combined regression runner — executes all three regression tests in sequence
// and prints a summary table. Exits 1 if any test fails.
//
// Usage: npm run validate:regression   (requires ANTHROPIC_API_KEY + seeded DB)

import { runContextDriftValidation }      from './validate-context-drift'
import { runCoachingValidation }           from './validate-coaching'
import { runPromptConstraintsValidation }  from './validate-prompt-constraints'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. validate:regression requires a live API key.')
  process.exit(1)
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function pad(s: string, n: number): string {
  return s.padEnd(n)
}

async function main() {
  console.log('Pacer Regression Test Suite\n')

  const suite = [
    { name: 'Context drift',           fn: runContextDriftValidation },
    { name: 'Coaching grounding',      fn: runCoachingValidation },
    { name: 'Prompt constraint guard', fn: runPromptConstraintsValidation },
  ]

  const results: Array<{ name: string; passed: boolean; duration: number; details?: string }> = []

  for (const test of suite) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`Running: ${test.name}`)
    console.log('─'.repeat(60))
    const result = await test.fn()
    results.push({ name: test.name, ...result })
    if (!result.passed && result.details) {
      console.log('\n' + result.details)
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`)
  console.log('Summary')
  console.log('─'.repeat(60))
  console.log(
    pad('Test', 26) + '| ' +
    pad('Result', 8) + '| ' +
    'Duration'
  )
  console.log(
    pad('', 26).replace(/ /g, '-') + '|' +
    pad('', 9).replace(/ /g, '-') + '|' +
    '----------'
  )

  let anyFailed = false
  for (const r of results) {
    const resultStr = r.passed ? 'PASS' : 'FAIL'
    const durationStr = `${r.duration}ms`
    console.log(
      pad(r.name, 26) + '| ' +
      pad(resultStr, 8) + '| ' +
      durationStr
    )
    if (!r.passed) anyFailed = true
  }

  console.log()
  if (anyFailed) {
    console.error('One or more regression tests failed.')
    process.exit(1)
  } else {
    console.log('All regression tests passed.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
