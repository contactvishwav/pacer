import { PrismaClient } from '@prisma/client'
import {
  computeInjuryRisk,
  type WeeklyTrainingSummaryData,
} from '../src/lib/intelligence/injury-risk'
import type { ActivityWithLoad } from '../src/lib/intelligence/training-load'

const prisma = new PrismaClient()

// ─── Assertion helpers ────────────────────────────────────────────────────────

let failures = 0

function pass(label: string, detail?: string) {
  console.log(`  PASS  ${label}${detail ? ` (${detail})` : ''}`)
}

function fail(label: string, detail?: string) {
  failures++
  console.error(`  FAIL  ${label}${detail ? ` (${detail})` : ''}`)
}

function assert(condition: boolean, label: string, detail?: string) {
  condition ? pass(label, detail) : fail(label, detail)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dbActivities = await prisma.activity.findMany({
    select: { startedAt: true, trainingLoad: true, trainingWeek: true },
    orderBy: { startedAt: 'asc' },
  })

  if (dbActivities.length === 0) {
    console.error('No activities found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  const summaries = await prisma.weeklyTrainingSummary.findMany({
    orderBy: { weekNumber: 'asc' },
  })

  const allActs: ActivityWithLoad[] = dbActivities.map(a => ({
    startedAt: a.startedAt,
    trainingLoad: a.trainingLoad,
  }))

  const allSummaries: WeeklyTrainingSummaryData[] = summaries.map(s => ({
    weekStartDate:          s.weekStartDate,
    weekNumber:             s.weekNumber,
    totalLoad:              s.totalLoad,
    activityCount:          s.activityCount,
    qualitySessionCount:    s.qualitySessionCount ?? 0,
    longRunDistanceMeters:  s.longRunDistanceMeters,
  }))

  // ── Week-by-week snapshots ─────────────────────────────────────────────────
  console.log('Injury-risk engine — weekly snapshots\n')
  console.log('Wk  Category           ACWR    Conf    Factors')
  console.log('─'.repeat(70))

  let week8Result = null
  let earlyInsufficient = true   // weeks 1-4 must all be insufficient-data
  let taperOptimalOrUnderload = false

  for (const summary of summaries) {
    const weekEndDate = new Date(summary.weekStartDate)
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)
    weekEndDate.setUTCHours(23, 59, 59, 999)

    const actsUpToWeek = allActs.filter(a => a.startedAt <= weekEndDate)
    const summariesUpToWeek = allSummaries.filter(
      s => s.weekNumber <= summary.weekNumber,
    )

    const result = computeInjuryRisk(actsUpToWeek, summariesUpToWeek)

    const acwrStr = result.acwr !== null ? result.acwr.toFixed(3) : '  N/A '
    const factors = result.contributingFactors.length

    console.log(
      `Wk${String(summary.weekNumber).padStart(2)} ` +
      `[${result.category.padEnd(17)}] ` +
      `${acwrStr.padStart(7)}  ` +
      `${result.confidence.padEnd(6)}  ` +
      `${factors} factor(s)`,
    )

    if (summary.weekNumber === 8) week8Result = result

    if (summary.weekNumber <= 4 && result.category !== 'insufficient-data') {
      earlyInsufficient = false
    }

    if (summary.trainingPhase === 'TAPER') {
      if (result.category === 'optimal' || result.category === 'underload') {
        taperOptimalOrUnderload = true
      }
    }
  }

  // ── Final-state result (full print) ───────────────────────────────────────
  const finalResult = computeInjuryRisk(allActs, allSummaries)
  console.log('\nFinal-state result:')
  console.log(`  category:    ${finalResult.category}`)
  console.log(`  acwr:        ${finalResult.acwr?.toFixed(3) ?? 'null'}`)
  console.log(`  confidence:  ${finalResult.confidence}`)
  console.log(`  explanation: ${finalResult.explanation}`)
  console.log(`  action:      ${finalResult.recommendedAction}`)
  console.log(`  factors:`)
  for (const f of finalResult.contributingFactors) {
    console.log(`    - ${f}`)
  }
  console.log(`  weeklyLoadTrend: [${finalResult.weeklyLoadTrend.join(', ')}]`)
  console.log(`  acwrHistory:     [${finalResult.acwrHistory.join(', ')}]`)

  // ── Assertions ─────────────────────────────────────────────────────────────
  console.log('\nAssertions:')

  // 1. Week 8 spike → caution or high-risk
  const week8Cat = week8Result?.category ?? 'none'
  assert(
    week8Cat === 'caution' || week8Cat === 'high-risk',
    'Week 8 produces caution or high-risk category',
    `category = ${week8Cat}, ACWR = ${week8Result?.acwr?.toFixed(3) ?? 'null'}`,
  )

  // 2. Weeks 1–4 → insufficient-data (shallow chronic baseline)
  assert(
    earlyInsufficient,
    'Weeks 1–4 return insufficient-data (fewer than 4 prior complete weeks)',
  )

  // 3. Taper period → optimal or underload (load drops post-peak)
  assert(
    taperOptimalOrUnderload,
    'At least one taper week returns optimal or underload',
  )

  // 4. ACWR history array must have 6 entries for every result
  assert(
    finalResult.acwrHistory.length === 6,
    'acwrHistory has 6 entries',
    `length = ${finalResult.acwrHistory.length}`,
  )

  // 5. weeklyLoadTrend must have 6 entries for every result
  assert(
    finalResult.weeklyLoadTrend.length === 6,
    'weeklyLoadTrend has 6 entries',
    `length = ${finalResult.weeklyLoadTrend.length}`,
  )

  // ── Exit code ──────────────────────────────────────────────────────────────
  console.log()
  if (failures > 0) {
    console.error(`${failures} assertion(s) failed.`)
    process.exit(1)
  } else {
    console.log('All assertions passed.')
  }
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
