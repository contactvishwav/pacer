import { PrismaClient } from '@prisma/client'
import {
  classifyWorkout,
  type ActivityWithLaps,
  type ActivityLapData,
  type AthleteThresholds,
} from '../src/lib/intelligence/workout-classifier'
import type { WorkoutType } from '../src/lib/schemas/enums'

const prisma = new PrismaClient()

// ─── Demo athlete thresholds ──────────────────────────────────────────────────

const ATHLETE_THRESHOLDS: AthleteThresholds = {
  thresholdHR:    170,
  easyHRCeiling:  145,
  restingHR:      52,
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paceStr(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60)
  const s = secPerKm % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dbActivities = await prisma.activity.findMany({
    orderBy: { startedAt: 'asc' },
    include: { laps: { orderBy: { lapNumber: 'asc' } } },
  })

  if (dbActivities.length === 0) {
    console.error('No activities found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  // ── Compute recent long-run baseline per activity ─────────────────────────
  // "recent" = max LONG_RUN distance in activities that start at least 1 day
  // before the current activity AND within the last 4 weeks (28 days).
  // Falls back to 0 when no prior long run exists.
  function recentLongRunDistance(activityIndex: number): number {
    const refDate = dbActivities[activityIndex].startedAt
    const cutoff  = new Date(refDate.getTime() - 28 * 86_400_000)
    let max = 0
    for (let i = 0; i < activityIndex; i++) {
      const a = dbActivities[i]
      if (a.startedAt >= cutoff && a.workoutType === 'LONG_RUN') {
        if (a.distanceMeters > max) max = a.distanceMeters
      }
    }
    return max
  }

  // ── Classify all activities ───────────────────────────────────────────────
  type ClassifiedRow = {
    index:          number
    startedAt:      Date
    trainingWeek:   number | null
    intendedType:   WorkoutType | null
    computedType:   WorkoutType
    confidence:     string
    evaluation:     string
    avgHR:          number | null
    distanceKm:     string
    durationMin:    string
    lapHRStdDev:    string
    matched:        boolean
  }

  const rows: ClassifiedRow[] = []
  let zoneMismatchFound = false

  for (let i = 0; i < dbActivities.length; i++) {
    const a = dbActivities[i]

    const laps: ActivityLapData[] = a.laps.map(l => ({
      lapNumber:        l.lapNumber,
      avgHeartRate:     l.avgHeartRate,
      avgPaceSecPerKm:  l.avgPaceSecPerKm,
      isRest:           l.isRest,
    }))

    const activityInput: ActivityWithLaps = {
      distanceMeters:       a.distanceMeters,
      movingTimeSeconds:    a.movingTimeSeconds,
      avgHeartRate:         a.avgHeartRate,
      maxHeartRate:         a.maxHeartRate,
      avgPaceSecPerKm:      a.avgPaceSecPerKm,
      avgCadence:           a.avgCadence,
      trainingLoad:         a.trainingLoad,
      intendedWorkoutType:  a.intendedWorkoutType as WorkoutType | null,
      laps,
    }

    const longRun = recentLongRunDistance(i)
    const result  = classifyWorkout(activityInput, ATHLETE_THRESHOLDS, longRun)

    const intendedType = a.intendedWorkoutType as WorkoutType | null
    const matched = intendedType === null || result.workoutType === intendedType

    // Track the week-4 Sunday zone-mismatch run
    // It is the activity with trainingWeek=4, intendedWorkoutType=EASY, avgHR=157
    if (a.trainingWeek === 4 && intendedType === 'EASY' && (a.avgHeartRate ?? 0) > 150) {
      if (result.executionEvaluation === 'TOO_HARD') {
        zoneMismatchFound = true
      } else {
        console.error(
          `  WARN  Zone-mismatch run in week 4: got executionEvaluation=${result.executionEvaluation}, ` +
          `expected TOO_HARD. avgHR=${a.avgHeartRate}, easyHRCeiling=${ATHLETE_THRESHOLDS.easyHRCeiling}`,
        )
      }
    }

    rows.push({
      index:        i,
      startedAt:    a.startedAt,
      trainingWeek: a.trainingWeek,
      intendedType,
      computedType: result.workoutType,
      confidence:   result.confidence,
      evaluation:   result.executionEvaluation,
      avgHR:        a.avgHeartRate,
      distanceKm:   (a.distanceMeters / 1000).toFixed(1),
      durationMin:  (a.movingTimeSeconds / 60).toFixed(0),
      lapHRStdDev:  result.signals.lapHRStdDev !== null ? result.signals.lapHRStdDev.toFixed(1) : '—',
      matched,
    })
  }

  // ── Summary table ─────────────────────────────────────────────────────────
  console.log('Workout classifier — all 54 activities\n')
  console.log(
    'Wk   Date       Intended         Computed         Conf   HR    Dist  Dur  LapHR  Eval',
  )
  console.log('─'.repeat(100))

  for (const r of rows) {
    const dateStr  = r.startedAt.toISOString().slice(5, 10)
    const intended = (r.intendedType ?? '—').padEnd(16)
    const computed = r.computedType.padEnd(16)
    const marker   = r.matched ? ' ' : '!'

    console.log(
      `Wk${String(r.trainingWeek ?? 0).padStart(2)} ${dateStr} ` +
      `${intended} ${computed} ` +
      `${r.confidence.padEnd(6)} ` +
      `${String(r.avgHR ?? '—').padStart(4)} ` +
      `${r.distanceKm.padStart(5)}km ` +
      `${r.durationMin.padStart(3)}m ` +
      `${r.lapHRStdDev.padStart(5)} ` +
      `${marker}${r.evaluation}`,
    )
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  const byComputed = new Map<string, number>()
  for (const r of rows) {
    byComputed.set(r.computedType, (byComputed.get(r.computedType) ?? 0) + 1)
  }

  console.log('\nClassification counts (computed):')
  for (const [type, count] of [...byComputed.entries()].sort()) {
    console.log(`  ${type.padEnd(14)} ${count}`)
  }

  const matchCount = rows.filter(r => r.matched).length
  const accuracy   = matchCount / rows.length
  console.log(`\nAccuracy vs intendedWorkoutType: ${matchCount}/${rows.length} = ${(accuracy * 100).toFixed(1)}%`)

  // ── Assertions ────────────────────────────────────────────────────────────
  console.log('\nAssertions:')

  // 1. Zone-mismatch run (week 4 Sunday) gets TOO_HARD
  assert(
    zoneMismatchFound,
    'Zone-mismatch run (week 4, high-HR easy) gets executionEvaluation = TOO_HARD',
  )

  // 2. At least 3 classified as INTERVAL
  const intervalCount = byComputed.get('INTERVAL') ?? 0
  assert(
    intervalCount >= 3,
    'At least 3 activities classified as INTERVAL',
    `found ${intervalCount}`,
  )

  // 3. At least 3 classified as TEMPO
  const tempoCount = byComputed.get('TEMPO') ?? 0
  assert(
    tempoCount >= 3,
    'At least 3 activities classified as TEMPO',
    `found ${tempoCount}`,
  )

  // 4. At least 4 classified as LONG_RUN
  const longRunCount = byComputed.get('LONG_RUN') ?? 0
  assert(
    longRunCount >= 4,
    'At least 4 activities classified as LONG_RUN',
    `found ${longRunCount}`,
  )

  // 5. Overall accuracy > 75%
  assert(
    accuracy > 0.75,
    'Overall classification accuracy > 75% vs intendedWorkoutType',
    `${(accuracy * 100).toFixed(1)}%`,
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
