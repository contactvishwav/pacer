// validate-weekly-brief.ts
//
// Runs the full intelligence pipeline against seeded DB data and validates
// the weekly coaching brief output.
//
// Pipeline: computeTrainingLoad → computeInjuryRisk → detectTrainingPhase
//           → predictRaceTime → generateWeeklyBrief
// Reference date: 2026-05-02 (fixed seed timeline)

import { PrismaClient } from '@prisma/client'
import { computeTrainingLoad } from '../src/lib/intelligence/training-load'
import { computeInjuryRisk } from '../src/lib/intelligence/injury-risk'
import {
  detectTrainingPhase,
  type PeriodizationWeeklySummary,
} from '../src/lib/intelligence/periodization'
import {
  predictRaceTime,
  type ActivityWithClassification,
  type WeeklySummaryForPrediction,
  type GoalRace,
} from '../src/lib/intelligence/race-prediction'
import {
  generateWeeklyBrief,
  type WeeklyBriefInput,
} from '../src/lib/intelligence/weekly-brief'
import { WeeklyBriefResultSchema } from '../src/lib/schemas/intelligence'

const prisma = new PrismaClient()

const REFERENCE_DATE  = new Date('2026-05-02T00:00:00Z')
const EIGHT_WEEKS_AGO = new Date(REFERENCE_DATE.getTime() - 8 * 7 * 86_400_000)
const TWO_WEEKS_AGO   = new Date(REFERENCE_DATE.getTime() - 2 * 7 * 86_400_000)

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
  // ── Load athlete and goal race ────────────────────────────────────────────
  const athlete = await prisma.athlete.findFirst({
    include: { goalRaces: { where: { isActive: true }, take: 1 } },
  })

  if (!athlete || athlete.goalRaces.length === 0) {
    console.error('No athlete or active goal race found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  const dbGoalRace = athlete.goalRaces[0]
  const goalRace: GoalRace = {
    raceName:        dbGoalRace.raceName,
    raceDate:        dbGoalRace.raceDate,
    distanceMeters:  dbGoalRace.distanceMeters,
    goalTimeSeconds: dbGoalRace.goalTimeSeconds,
  }

  // ── Load all DB data ──────────────────────────────────────────────────────
  const allActivities = await prisma.activity.findMany({
    where:   { athleteId: athlete.id },
    orderBy: { startedAt: 'asc' },
  })
  const allSummaries = await prisma.weeklyTrainingSummary.findMany({
    where:   { athleteId: athlete.id },
    orderBy: { weekNumber: 'asc' },
  })

  if (allActivities.length === 0) {
    console.error('No activities found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  // ── Compute training load ─────────────────────────────────────────────────
  const currentTrainingLoad = computeTrainingLoad(
    allActivities.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })),
  )

  // ── Compute injury risk ───────────────────────────────────────────────────
  const currentInjuryRisk = computeInjuryRisk(
    allActivities.map(a => ({ startedAt: a.startedAt, trainingLoad: a.trainingLoad })),
    allSummaries,
  )

  // ── Detect training phase ─────────────────────────────────────────────────
  const periodizationSummaries: PeriodizationWeeklySummary[] = allSummaries.map(s => ({
    weekNumber:          s.weekNumber,
    weekStartDate:       s.weekStartDate,
    totalLoad:           s.totalLoad,
    qualitySessionCount: s.qualitySessionCount,
    ctl:                 s.ctl,
    atl:                 s.atl,
    tsb:                 s.tsb,
    acwr:                s.acwr,
  }))

  const currentPhase = detectTrainingPhase({
    goalRaceDate:     dbGoalRace.raceDate,
    weeklySummaries:  periodizationSummaries,
    currentInjuryRisk,
    currentTrainingLoad,
    recentActivities: allActivities
      .filter(a => a.startedAt >= EIGHT_WEEKS_AGO)
      .map(a => ({ startedAt: a.startedAt, workoutType: a.workoutType, trainingLoad: a.trainingLoad })),
    referenceDate:    REFERENCE_DATE,
  })

  // ── Predict race time ─────────────────────────────────────────────────────
  const recentForPrediction: ActivityWithClassification[] = allActivities
    .filter(a => a.startedAt >= EIGHT_WEEKS_AGO && a.startedAt <= REFERENCE_DATE)
    .map(a => ({
      startedAt:           a.startedAt,
      distanceMeters:      a.distanceMeters,
      movingTimeSeconds:   a.movingTimeSeconds,
      avgPaceSecPerKm:     a.avgPaceSecPerKm,
      workoutType:         a.workoutType,
      executionEvaluation: a.executionEvaluation,
    }))

  const summariesForPrediction: WeeklySummaryForPrediction[] = allSummaries
    .filter(s => s.weekStartDate >= EIGHT_WEEKS_AGO && s.weekStartDate <= REFERENCE_DATE)
    .map(s => ({ weekNumber: s.weekNumber, weekStartDate: s.weekStartDate, totalLoad: s.totalLoad }))

  const racePrediction = predictRaceTime({
    goalRace,
    recentActivities:  recentForPrediction,
    weeklySummaries:   summariesForPrediction,
    currentTrainingLoad,
    currentPhase,
  })

  // ── Last 2 weeks of classified activities ─────────────────────────────────
  const recentClassifiedActivities: ActivityWithClassification[] = allActivities
    .filter(a => a.startedAt >= TWO_WEEKS_AGO && a.startedAt <= REFERENCE_DATE)
    .map(a => ({
      startedAt:           a.startedAt,
      distanceMeters:      a.distanceMeters,
      movingTimeSeconds:   a.movingTimeSeconds,
      avgPaceSecPerKm:     a.avgPaceSecPerKm,
      workoutType:         a.workoutType,
      executionEvaluation: a.executionEvaluation,
    }))

  // ── Generate weekly brief ─────────────────────────────────────────────────
  const briefInput: WeeklyBriefInput = {
    recentWeeklySummaries:      allSummaries.slice(-4),
    currentInjuryRisk,
    currentPhase,
    currentTrainingLoad,
    racePrediction,
    goalRace,
    recentClassifiedActivities,
  }

  const brief = generateWeeklyBrief(briefInput)

  // ── Print full brief ──────────────────────────────────────────────────────
  console.log('\nWeekly coaching brief — full output')
  console.log('─'.repeat(70))

  console.log('\n  Key Signal:')
  console.log(`    ${brief.keySignal}`)

  if (brief.warnings.length > 0) {
    console.log('\n  Warnings:')
    for (const w of brief.warnings) console.log(`    ⚠  ${w}`)
  } else {
    console.log('\n  Warnings: none')
  }

  console.log('\n  Last Week Review:')
  for (const b of brief.lastWeekReview) console.log(`    • ${b}`)

  console.log('\n  This Week Prescription:')
  for (const b of brief.thisWeekPrescription) console.log(`    → ${b}`)

  console.log('\n  Suggested Focus:')
  console.log(`    ${brief.suggestedFocus}`)

  // Context used
  console.log('\n' + '─'.repeat(70))
  console.log(`\n  Phase:         ${currentPhase.phase} (${currentPhase.daysUntilRace} days to race)`)
  console.log(`  Injury risk:   ${currentInjuryRisk.category} (ACWR ${currentInjuryRisk.acwr?.toFixed(2) ?? '—'})`)
  console.log(`  TSB:           ${currentTrainingLoad.tsb.toFixed(1)}`)
  console.log(`  Trend:         ${currentTrainingLoad.trend}`)
  console.log(`  Gap to goal:   ${racePrediction.gapToGoalFormatted}`)
  console.log(`  Activities (last 2 wks): ${recentClassifiedActivities.length}`)
  const tooHard = recentClassifiedActivities.filter(a => a.executionEvaluation === 'TOO_HARD').length
  const wellEx  = recentClassifiedActivities.filter(a => a.executionEvaluation === 'WELL_EXECUTED').length
  console.log(`    TOO_HARD: ${tooHard}  WELL_EXECUTED: ${wellEx}`)

  // ── Schema validation ─────────────────────────────────────────────────────
  const parseResult = WeeklyBriefResultSchema.safeParse(brief)

  // ── Assertions ────────────────────────────────────────────────────────────
  console.log('\nAssertions:')

  assert(
    parseResult.success,
    'Output validates against WeeklyBriefResultSchema',
    parseResult.success ? 'ok' : parseResult.error.errors[0]?.message,
  )

  assert(
    brief.lastWeekReview.length >= 2 && brief.lastWeekReview.length <= 4,
    'lastWeekReview has 2–4 items',
    `${brief.lastWeekReview.length}`,
  )

  assert(
    brief.thisWeekPrescription.length >= 2 && brief.thisWeekPrescription.length <= 4,
    'thisWeekPrescription has 2–4 items',
    `${brief.thisWeekPrescription.length}`,
  )

  assert(
    typeof brief.keySignal === 'string' && brief.keySignal.length > 0,
    'keySignal is a non-empty string',
  )

  assert(
    Array.isArray(brief.warnings),
    'warnings is an array',
    `length = ${brief.warnings.length}`,
  )

  assert(
    typeof brief.suggestedFocus === 'string' && brief.suggestedFocus.length > 0,
    'suggestedFocus is a non-empty string',
  )

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
