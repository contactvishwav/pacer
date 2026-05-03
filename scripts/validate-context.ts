// validate-context.ts
//
// Validates the central intelligence context builder against seeded DB data.
//
// Checks:
//   1. buildAthleteIntelligenceContext — all six engine outputs present and non-null
//   2. buildCoachContext (no activityId) — selectedActivity is null
//   3. buildCoachContext (with activityId) — selectedActivity is populated
//   4. estimateContextTokens < 2,500
//   5. Prints a structured summary of the full context

import { PrismaClient } from '@prisma/client'
import {
  buildAthleteIntelligenceContext,
  buildCoachContext,
  estimateContextTokens,
} from '../src/lib/intelligence/context'

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

function assertNonNull(value: unknown, label: string) {
  assert(value !== null && value !== undefined, label, String(value))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── Find seeded athlete ───────────────────────────────────────────────────
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    console.error('No athlete found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  // ── Find most recent activity for selectedActivity test ───────────────────
  const mostRecentActivity = await prisma.activity.findFirst({
    where:   { athleteId: athlete.id },
    orderBy: { startedAt: 'desc' },
  })

  if (!mostRecentActivity) {
    console.error('No activities found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: buildAthleteIntelligenceContext
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nbuildAthleteIntelligenceContext')
  console.log('─'.repeat(70))

  const ctx = await buildAthleteIntelligenceContext(athlete.id)

  // All six intelligence engine outputs must be present and non-null
  console.log('\nEngine outputs:')
  assertNonNull(ctx.trainingLoad,   'trainingLoad is non-null')
  assertNonNull(ctx.injuryRisk,     'injuryRisk is non-null')
  assertNonNull(ctx.phase,          'phase is non-null')
  assertNonNull(ctx.racePrediction, 'racePrediction is non-null')
  assertNonNull(ctx.weeklyBrief,    'weeklyBrief is non-null')
  assertNonNull(ctx.athlete,        'athlete is non-null')

  // Structural assertions
  console.log('\nStructure:')
  assert(
    Array.isArray(ctx.recentActivities) && ctx.recentActivities.length <= 10,
    'recentActivities is an array of ≤ 10',
    `${ctx.recentActivities.length} activities`,
  )
  assert(
    Array.isArray(ctx.weeklySummaries) && ctx.weeklySummaries.length <= 12,
    'weeklySummaries is an array of ≤ 12',
    `${ctx.weeklySummaries.length} summaries`,
  )
  assert(
    Array.isArray(ctx.coachMemories),
    'coachMemories is an array',
    `${ctx.coachMemories.length} memories`,
  )
  assert(
    Array.isArray(ctx.weeklyBrief.lastWeekReview) && ctx.weeklyBrief.lastWeekReview.length >= 2,
    'weeklyBrief.lastWeekReview has ≥ 2 items',
    `${ctx.weeklyBrief.lastWeekReview.length}`,
  )
  assert(
    Array.isArray(ctx.weeklyBrief.thisWeekPrescription) && ctx.weeklyBrief.thisWeekPrescription.length >= 2,
    'weeklyBrief.thisWeekPrescription has ≥ 2 items',
    `${ctx.weeklyBrief.thisWeekPrescription.length}`,
  )
  assert(
    typeof ctx.weeklyBrief.keySignal === 'string' && ctx.weeklyBrief.keySignal.length > 0,
    'weeklyBrief.keySignal is a non-empty string',
  )

  // ── Print full context summary ────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70))
  console.log('Full context summary')
  console.log('─'.repeat(70))

  console.log(`\n  Athlete:           ${ctx.athlete.name}`)
  console.log(`  Goal race:         ${ctx.goalRace?.raceName ?? '—'} (${ctx.goalRace ? (ctx.goalRace.distanceMeters / 1000).toFixed(1) + ' km' : 'none'})`)
  console.log(`  Race date:         ${ctx.goalRace?.raceDate.toISOString().slice(0, 10) ?? '—'}`)

  console.log(`\n  Phase:             ${ctx.phase.phase} (${ctx.phase.daysUntilRace} days to race, ${ctx.phase.confidence} confidence)`)
  console.log(`  Phase reason:      ${ctx.phase.primaryReason.slice(0, 80)}...`)

  console.log(`\n  Training load:`)
  console.log(`    CTL:             ${ctx.trainingLoad.ctl.toFixed(1)}`)
  console.log(`    ATL:             ${ctx.trainingLoad.atl.toFixed(1)}`)
  console.log(`    TSB:             ${ctx.trainingLoad.tsb.toFixed(1)}`)
  console.log(`    Trend:           ${ctx.trainingLoad.trend}`)

  console.log(`\n  Injury risk:       ${ctx.injuryRisk.category} (ACWR ${ctx.injuryRisk.acwr?.toFixed(2) ?? '—'})`)
  console.log(`  Injury risk exp:   ${ctx.injuryRisk.explanation.slice(0, 80)}...`)

  console.log(`\n  Race prediction:   ${ctx.racePrediction.predictedTimeFormatted} (score ${ctx.racePrediction.confidenceScore}/100)`)
  console.log(`  Gap to goal:       ${ctx.racePrediction.gapToGoalFormatted}`)

  console.log(`\n  Weekly brief:`)
  console.log(`    Key signal:      ${ctx.weeklyBrief.keySignal.slice(0, 80)}...`)
  console.log(`    Warnings:        ${ctx.weeklyBrief.warnings.length}`)
  console.log(`    Review items:    ${ctx.weeklyBrief.lastWeekReview.length}`)
  console.log(`    Prescription:    ${ctx.weeklyBrief.thisWeekPrescription.length}`)
  console.log(`    Focus:           ${ctx.weeklyBrief.suggestedFocus.slice(0, 80)}...`)

  console.log(`\n  Recent activities (${ctx.recentActivities.length}):`)
  for (const a of ctx.recentActivities.slice(0, 5)) {
    console.log(`    ${a.date}  ${a.workoutType.padEnd(14)}  ${a.distanceKm.toFixed(1).padStart(5)} km  load ${a.trainingLoad.toFixed(0).padStart(4)}`)
  }
  if (ctx.recentActivities.length > 5) {
    console.log(`    … and ${ctx.recentActivities.length - 5} more`)
  }

  console.log(`\n  Weekly summaries:  ${ctx.weeklySummaries.length}`)
  console.log(`  Coach memories:    ${ctx.coachMemories.length}`)

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: buildCoachContext — no activityId
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70))
  console.log('buildCoachContext (no activityId)')
  console.log('─'.repeat(70))

  const coachCtx = await buildCoachContext(athlete.id)

  console.log('\nAssertions:')
  assert(
    coachCtx.selectedActivity === null,
    'selectedActivity is null when no activityId',
  )
  assert(
    typeof coachCtx.athlete.name === 'string' && coachCtx.athlete.name.length > 0,
    'athlete.name is a non-empty string',
    coachCtx.athlete.name,
  )
  assert(
    typeof coachCtx.athlete.thresholdHR === 'number' && coachCtx.athlete.thresholdHR > 0,
    'athlete.thresholdHR is a positive number',
    `${coachCtx.athlete.thresholdHR} bpm`,
  )
  assert(
    typeof coachCtx.athlete.easyHRCeiling === 'number' && coachCtx.athlete.easyHRCeiling > 0,
    'athlete.easyHRCeiling is a positive number',
    `${coachCtx.athlete.easyHRCeiling} bpm`,
  )
  assert(
    Array.isArray(coachCtx.recentActivities) && coachCtx.recentActivities.length <= 10,
    'recentActivities is an array of ≤ 10',
    `${coachCtx.recentActivities.length}`,
  )
  assert(
    Array.isArray(coachCtx.conversationHistory),
    'conversationHistory is an array',
    `${coachCtx.conversationHistory.length} messages`,
  )

  // Token estimate
  const tokens = estimateContextTokens(coachCtx)
  assert(
    tokens < 2500,
    'estimateContextTokens < 2,500',
    `${tokens} estimated tokens`,
  )

  console.log(`\n  Context summary:`)
  console.log(`    Athlete:         ${coachCtx.athlete.name}  (threshold ${coachCtx.athlete.thresholdHR} bpm, easy ≤ ${coachCtx.athlete.easyHRCeiling} bpm)`)
  console.log(`    Goal race:       ${coachCtx.goalRace?.name ?? '—'} in ${coachCtx.goalRace?.daysUntilRace ?? '—'} days`)
  console.log(`    Phase:           ${coachCtx.fitness.phase} (CTL ${coachCtx.fitness.ctl.toFixed(1)}, TSB ${coachCtx.fitness.tsb.toFixed(1)})`)
  console.log(`    Injury risk:     ${coachCtx.injuryRisk.category}`)
  console.log(`    Race prediction: ${coachCtx.racePrediction?.predictedTimeFormatted ?? '—'}`)
  console.log(`    Token estimate:  ${tokens}`)

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: buildCoachContext — with activityId
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70))
  console.log(`buildCoachContext (activityId = ${mostRecentActivity.id})`)
  console.log('─'.repeat(70))

  const coachCtxWithActivity = await buildCoachContext(athlete.id, mostRecentActivity.id)

  console.log('\nAssertions:')
  assert(
    coachCtxWithActivity.selectedActivity !== null,
    'selectedActivity is populated when activityId is provided',
  )
  if (coachCtxWithActivity.selectedActivity) {
    assert(
      typeof coachCtxWithActivity.selectedActivity.date === 'string',
      'selectedActivity.date is a string',
      coachCtxWithActivity.selectedActivity.date,
    )
    assert(
      typeof coachCtxWithActivity.selectedActivity.workoutType === 'string',
      'selectedActivity.workoutType is a string',
      coachCtxWithActivity.selectedActivity.workoutType,
    )
    assert(
      coachCtxWithActivity.selectedActivity.distanceKm > 0,
      'selectedActivity.distanceKm > 0',
      `${coachCtxWithActivity.selectedActivity.distanceKm} km`,
    )
    console.log(`\n  Selected activity:`)
    console.log(`    Date:      ${coachCtxWithActivity.selectedActivity.date}`)
    console.log(`    Type:      ${coachCtxWithActivity.selectedActivity.workoutType}`)
    console.log(`    Distance:  ${coachCtxWithActivity.selectedActivity.distanceKm} km`)
    console.log(`    Duration:  ${coachCtxWithActivity.selectedActivity.durationMinutes} min`)
    console.log(`    Avg HR:    ${coachCtxWithActivity.selectedActivity.avgHR ?? '—'} bpm`)
    console.log(`    Avg pace:  ${coachCtxWithActivity.selectedActivity.avgPaceFormatted}`)
    console.log(`    Exec eval: ${coachCtxWithActivity.selectedActivity.executionEvaluation?.slice(0, 60) ?? '—'}`)
    console.log(`    Load:      ${coachCtxWithActivity.selectedActivity.trainingLoad.toFixed(1)}`)
  }

  // ── Final result ──────────────────────────────────────────────────────────
  console.log()
  if (failures > 0) {
    console.error(`${failures} assertion(s) failed.`)
    process.exit(1)
  } else {
    console.log('All assertions passed.')
  }
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
