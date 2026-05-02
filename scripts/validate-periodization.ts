// validate-periodization.ts
//
// Tests the periodization phase detector against:
//   1. Live seeded DB data — current state of the 12-week training block
//   2. Five synthetic test cases — one per phase, using artificial inputs

import { PrismaClient } from '@prisma/client'
import {
  detectTrainingPhase,
  type PeriodizationInput,
  type PeriodizationWeeklySummary,
  type ClassifiedActivitySummary,
} from '../src/lib/intelligence/periodization'
import { computeInjuryRisk } from '../src/lib/intelligence/injury-risk'
import { computeTrainingLoad } from '../src/lib/intelligence/training-load'
import type { WorkoutType } from '../src/lib/schemas/enums'

const prisma = new PrismaClient()

// ─── Demo constants ───────────────────────────────────────────────────────────

const RACE_DATE = new Date('2026-08-02T00:00:00Z')

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

function printResult(label: string, result: ReturnType<typeof detectTrainingPhase>) {
  console.log(`\n  ${label}:`)
  console.log(`    phase:       ${result.phase}`)
  console.log(`    confidence:  ${result.confidence}`)
  console.log(`    daysToRace:  ${result.daysUntilRace} (${result.weeksUntilRace} weeks)`)
  console.log(`    reason:      ${result.primaryReason}`)
  for (const sig of result.supportingSignals) {
    console.log(`    signal:      ${sig}`)
  }
  console.log(`    coaching:    ${result.coachingImplication}`)
}

// ─── Synthetic input builder ──────────────────────────────────────────────────

function buildInput(opts: {
  daysUntilRace: number
  loads:         number[]   // last 4 weeks in chronological order
  quality:       number     // quality sessions in most recent week
  tsb:           number
  ctl:           number
  injuryCategory?: string
  referenceDate?: Date
}): PeriodizationInput {
  const ref  = opts.referenceDate ?? new Date()
  const race = new Date(ref.getTime() + opts.daysUntilRace * 86_400_000)

  const summaries: PeriodizationWeeklySummary[] = opts.loads.map((load, i) => ({
    weekNumber:          i + 1,
    weekStartDate:       new Date(ref.getTime() - (opts.loads.length - i) * 7 * 86_400_000),
    totalLoad:           load,
    qualitySessionCount: i === opts.loads.length - 1 ? opts.quality : Math.max(0, opts.quality - 1),
    ctl:                 opts.ctl * ((i + 1) / opts.loads.length),  // ramp proxy
    atl:                 load / 7,
    tsb:                 opts.tsb * ((i + 1) / opts.loads.length),
    acwr:                1.0,
  }))

  return {
    goalRaceDate:        race,
    referenceDate:       ref,
    weeklySummaries:     summaries,
    currentTrainingLoad: {
      atl:        summaries[summaries.length - 1].atl,
      ctl:        opts.ctl,
      tsb:        opts.tsb,
      acwr:       null,
      weeklyLoad: opts.loads[opts.loads.length - 1],
      trend:      opts.loads[opts.loads.length - 1] > opts.loads[opts.loads.length - 2] ? 'improving' : 'declining',
      explanation: '',
    },
    currentInjuryRisk: {
      acwr:                null,
      category:            (opts.injuryCategory ?? 'optimal') as ReturnType<typeof computeInjuryRisk>['category'],
      confidence:          'high',
      explanation:         '',
      contributingFactors: [],
      recommendedAction:   '',
      weeklyLoadTrend:     opts.loads.slice(-6),
      acwrHistory:         Array(6).fill(0),
    },
    recentActivities:    [],
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── Section 1: Live seeded DB data ────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════')
  console.log('Section 1: Live seeded data (all 12 weeks)')
  console.log('═══════════════════════════════════════════════════════════')

  const dbSummaries = await prisma.weeklyTrainingSummary.findMany({
    orderBy: { weekNumber: 'asc' },
  })
  const dbActivities = await prisma.activity.findMany({
    select: { startedAt: true, trainingLoad: true, workoutType: true },
    orderBy: { startedAt: 'asc' },
  })

  if (dbSummaries.length === 0) {
    console.error('No weekly summaries found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  const summaries: PeriodizationWeeklySummary[] = dbSummaries.map(s => ({
    weekNumber:          s.weekNumber,
    weekStartDate:       s.weekStartDate,
    totalLoad:           s.totalLoad,
    qualitySessionCount: s.qualitySessionCount,
    ctl:                 s.ctl,
    atl:                 s.atl,
    tsb:                 s.tsb,
    acwr:                s.acwr,
    trainingPhase:       s.trainingPhase,
  }))

  const activities = dbActivities.map(a => ({
    startedAt:    a.startedAt,
    workoutType:  a.workoutType as WorkoutType,
    trainingLoad: a.trainingLoad,
  })) satisfies ClassifiedActivitySummary[]

  // Compute current training load from all activities
  const loadResult  = computeTrainingLoad(activities.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })))

  // Compute injury risk from all activities and all summaries
  const injuryResult = computeInjuryRisk(
    activities.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })),
    summaries,
  )

  // Use the seed's reference date (2026-05-02) as the reference date.
  // Race date is 2026-08-02 → 92 days away.
  const REF_DATE = new Date('2026-05-02T00:00:00Z')
  const daysToRace = Math.round((RACE_DATE.getTime() - REF_DATE.getTime()) / 86_400_000)

  const liveInput: PeriodizationInput = {
    goalRaceDate:        RACE_DATE,
    referenceDate:       REF_DATE,
    weeklySummaries:     summaries,
    currentTrainingLoad: loadResult,
    currentInjuryRisk:   injuryResult,
    recentActivities:    activities.slice(-20),
  }

  const liveResult = detectTrainingPhase(liveInput)
  printResult(`Live DB (ref=${REF_DATE.toISOString().slice(0,10)}, race in ${daysToRace} days)`, liveResult)

  // ── Print all 12 weeks in chronological order ──────────────────────────────
  console.log('\n  Per-week phase detection:')
  console.log('  Wk  Stored-phase   Detected-phase  Load     TSB     Days-to-race')
  console.log('  ' + '─'.repeat(70))

  for (const summary of dbSummaries) {
    const weekRef = new Date(summary.weekStartDate)
    weekRef.setUTCDate(weekRef.getUTCDate() + 6)  // end of week
    weekRef.setUTCHours(23, 59, 59, 999)

    const actsUpToWeek = activities.filter(a => a.startedAt <= weekRef)
    const sumUpToWeek  = summaries.filter(s => s.weekNumber <= summary.weekNumber)

    const wLoad  = computeTrainingLoad(actsUpToWeek.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })))
    const wRisk  = computeInjuryRisk(
      actsUpToWeek.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })),
      sumUpToWeek,
    )

    const weekEndDate = new Date(summary.weekStartDate)
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)
    const daysLeft = Math.max(0, Math.round((RACE_DATE.getTime() - weekEndDate.getTime()) / 86_400_000))

    const detected = detectTrainingPhase({
      goalRaceDate:        RACE_DATE,
      referenceDate:       weekEndDate,
      weeklySummaries:     sumUpToWeek,
      currentTrainingLoad: wLoad,
      currentInjuryRisk:   wRisk,
      recentActivities:    actsUpToWeek.slice(-20),
    })

    const marker = detected.phase === summary.trainingPhase ? ' ' : '!'
    console.log(
      `  Wk${String(summary.weekNumber).padStart(2)} ` +
      `${summary.trainingPhase.padEnd(14)} ` +
      `${detected.phase.padEnd(14)}  ` +
      `${String(Math.round(summary.totalLoad)).padStart(6)} ` +
      `${String(summary.tsb.toFixed(1)).padStart(7)} ` +
      `${String(daysLeft).padStart(7)} days ` +
      marker,
    )
  }

  // Live assertion: Week 12 is a taper/recovery week with reduced load (230 TRIMP
  // vs 3-week avg ~431 TRIMP). Rule 1 fires (load < 60% threshold) → RECOVERY.
  //
  // NOTE: The user may expect BUILD or PEAK because the race is 92 days away.
  // However, the rules as specified classify immediate load state first:
  //   - Rule 1 (RECOVERY): fires when load < 60% of prior 3-week avg
  //   - Rule 5 (BASE): would fire at daysUntilRace=92 if rule 1 didn't
  // Week 12 is a planned taper within the 12-week training block. The engine
  // correctly identifies the reduced-load week as RECOVERY. A new build phase
  // should follow as the athlete targets the August 2 race.
  console.log('\nAssertions (live data):')
  assert(
    liveResult.phase === 'RECOVERY' || liveResult.phase === 'BASE',
    'Live data: phase is RECOVERY or BASE (week 12 taper/recovery in 12-week block, race 92 days away)',
    `phase = ${liveResult.phase}`,
  )
  assert(
    liveResult.daysUntilRace === daysToRace,
    'daysUntilRace computed correctly',
    `${liveResult.daysUntilRace} days`,
  )
  assert(
    liveResult.primaryReason.length > 20,
    'primaryReason is non-trivial',
    `${liveResult.primaryReason.slice(0, 60)}...`,
  )

  // ── Section 2: Synthetic test cases ───────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('Section 2: Synthetic test cases (5 phases)')
  console.log('═══════════════════════════════════════════════════════════')

  // ── Test 1: RECOVERY ─────────────────────────────────────────────────────
  // Deliberate scenario: large load spike followed by crash.
  // Loads [300, 350, 850, 210] — week 4 (210) is < 60% of prior 3-week avg (467)
  const recoveryInput = buildInput({
    daysUntilRace: 60,
    loads:         [300, 350, 850, 210],
    quality:       0,
    tsb:           -5,
    ctl:           45,
  })
  const recoveryResult = detectTrainingPhase(recoveryInput)
  printResult('Test RECOVERY (post-spike load crash, 60 days to race)', recoveryResult)
  assert(
    recoveryResult.phase === 'RECOVERY',
    'Test RECOVERY: load < 60% of prior 3-week avg fires rule 1',
    `phase = ${recoveryResult.phase}`,
  )

  // ── Test 2: TAPER ────────────────────────────────────────────────────────
  // 14 days to race, load intentionally reducing, only 1 quality session.
  // Loads [600, 700, 600, 480] — current (480) < prev (600), daysUntilRace=14
  // Rule 1 check: prior3 avg = (600+700+600)/3 = 633. 480/633 = 75.8% > 60% → no RECOVERY
  const taperInput = buildInput({
    daysUntilRace: 14,
    loads:         [600, 700, 600, 480],
    quality:       1,
    tsb:           5,
    ctl:           55,
  })
  const taperResult = detectTrainingPhase(taperInput)
  printResult('Test TAPER (14 days to race, load reducing, 1 quality session)', taperResult)
  assert(
    taperResult.phase === 'TAPER',
    'Test TAPER: daysUntilRace ≤ 21, decreasing load, quality ≤ 2',
    `phase = ${taperResult.phase}`,
  )

  // ── Test 3: PEAK ─────────────────────────────────────────────────────────
  // 30 days to race, load near maximum, 3 quality sessions.
  // Loads [550, 650, 720, 700] — current (700) ≥ 85% of max (720=595) ✓
  // Rule 1 check: prior3 avg = (550+650+720)/3 = 640. 700/640 = 109% > 60% → no RECOVERY
  const peakInput = buildInput({
    daysUntilRace: 30,
    loads:         [550, 650, 720, 700],
    quality:       3,
    tsb:           -20,
    ctl:           63,
  })
  const peakResult = detectTrainingPhase(peakInput)
  printResult('Test PEAK (30 days to race, load near max, 3 quality sessions)', peakResult)
  assert(
    peakResult.phase === 'PEAK',
    'Test PEAK: daysUntilRace 22–42, load ≥ 85% of recent max, quality ≥ 3',
    `phase = ${peakResult.phase}`,
  )

  // ── Test 4: BUILD ────────────────────────────────────────────────────────
  // 55 days to race, load trending upward, 2 quality sessions.
  // Loads [400, 500, 580, 660] — trending up ✓
  // Rule 1 check: prior3 avg = (400+500+580)/3 = 493. 660/493 = 134% > 60% → no RECOVERY
  const buildInput2 = buildInput({
    daysUntilRace: 55,
    loads:         [400, 500, 580, 660],
    quality:       2,
    tsb:           -25,
    ctl:           40,
  })
  const buildResult = detectTrainingPhase(buildInput2)
  printResult('Test BUILD (55 days to race, load trending up, 2 quality sessions)', buildResult)
  assert(
    buildResult.phase === 'BUILD',
    'Test BUILD: daysUntilRace 43–70, load trending up, quality ≥ 2',
    `phase = ${buildResult.phase}`,
  )

  // ── Test 5: BASE ─────────────────────────────────────────────────────────
  // 100 days to race, consistent moderate load, 0 quality sessions.
  // Loads [220, 200, 230, 210] — consistent, no big drop
  // Rule 1 check: prior3 avg = (220+200+230)/3 = 217. 210/217 = 97% > 60% → no RECOVERY
  const baseInput = buildInput({
    daysUntilRace: 100,
    loads:         [220, 200, 230, 210],
    quality:       0,
    tsb:           10,
    ctl:           18,
  })
  const baseResult = detectTrainingPhase(baseInput)
  printResult('Test BASE (100 days to race, consistent easy load)', baseResult)
  assert(
    baseResult.phase === 'BASE',
    'Test BASE: daysUntilRace > 70, consistent load, rule 5 fires',
    `phase = ${baseResult.phase}`,
  )

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\nAll test results:')
  const allResults = [
    { label: 'RECOVERY', expected: 'RECOVERY', got: recoveryResult.phase },
    { label: 'TAPER',    expected: 'TAPER',    got: taperResult.phase },
    { label: 'PEAK',     expected: 'PEAK',     got: peakResult.phase },
    { label: 'BUILD',    expected: 'BUILD',    got: buildResult.phase },
    { label: 'BASE',     expected: 'BASE',     got: baseResult.phase },
  ]
  for (const r of allResults) {
    const ok = r.expected === r.got
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.label.padEnd(10)} expected=${r.expected}, got=${r.got}`)
  }

  // ── Exit ───────────────────────────────────────────────────────────────────
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
