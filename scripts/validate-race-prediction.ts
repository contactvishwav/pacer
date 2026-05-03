// validate-race-prediction.ts
//
// Runs the full intelligence pipeline against seeded DB data and validates
// the race prediction output.
//
// Pipeline: computeTrainingLoad → detectTrainingPhase → predictRaceTime
// Reference date: 2026-05-02 (fixed seed reference — activities are in 2026)

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

const prisma = new PrismaClient()

// Fixed reference date matching the seed timeline
const REFERENCE_DATE = new Date('2026-05-02T00:00:00Z')
const EIGHT_WEEKS_MS = 8 * 7 * 86_400_000
const EIGHT_WEEKS_AGO = new Date(REFERENCE_DATE.getTime() - EIGHT_WEEKS_MS)

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
    include: {
      goalRaces: { where: { isActive: true }, take: 1 },
    },
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

  // ── Load all activities ───────────────────────────────────────────────────
  const allActivities = await prisma.activity.findMany({
    where:   { athleteId: athlete.id },
    orderBy: { startedAt: 'asc' },
  })

  if (allActivities.length === 0) {
    console.error('No activities found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  // Activities in the last 8 weeks of the demo timeline
  const recentActivities: ActivityWithClassification[] = allActivities
    .filter(a => a.startedAt >= EIGHT_WEEKS_AGO && a.startedAt <= REFERENCE_DATE)
    .map(a => ({
      startedAt:         a.startedAt,
      distanceMeters:    a.distanceMeters,
      movingTimeSeconds: a.movingTimeSeconds,
      avgPaceSecPerKm:   a.avgPaceSecPerKm,
      workoutType:       a.workoutType,
    }))

  // ── Load weekly summaries ─────────────────────────────────────────────────
  const allSummaries = await prisma.weeklyTrainingSummary.findMany({
    where:   { athleteId: athlete.id },
    orderBy: { weekNumber: 'asc' },
  })

  const recentSummaries: WeeklySummaryForPrediction[] = allSummaries
    .filter(s => s.weekStartDate >= EIGHT_WEEKS_AGO && s.weekStartDate <= REFERENCE_DATE)
    .map(s => ({
      weekNumber:    s.weekNumber,
      weekStartDate: s.weekStartDate,
      totalLoad:     s.totalLoad,
    }))

  // ── Compute training load (full history) ──────────────────────────────────
  const trainingLoadInput = allActivities.map(a => ({
    startedAt:    a.startedAt,
    trainingLoad: a.trainingLoad,
  }))
  const currentTrainingLoad = computeTrainingLoad(trainingLoadInput)

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

  const recentClassified = allActivities
    .filter(a => a.startedAt >= EIGHT_WEEKS_AGO)
    .map(a => ({
      startedAt:    a.startedAt,
      workoutType:  a.workoutType,
      trainingLoad: a.trainingLoad,
    }))

  const currentPhase = detectTrainingPhase({
    goalRaceDate:        dbGoalRace.raceDate,
    weeklySummaries:     periodizationSummaries,
    currentInjuryRisk,
    currentTrainingLoad,
    recentActivities:    recentClassified,
    referenceDate:       REFERENCE_DATE,
  })

  // ── Run race prediction ───────────────────────────────────────────────────
  const result = predictRaceTime({
    goalRace,
    recentActivities,
    weeklySummaries: recentSummaries,
    currentTrainingLoad,
    currentPhase,
  })

  // ── Print full result ─────────────────────────────────────────────────────
  console.log('\nRace prediction — full result\n')
  console.log(`  Goal race:             ${goalRace.raceName} (${(goalRace.distanceMeters / 1000).toFixed(1)} km)`)
  console.log(`  Goal time:             ${goalRace.goalTimeSeconds !== null ? formatGoalTime(goalRace.goalTimeSeconds) : '—'}`)
  console.log(`  Reference date:        ${REFERENCE_DATE.toISOString().slice(0, 10)}`)
  console.log(`  Phase:                 ${currentPhase.phase} (${currentPhase.daysUntilRace} days to race)`)
  console.log(`  TSB:                   ${currentTrainingLoad.tsb.toFixed(1)}`)
  console.log()
  console.log(`  Predicted time:        ${result.predictedTimeFormatted} (${result.predictedTimeSeconds}s)`)
  console.log(`  Confidence range:      ${result.confidenceLowFormatted} – ${result.confidenceHighFormatted}`)
  console.log(`  Confidence score:      ${result.confidenceScore}/100`)
  console.log(`  Gap to goal:           ${result.gapToGoalFormatted} (${result.gapToGoalSeconds ?? '—'}s)`)
  console.log()
  if (result.bestEffortActivity) {
    const b = result.bestEffortActivity
    console.log(`  Best effort:           ${b.date}  ${b.distanceKm} km @ ${b.paceFormatted}  [${b.workoutType}]`)
  } else {
    console.log('  Best effort:           none found')
  }
  console.log()
  console.log(`  Explanation:           ${result.explanation}`)
  console.log()
  console.log(`  What needs to happen:  ${result.whatNeedsToHappen}`)
  if (result.dataQualityNotes.length > 0) {
    console.log()
    for (const note of result.dataQualityNotes) {
      console.log(`  Data quality:          ${note}`)
    }
  }

  // ── Qualifying activities summary ─────────────────────────────────────────
  const qualifying = recentActivities.filter(
    a => ['TEMPO', 'LONG_RUN', 'RACE'].includes(a.workoutType) && a.distanceMeters >= 5000,
  )
  console.log(`\n  Qualifying activities in last 8 weeks: ${qualifying.length}`)
  for (const a of qualifying.sort((x, y) => x.avgPaceSecPerKm - y.avgPaceSecPerKm)) {
    const pk = Math.floor(a.avgPaceSecPerKm / 60)
    const ps = a.avgPaceSecPerKm % 60
    console.log(
      `    ${a.startedAt.toISOString().slice(5, 10)}  ` +
      `${a.workoutType.padEnd(10)}  ` +
      `${(a.distanceMeters / 1000).toFixed(1).padStart(5)} km  ` +
      `${pk}:${String(ps).padStart(2, '0')}/km`,
    )
  }

  // ── Assertions ────────────────────────────────────────────────────────────
  console.log('\nAssertions:')

  assert(
    result.predictedTimeSeconds > 5400 && result.predictedTimeSeconds < 8100,
    'predictedTimeSeconds is between 5400 (1:30:00) and 8100 (2:15:00)',
    `${result.predictedTimeFormatted}`,
  )

  assert(
    result.confidenceLow < result.predictedTimeSeconds &&
    result.predictedTimeSeconds < result.confidenceHigh,
    'confidenceLow < predictedTimeSeconds < confidenceHigh',
    `${result.confidenceLowFormatted} < ${result.predictedTimeFormatted} < ${result.confidenceHighFormatted}`,
  )

  assert(
    result.gapToGoalSeconds !== null && Number.isFinite(result.gapToGoalSeconds),
    'gapToGoalSeconds is a finite number',
    `${result.gapToGoalSeconds}`,
  )

  assert(
    typeof result.explanation === 'string' && result.explanation.length > 0,
    'explanation is a non-empty string',
  )

  assert(
    typeof result.whatNeedsToHappen === 'string' && result.whatNeedsToHappen.length > 0,
    'whatNeedsToHappen is a non-empty string',
  )

  assert(
    result.confidenceScore >= 10 && result.confidenceScore <= 95,
    'confidenceScore is between 10 and 95',
    `${result.confidenceScore}`,
  )

  // ── Exit ──────────────────────────────────────────────────────────────────
  console.log()
  if (failures > 0) {
    console.error(`${failures} assertion(s) failed.`)
    process.exit(1)
  } else {
    console.log('All assertions passed.')
  }
}

function formatGoalTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
