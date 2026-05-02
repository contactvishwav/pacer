import { PrismaClient } from '@prisma/client'
import {
  computeTrainingLoad,
  type ActivityWithLoad,
} from '../src/lib/intelligence/training-load'

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
  // ── Load data ──────────────────────────────────────────────────────────────
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

  // ── Week-by-week snapshots ─────────────────────────────────────────────────
  console.log('Training load engine — weekly snapshots\n')
  console.log(
    'Wk  Phase        ATL      CTL      TSB       ACWR    Trend',
  )
  console.log('─'.repeat(65))

  let maxAcwr = 0
  let maxAcwrWeek = 0
  let peakWeekResult: ReturnType<typeof computeTrainingLoad> | null = null
  let lastTaperResult: ReturnType<typeof computeTrainingLoad> | null = null

  for (const summary of summaries) {
    // Snapshot: all activities that started on or before the last day of this week
    const weekEndDate = new Date(summary.weekStartDate)
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)
    weekEndDate.setUTCHours(23, 59, 59, 999)

    const actsUpToWeek = allActs.filter(a => a.startedAt <= weekEndDate)
    const result = computeTrainingLoad(actsUpToWeek)

    const acwrStr = result.acwr !== null ? result.acwr.toFixed(3) : '   N/A'
    const spike   = result.acwr !== null && result.acwr > 1.3 ? ' ← SPIKE' : ''

    console.log(
      `Wk${String(summary.weekNumber).padStart(2)} ` +
      `[${summary.trainingPhase.padEnd(11)}] ` +
      `${result.atl.toFixed(2).padStart(7)} ` +
      `${result.ctl.toFixed(2).padStart(7)} ` +
      `${result.tsb.toFixed(2).padStart(8)} ` +
      `${acwrStr.padStart(8)}  ` +
      `${result.trend.padEnd(12)}` +
      spike,
    )

    if (result.acwr !== null && result.acwr > maxAcwr) {
      maxAcwr = result.acwr
      maxAcwrWeek = summary.weekNumber
    }

    if (summary.weekNumber === 8) peakWeekResult = result
    if (summary.trainingPhase === 'TAPER')  lastTaperResult  = result
  }

  // ── Final-state summary ────────────────────────────────────────────────────
  const final = computeTrainingLoad(allActs)
  console.log(`\nFinal state (as of last activity):`)
  console.log(`  ${final.explanation}`)
  console.log(`  weeklyLoad: ${final.weeklyLoad}`)

  // ── Assertions ─────────────────────────────────────────────────────────────
  console.log('\nAssertions:')

  // 1. ACWR must exceed 1.3 at some point — confirms the deliberate load spike
  //    in week 8 is detectable by the engine.
  assert(
    maxAcwr > 1.3,
    'ACWR exceeds 1.3 somewhere in history',
    `peak ACWR = ${maxAcwr.toFixed(3)} at week ${maxAcwrWeek}`,
  )

  // 2. TSB must be negative during peak week (week 8) — the athlete is
  //    fatigued from the highest-load week in the block.
  const peakTsb = peakWeekResult?.tsb ?? null
  assert(
    peakTsb !== null && peakTsb < 0,
    'TSB is negative during peak week (week 8)',
    `TSB = ${peakTsb?.toFixed(2)}`,
  )

  // 3. TSB must recover during taper — the athlete freshens for race day.
  //    Final taper TSB should be higher than peak-week TSB.
  const taperTsb = lastTaperResult?.tsb ?? null
  assert(
    peakTsb !== null && taperTsb !== null && taperTsb > peakTsb,
    'TSB recovers during taper vs peak week',
    `peak TSB = ${peakTsb?.toFixed(2)}, final taper TSB = ${taperTsb?.toFixed(2)}`,
  )

  // 4. CTL must be higher at end of build/peak than at end of base.
  const baseEndResult = computeTrainingLoad(
    allActs.filter(a => {
      const wk = dbActivities.find(d => d.startedAt.getTime() === a.startedAt.getTime())?.trainingWeek
      return (wk ?? 0) <= 3
    }),
  )
  const buildEndResult = computeTrainingLoad(
    allActs.filter(a => {
      const wk = dbActivities.find(d => d.startedAt.getTime() === a.startedAt.getTime())?.trainingWeek
      return (wk ?? 0) <= 8
    }),
  )
  assert(
    buildEndResult.ctl > baseEndResult.ctl,
    'CTL higher at end of peak (week 8) than end of base (week 3)',
    `base CTL = ${baseEndResult.ctl.toFixed(2)}, peak CTL = ${buildEndResult.ctl.toFixed(2)}`,
  )

  // 5. Weekly load for the final week must be non-zero
  assert(
    final.weeklyLoad > 0,
    'Weekly load is non-zero for final week',
    `weeklyLoad = ${final.weeklyLoad}`,
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
