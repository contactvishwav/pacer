import { PrismaClient } from '@prisma/client'
import {
  generateDemoPlan,
  DEMO_ATHLETE,
  DEMO_RACE,
} from '../src/lib/demo/generate-training-plan'
import type { ActivityData, LapData } from '../src/lib/demo/generate-training-plan'

const prisma = new PrismaClient()

async function main() {
  const plan = generateDemoPlan()

  // Idempotency: skip if this exact version is already seeded
  const existing = await prisma.generatedDatasetMetadata.findFirst({
    where: { seedHash: plan.seedHash },
  })
  if (existing) {
    console.log(
      `Seed already applied (v${plan.version}, hash ${plan.seedHash.slice(0, 8)}…). Nothing to do.`,
    )
    return
  }

  console.log(`Seeding Pacer demo data v${plan.version}…`)
  console.log(`  ${plan.activities.length} activities`)
  console.log(`  ${plan.weeklySummaries.length} weekly summaries`)
  console.log(`  ${plan.weeklyBriefs.length} weekly briefs`)

  // ── Clear existing data (reverse dependency order, no raw TRUNCATE) ────────
  console.log('\nClearing existing data…')
  await prisma.coachMemory.deleteMany()
  await prisma.coachMessage.deleteMany()
  await prisma.coachConversation.deleteMany()
  await prisma.weeklyCoachingBrief.deleteMany()
  await prisma.weeklyTrainingSummary.deleteMany()
  await prisma.activityLap.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.generatedDatasetMetadata.deleteMany()
  await prisma.goalRace.deleteMany()
  await prisma.stravaConnection.deleteMany()
  await prisma.athlete.deleteMany()

  // ── Athlete ────────────────────────────────────────────────────────────────
  const athlete = await prisma.athlete.create({
    data: {
      name: DEMO_ATHLETE.name,
      email: DEMO_ATHLETE.email,
      restingHeartRate: DEMO_ATHLETE.restingHeartRate,
      maxHeartRate: DEMO_ATHLETE.maxHeartRate,
      preferredUnit: DEMO_ATHLETE.preferredUnit,
      timezone: DEMO_ATHLETE.timezone,
    },
  })
  console.log(`Created athlete: ${athlete.name} (${athlete.id})`)

  // ── Goal race ──────────────────────────────────────────────────────────────
  const goalRace = await prisma.goalRace.create({
    data: {
      athleteId: athlete.id,
      raceName: DEMO_RACE.name,
      raceDate: DEMO_RACE.date,
      distanceMeters: DEMO_RACE.distanceMeters,
      goalTimeSeconds: DEMO_RACE.goalTimeSeconds,
      isActive: true,
    },
  })
  console.log(`Created goal race: ${goalRace.raceName}`)

  // ── Activities with laps ───────────────────────────────────────────────────
  // No transaction — 54 nested creates exceed the default 5s interactive
  // transaction timeout. The deleteMany block above ensures clean state,
  // so sequential creates are idempotent on re-run.
  console.log('\nInserting activities…')
  for (const act of plan.activities as ActivityData[]) {
    await prisma.activity.create({
      data: {
        athleteId: athlete.id,
        source: act.source,
        startedAt: act.startedAt,
        distanceMeters: act.distanceMeters,
        durationSeconds: act.durationSeconds,
        movingTimeSeconds: act.movingTimeSeconds,
        elevationGainMeters: act.elevationGainMeters,
        avgPaceSecPerKm: act.avgPaceSecPerKm,
        avgHeartRate: act.avgHeartRate,
        maxHeartRate: act.maxHeartRate,
        avgCadence: act.avgCadence,
        calories: act.calories,
        trainingLoad: act.trainingLoad,
        workoutType: act.workoutType,
        workoutTypeConfidence: act.workoutTypeConfidence,
        workoutTypeExplanation: act.workoutTypeExplanation,
        executionEvaluation: act.executionEvaluation,
        intendedWorkoutType: act.intendedWorkoutType,
        trainingPhase: act.trainingPhase,
        trainingWeek: act.trainingWeek,
        hasGps: act.hasGps,
        laps: {
          createMany: {
            data: act.laps.map((lap: LapData) => ({
              lapNumber: lap.lapNumber,
              distanceMeters: lap.distanceMeters,
              durationSeconds: lap.durationSeconds,
              avgPaceSecPerKm: lap.avgPaceSecPerKm,
              avgHeartRate: lap.avgHeartRate,
              maxHeartRate: lap.maxHeartRate,
              avgCadence: lap.avgCadence,
              isRest: lap.isRest,
            })),
          },
        },
      },
    })
  }
  console.log(`Inserted ${plan.activities.length} activities with laps`)

  // ── Weekly training summaries ──────────────────────────────────────────────
  await prisma.weeklyTrainingSummary.createMany({
    data: plan.weeklySummaries.map((s) => ({
      athleteId: athlete.id,
      weekStartDate: s.weekStartDate,
      weekNumber: s.weekNumber,
      totalDistanceMeters: s.totalDistanceMeters,
      totalDurationSeconds: s.totalDurationSeconds,
      totalMovingTimeSeconds: s.totalMovingTimeSeconds,
      activityCount: s.activityCount,
      totalLoad: s.totalLoad,
      avgHeartRate: s.avgHeartRate,
      longRunDistanceMeters: s.longRunDistanceMeters,
      qualitySessionCount: s.qualitySessionCount,
      ctl: s.ctl,
      atl: s.atl,
      tsb: s.tsb,
      acwr: s.acwr,
      trainingPhase: s.trainingPhase,
      phaseRationale: s.phaseRationale,
    })),
  })
  console.log(`Inserted ${plan.weeklySummaries.length} weekly summaries`)

  // ── Weekly coaching briefs ─────────────────────────────────────────────────
  await prisma.weeklyCoachingBrief.createMany({
    data: plan.weeklyBriefs.map((b) => ({
      athleteId: athlete.id,
      goalRaceId: goalRace.id,
      weekStartDate: b.weekStartDate,
      weekNumber: b.weekNumber,
      trainingPhase: b.trainingPhase,
      acwr: b.acwr,
      projectedTimeSeconds: b.projectedTimeSeconds,
      gapToGoalSeconds: b.gapToGoalSeconds,
      phaseNote: b.phaseNote,
      keyWorkoutNote: b.keyWorkoutNote,
      riskNote: b.riskNote,
      priorityNote: b.priorityNote,
      trajectoryNote: b.trajectoryNote,
    })),
  })
  console.log(`Inserted ${plan.weeklyBriefs.length} weekly briefs`)

  // ── Dataset metadata (used for idempotency check on next run) ─────────────
  await prisma.generatedDatasetMetadata.create({
    data: {
      athleteId: athlete.id,
      version: plan.version,
      raceName: DEMO_RACE.name,
      raceDate: DEMO_RACE.date,
      targetTimeSeconds: DEMO_RACE.goalTimeSeconds,
      weekCount: plan.weeklySummaries.length,
      activityCount: plan.activities.length,
      seedHash: plan.seedHash,
    },
  })

  // ── Coach memory (training-context summary) ────────────────────────────────
  const lastSummary = plan.weeklySummaries[plan.weeklySummaries.length - 1]
  const lastBrief   = plan.weeklyBriefs[plan.weeklyBriefs.length - 1]
  const peakSummary = plan.weeklySummaries[7] // week 8

  const memoryText = [
    `Athlete: Alex Chen, targeting SF Half Marathon (${DEMO_RACE.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}) in 1:55:00.`,
    `Current week: ${lastSummary.weekNumber} of 12, phase: ${lastSummary.trainingPhase}.`,
    `Block structure: BASE (wks 1–3) → BUILD (wks 4–7) → PEAK (wk 8) → RECOVERY (wk 9) → BUILD (wk 10) → TAPER (wks 11–12).`,
    `Notable events: Week 4 easy run executed above HR ceiling (HR 157 vs 145 ceiling) — detected as zone mismatch. Week 8 extra Sunday run caused ACWR spike to ${peakSummary.acwr.toFixed(2)}.`,
    `Current fitness: CTL ${lastSummary.ctl.toFixed(1)}, ATL ${lastSummary.atl.toFixed(1)}, TSB ${lastSummary.tsb.toFixed(1)}, ACWR ${lastSummary.acwr.toFixed(2)}.`,
    `Race trajectory: ${lastBrief.trajectoryNote}`,
    `Total: ${plan.activities.length} activities seeded.`,
  ].join(' ')

  await prisma.coachMemory.create({
    data: {
      athleteId: athlete.id,
      summary: memoryText,
      turnRangeStart: 0,
      turnRangeEnd: 0,
    },
  })

  // ── Demo coaching conversation ─────────────────────────────────────────────
  const conversation = await prisma.coachConversation.create({
    data: {
      athleteId: athlete.id,
      contextType: 'DASHBOARD',
      title: 'Training overview',
      isActive: true,
    },
  })

  const acwrLabel =
    lastSummary.acwr > 1.3
      ? 'elevated'
      : lastSummary.acwr > 1.15
        ? 'in the caution range'
        : 'within the optimal range'

  await prisma.coachMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'USER',
      content: "How's my training going overall? Am I on track for the SF Half?",
      tokenCount: 15,
    },
  })

  await prisma.coachMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'ASSISTANT',
      content: [
        `You're in a solid position heading into the final taper weeks. Here's the picture:`,
        ``,
        `**Phase**: Week ${lastSummary.weekNumber} of 12 — ${lastSummary.trainingPhase.toLowerCase()} phase. The hardest training is behind you.`,
        ``,
        `**Race trajectory**: ${lastBrief.trajectoryNote}`,
        ``,
        `**Load status**: ACWR is ${lastSummary.acwr.toFixed(2)} — ${acwrLabel}. ${lastBrief.riskNote}`,
        ``,
        `**Key focus**: ${lastBrief.priorityNote}`,
        ``,
        `One note worth flagging: the easy run in week 4 ran hotter than intended — HR hit 157 bpm against a 145 bpm ceiling. That was a one-off and didn't derail anything, but it's worth keeping easy days genuinely easy in taper. Ask me about any specific week or workout if you want to dig in.`,
      ].join('\n'),
      tokenCount: 220,
    },
  })

  console.log('Created coaching conversation with 2 messages')

  console.log(`\n✓ Seed complete.`)
  console.log(`  ${plan.activities.length} activities, ${plan.weeklySummaries.length} summaries, ${plan.weeklyBriefs.length} briefs`)
  console.log(`  Seed hash: ${plan.seedHash}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
