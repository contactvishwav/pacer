import { PrismaClient, Activity, ActivityLap } from '@prisma/client'
import { XMLParser } from 'fast-xml-parser'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const OUT_DIR = path.resolve(process.cwd(), 'generated-training-data/tcx')

// Garmin TCX v2 namespace
const TCX_NS = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2'
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance'

// San Jose start position
const START_LAT = 37.3382
const START_LON = -121.8863
const BASE_ALT  = 25.0

// Meters per degree at this latitude
const M_PER_LAT = 111111
const M_PER_LON = 88200  // ≈ 111111 × cos(37.3°)

const SQRT1_2 = Math.SQRT1_2 // cos/sin of 45°

type ActivityWithLaps = Activity & { laps: ActivityLap[] }

// ─── GPS and trackpoint generation ────────────────────────────────────────────

interface Trackpoint {
  time: Date
  lat: number
  lon: number
  alt: number
  distFromActivityStart: number
  hr: number
  cadence: number
}

function generateTrackpoints(
  lapStartedAt: Date,
  lapDurationSeconds: number,
  lapDistanceMeters: number,
  lapOffsetMeters: number,       // cumulative activity distance before this lap
  totalActivityDistMeters: number,
  avgHr: number,
  avgCadence: number,
): Trackpoint[] {
  const lapSpeed = lapDurationSeconds > 0
    ? lapDistanceMeters / lapDurationSeconds
    : 0 // m/s
  const turnDistM = totalActivityDistMeters / 2
  const STEP_S = 5
  const steps = Math.ceil(lapDurationSeconds / STEP_S) + 1
  const points: Trackpoint[] = []

  for (let i = 0; i < steps; i++) {
    const elapsed = Math.min(i * STEP_S, lapDurationSeconds)
    const distFromStart = lapOffsetMeters + lapSpeed * elapsed

    // Out-and-back route heading NE (45°)
    const outDist  = Math.min(distFromStart, turnDistM)
    const backDist = Math.max(0, distFromStart - turnDistM)
    const netN = (outDist - backDist) * SQRT1_2
    const netE = (outDist - backDist) * SQRT1_2

    const lat = START_LAT + netN / M_PER_LAT
    const lon = START_LON + netE / M_PER_LON
    const alt = BASE_ALT + 2 * Math.sin(Math.PI * distFromStart / 1000)

    // HR: ramp up in first 15% of lap duration, then steady
    const progress = lapDurationSeconds > 0 ? elapsed / lapDurationSeconds : 1
    const hr = progress < 0.15
      ? Math.round(avgHr - 8 + (progress / 0.15) * 8)
      : avgHr

    points.push({
      time: new Date(lapStartedAt.getTime() + elapsed * 1000),
      lat,
      lon,
      alt: Math.round(alt * 10) / 10,
      distFromActivityStart: distFromStart,
      hr: Math.max(90, Math.min(190, hr)),
      cadence: avgCadence,
    })
  }

  return points
}

// ─── TCX XML builder ───────────────────────────────────────────────────────────

function isoMs(d: Date): string {
  // toISOString() already produces "…T…Z" with milliseconds (e.g. 13:30:00.000Z)
  return d.toISOString()
}

function buildTcx(activity: ActivityWithLaps): string {
  const laps = [...activity.laps].sort((a, b) => a.lapNumber - b.lapNumber)

  const fallbackHr  = activity.avgHeartRate ?? 140
  const fallbackMax = activity.maxHeartRate ?? 160
  const fallbackCad = activity.avgCadence   ?? 170

  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push(`<TrainingCenterDatabase`)
  lines.push(`  xmlns="${TCX_NS}"`)
  lines.push(`  xmlns:xsi="${XSI_NS}"`)
  lines.push(`  xsi:schemaLocation="${TCX_NS} https://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">`)
  lines.push(`  <Activities>`)
  lines.push(`    <Activity Sport="Running">`)
  lines.push(`      <Id>${isoMs(activity.startedAt)}</Id>`)

  let lapStartTime = new Date(activity.startedAt)
  let offsetM = 0

  const effectiveLaps: ActivityLap[] = laps.length > 0
    ? laps
    : [{
        id: 'synthetic',
        activityId: activity.id,
        lapNumber: 1,
        distanceMeters: activity.distanceMeters,
        durationSeconds: activity.durationSeconds,
        avgPaceSecPerKm: activity.avgPaceSecPerKm,
        avgHeartRate: activity.avgHeartRate,
        maxHeartRate: activity.maxHeartRate,
        avgCadence: activity.avgCadence,
        isRest: false,
        createdAt: activity.startedAt,
      }]

  for (const lap of effectiveLaps) {
    const lapHr  = lap.avgHeartRate ?? fallbackHr
    const lapMax = lap.maxHeartRate ?? fallbackMax
    const lapCad = lap.avgCadence   ?? fallbackCad
    const intensity = lap.isRest ? 'Resting' : 'Active'

    lines.push(`      <Lap StartTime="${isoMs(lapStartTime)}">`)
    lines.push(`        <TotalTimeSeconds>${lap.durationSeconds}</TotalTimeSeconds>`)
    lines.push(`        <DistanceMeters>${lap.distanceMeters}</DistanceMeters>`)
    lines.push(`        <AverageHeartRateBpm><Value>${lapHr}</Value></AverageHeartRateBpm>`)
    lines.push(`        <MaximumHeartRateBpm><Value>${lapMax}</Value></MaximumHeartRateBpm>`)
    lines.push(`        <Intensity>${intensity}</Intensity>`)
    lines.push(`        <TriggerMethod>Manual</TriggerMethod>`)
    lines.push(`        <Track>`)

    const trackpoints = generateTrackpoints(
      lapStartTime,
      lap.durationSeconds,
      lap.distanceMeters,
      offsetM,
      activity.distanceMeters,
      lapHr,
      lapCad,
    )

    for (const tp of trackpoints) {
      lines.push(`          <Trackpoint>`)
      lines.push(`            <Time>${isoMs(tp.time)}</Time>`)
      lines.push(`            <Position>`)
      lines.push(`              <LatitudeDegrees>${tp.lat.toFixed(7)}</LatitudeDegrees>`)
      lines.push(`              <LongitudeDegrees>${tp.lon.toFixed(7)}</LongitudeDegrees>`)
      lines.push(`            </Position>`)
      lines.push(`            <AltitudeMeters>${tp.alt}</AltitudeMeters>`)
      lines.push(`            <DistanceMeters>${tp.distFromActivityStart.toFixed(2)}</DistanceMeters>`)
      lines.push(`            <HeartRateBpm><Value>${tp.hr}</Value></HeartRateBpm>`)
      lines.push(`            <Cadence>${tp.cadence}</Cadence>`)
      lines.push(`          </Trackpoint>`)
    }

    lines.push(`        </Track>`)
    lines.push(`      </Lap>`)

    lapStartTime = new Date(lapStartTime.getTime() + lap.durationSeconds * 1000)
    offsetM += lap.distanceMeters
  }

  lines.push(`    </Activity>`)
  lines.push(`  </Activities>`)
  lines.push(`</TrainingCenterDatabase>`)

  return lines.join('\n')
}

function tcxFilename(activity: Activity): string {
  const date    = activity.startedAt.toISOString().slice(0, 10)
  const type    = String(activity.workoutType).toLowerCase().replace(/_/g, '-')
  const distKm  = Math.round(activity.distanceMeters / 1000)
  return `${date}-${type}-${distKm}km.tcx`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const activities = await prisma.activity.findMany({
    include: { laps: { orderBy: { lapNumber: 'asc' } } },
    orderBy: { startedAt: 'asc' },
  })

  if (activities.length === 0) {
    console.error('No activities found. Run `npx prisma db seed` first.')
    process.exit(1)
  }

  console.log(`Exporting ${activities.length} activities to ${OUT_DIR}\n`)

  const parser = new XMLParser({ ignoreAttributes: false })
  let success = 0
  let failures = 0

  for (const activity of activities) {
    const filename = tcxFilename(activity)
    const filepath = path.join(OUT_DIR, filename)

    try {
      const xml = buildTcx(activity)

      // Validate that the XML is well-formed before writing
      parser.parse(xml)

      fs.writeFileSync(filepath, xml, 'utf8')

      const relPath = `generated-training-data/tcx/${filename}`
      await prisma.activity.update({
        where: { id: activity.id },
        data: { tcxPath: relPath },
      })

      console.log(`  ✓  ${filename}`)
      success++
    } catch (err) {
      console.error(`  ✗  ${filename}: ${err}`)
      failures++
    }
  }

  console.log(`\nExported ${success}/${activities.length} TCX files to generated-training-data/tcx/`)
  if (failures > 0) {
    console.error(`${failures} file(s) failed`)
    process.exit(1)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
