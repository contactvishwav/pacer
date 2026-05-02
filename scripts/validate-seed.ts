import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import {
  generateDemoPlan,
} from '../src/lib/demo/generate-training-plan'
import {
  GeneratedActivitySchema,
  WeeklyTrainingSummarySchema,
  WeeklyBriefDataSchema,
  DbActivityWithLapsSchema,
  DbWeeklyTrainingSummarySchema,
} from '../src/lib/schemas'

const prisma = new PrismaClient()

// ─── Reporter ─────────────────────────────────────────────────────────────────

let totalFails = 0

function pass(label: string, detail?: string) {
  const suffix = detail ? ` (${detail})` : ''
  console.log(`  PASS  ${label}${suffix}`)
}

function fail(label: string, errors: z.ZodIssue[], context?: string) {
  totalFails++
  const ctx = context ? ` [${context}]` : ''
  console.error(`  FAIL  ${label}${ctx}`)
  for (const issue of errors.slice(0, 5)) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    console.error(`          ${path}: ${issue.message}`)
  }
  if (errors.length > 5) {
    console.error(`          … and ${errors.length - 5} more issue(s)`)
  }
}

function section(title: string) {
  console.log(`\n── ${title} ──`)
}

// ─── Validate in-memory generated plan ───────────────────────────────────────

function validatePlanData() {
  section('Generated plan (in-memory)')
  const plan = generateDemoPlan()

  // Activities
  let actFails = 0
  for (let i = 0; i < plan.activities.length; i++) {
    const r = GeneratedActivitySchema.safeParse(plan.activities[i])
    if (!r.success) {
      actFails++
      fail(`Activity[${i}]`, r.error.issues, `week ${plan.activities[i].trainingWeek} ${plan.activities[i].workoutType}`)
    }
  }
  if (actFails === 0) {
    pass('GeneratedActivitySchema', `${plan.activities.length}/${plan.activities.length}`)
  } else {
    totalFails += actFails
    console.error(`  FAIL  GeneratedActivitySchema — ${actFails} of ${plan.activities.length} failed`)
  }

  // Weekly summaries
  let sumFails = 0
  for (let i = 0; i < plan.weeklySummaries.length; i++) {
    const r = WeeklyTrainingSummarySchema.safeParse(plan.weeklySummaries[i])
    if (!r.success) {
      sumFails++
      fail(`WeeklySummary[${i}]`, r.error.issues, `week ${plan.weeklySummaries[i].weekNumber}`)
    }
  }
  if (sumFails === 0) {
    pass('WeeklyTrainingSummarySchema', `${plan.weeklySummaries.length}/${plan.weeklySummaries.length}`)
  } else {
    console.error(`  FAIL  WeeklyTrainingSummarySchema — ${sumFails} of ${plan.weeklySummaries.length} failed`)
  }

  // Weekly briefs
  let briefFails = 0
  for (let i = 0; i < plan.weeklyBriefs.length; i++) {
    const r = WeeklyBriefDataSchema.safeParse(plan.weeklyBriefs[i])
    if (!r.success) {
      briefFails++
      fail(`WeeklyBrief[${i}]`, r.error.issues, `week ${plan.weeklyBriefs[i].weekNumber}`)
    }
  }
  if (briefFails === 0) {
    pass('WeeklyBriefDataSchema', `${plan.weeklyBriefs.length}/${plan.weeklyBriefs.length}`)
  } else {
    console.error(`  FAIL  WeeklyBriefDataSchema — ${briefFails} of ${plan.weeklyBriefs.length} failed`)
  }

  return plan
}

// ─── Validate database records ────────────────────────────────────────────────

async function validateDbRecords() {
  section('Database records')

  // Athlete
  const athlete = await prisma.athlete.findFirst()
  if (!athlete) {
    totalFails++
    console.error('  FAIL  DB athlete — no records found. Run `npx prisma db seed` first.')
    return
  }
  const athleteSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    email: z.string().nullable(),
    restingHeartRate: z.number().int().nullable(),
    maxHeartRate: z.number().int().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  const athleteResult = athleteSchema.safeParse(athlete)
  if (athleteResult.success) {
    pass('DB Athlete', athlete.name)
  } else {
    fail('DB Athlete', athleteResult.error.issues)
  }

  // First 5 activities with laps
  const activities = await prisma.activity.findMany({
    take: 5,
    include: { laps: { orderBy: { lapNumber: 'asc' } } },
    orderBy: { startedAt: 'asc' },
  })

  if (activities.length === 0) {
    totalFails++
    console.error('  FAIL  DB Activities — no records found')
    return
  }

  let dbActFails = 0
  for (const act of activities) {
    const r = DbActivityWithLapsSchema.safeParse(act)
    if (!r.success) {
      dbActFails++
      fail(
        `DB Activity`,
        r.error.issues,
        `${act.startedAt.toISOString().slice(0, 10)} ${act.workoutType}`,
      )
    }
  }
  if (dbActFails === 0) {
    pass('DbActivityWithLapsSchema', `${activities.length}/${activities.length}`)
  } else {
    console.error(`  FAIL  DbActivityWithLapsSchema — ${dbActFails} of ${activities.length} failed`)
  }

  // Lap presence check
  const totalLaps = activities.reduce((s, a) => s + a.laps.length, 0)
  if (totalLaps > 0) {
    pass('Lap records present', `${totalLaps} laps across first ${activities.length} activities`)
  } else {
    totalFails++
    console.error('  FAIL  Lap records — no laps found for first 5 activities')
  }

  // Weekly training summaries
  const summaries = await prisma.weeklyTrainingSummary.findMany({
    where: { athleteId: athlete.id },
    orderBy: { weekNumber: 'asc' },
  })
  let sumDbFails = 0
  for (const s of summaries) {
    const r = DbWeeklyTrainingSummarySchema.safeParse(s)
    if (!r.success) {
      sumDbFails++
      fail(`DB WeeklyTrainingSummary`, r.error.issues, `week ${s.weekNumber}`)
    }
  }
  if (sumDbFails === 0 && summaries.length > 0) {
    pass('DbWeeklyTrainingSummarySchema', `${summaries.length}/${summaries.length}`)
  } else if (summaries.length === 0) {
    totalFails++
    console.error('  FAIL  DB WeeklyTrainingSummary — no records found')
  } else {
    console.error(`  FAIL  DbWeeklyTrainingSummarySchema — ${sumDbFails} of ${summaries.length} failed`)
  }

  // ACWR value check on peak week (week 8 should be > 1.3)
  const peakWeek = summaries.find(s => s.weekNumber === 8)
  if (peakWeek) {
    if (peakWeek.acwr > 1.2) {
      pass('ACWR spike present in week 8', `ACWR = ${peakWeek.acwr.toFixed(3)}`)
    } else {
      totalFails++
      console.error(
        `  FAIL  ACWR spike check — week 8 ACWR = ${peakWeek.acwr.toFixed(3)}, expected > 1.2`,
      )
    }
  }

  // Zone-mismatch check (week 4 Sunday easy → STEADY_STATE)
  const mismatch = await prisma.activity.findFirst({
    where: {
      athleteId: athlete.id,
      trainingWeek: 4,
      intendedWorkoutType: 'EASY',
      workoutType: 'STEADY_STATE',
    },
  })
  if (mismatch) {
    pass(
      'Zone-mismatch activity present',
      `week 4 easy→STEADY_STATE, HR ${mismatch.avgHeartRate}`,
    )
  } else {
    totalFails++
    console.error('  FAIL  Zone-mismatch activity not found (week 4 easy run executed too hard)')
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Pacer seed validation\n')

  validatePlanData()
  await validateDbRecords()

  console.log(`\n${'─'.repeat(48)}`)
  if (totalFails === 0) {
    console.log('All validations passed.')
  } else {
    console.error(`${totalFails} validation(s) failed.`)
    process.exit(1)
  }
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
