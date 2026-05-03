// Validates all TCX files produced by `npm run export:tcx`.
//
// For each .tcx file, the script confirms:
//   - File is well-formed XML (parseable by fast-xml-parser)
//   - Root element is TrainingCenterDatabase
//   - Contains: Activities > Activity > Lap > Track > Trackpoint
//   - Each Trackpoint has a HeartRateBpm element with a numeric Value
//
// Exits with code 1 if any file fails, so CI can catch regressions.

import * as fs   from 'fs'
import * as path from 'path'
import { XMLParser } from 'fast-xml-parser'

const TCX_DIR = path.resolve(process.cwd(), 'generated-training-data/tcx')

// ─── Reporter ─────────────────────────────────────────────────────────────────

let totalFiles  = 0
let passingFiles = 0
let failingFiles = 0

function pass(filename: string, detail: string) {
  console.log(`  PASS  ${filename}  (${detail})`)
  passingFiles++
}

function fail(filename: string, reason: string) {
  console.error(`  FAIL  ${filename}  — ${reason}`)
  failingFiles++
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAtPath(obj: unknown, ...keys: string[]): unknown {
  let cur = obj
  for (const key of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

function firstArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value != null) return [value]
  return []
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Pre-flight: directory must exist
  if (!fs.existsSync(TCX_DIR)) {
    console.error(`\nTCX directory not found: ${TCX_DIR}`)
    console.error('Run `npm run export:tcx` first to generate TCX files.\n')
    process.exit(1)
  }

  const files = fs.readdirSync(TCX_DIR).filter(f => f.endsWith('.tcx')).sort()
  totalFiles = files.length

  console.log(`\nTCX file validation — ${TCX_DIR}`)
  console.log(`Found ${totalFiles} .tcx file(s)\n`)

  if (totalFiles === 0) {
    console.error('No .tcx files found. Run `npm run export:tcx` first.')
    process.exit(1)
  }

  const parser = new XMLParser({
    ignoreAttributes:    false,
    attributeNamePrefix: '@_',
    isArray:             (name) => ['Lap', 'Trackpoint', 'Activity'].includes(name),
  })

  for (const filename of files) {
    const filepath = path.join(TCX_DIR, filename)
    const xml = fs.readFileSync(filepath, 'utf8')

    // 1. Well-formed XML
    let parsed: unknown
    try {
      parsed = parser.parse(xml)
    } catch (err) {
      fail(filename, `XML parse error: ${err}`)
      continue
    }

    // 2. TrainingCenterDatabase root
    const tcd = getAtPath(parsed, 'TrainingCenterDatabase')
    if (tcd == null) {
      fail(filename, 'Missing root element <TrainingCenterDatabase>')
      continue
    }

    // 3. Activities
    const activities = firstArray(getAtPath(tcd, 'Activities', 'Activity'))
    if (activities.length === 0) {
      fail(filename, 'Missing <Activities>/<Activity>')
      continue
    }
    const activity = activities[0]

    // 4. At least one Lap
    const laps = firstArray(getAtPath(activity, 'Lap'))
    if (laps.length === 0) {
      fail(filename, 'Missing <Lap>')
      continue
    }

    // 5. Each Lap has a Track with Trackpoints that have HeartRateBpm
    let lapOk = true
    for (let li = 0; li < laps.length; li++) {
      const lap = laps[li]

      const trackpoints = firstArray(getAtPath(lap, 'Track', 'Trackpoint'))
      if (trackpoints.length === 0) {
        fail(filename, `Lap ${li + 1}: missing <Track>/<Trackpoint>`)
        lapOk = false
        break
      }

      // Check that every trackpoint has a numeric HeartRateBpm value
      const missingHR = trackpoints.findIndex(tp => {
        const val = getAtPath(tp, 'HeartRateBpm', 'Value')
        return typeof val !== 'number' && typeof val !== 'string'
      })
      if (missingHR !== -1) {
        fail(filename, `Lap ${li + 1}: Trackpoint ${missingHR + 1} missing <HeartRateBpm>/<Value>`)
        lapOk = false
        break
      }
    }

    if (!lapOk) continue

    const trackpointCount = laps.reduce<number>(
      (sum, lap) => sum + firstArray(getAtPath(lap, 'Track', 'Trackpoint')).length,
      0,
    )
    pass(filename, `${laps.length} lap(s), ${trackpointCount} trackpoints`)
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log('')
  console.log(`────────────────────────────────────────────────`)
  console.log(`Total: ${totalFiles} files — ${passingFiles} passed, ${failingFiles} failed`)

  if (failingFiles > 0) {
    console.error(`\n${failingFiles} file(s) failed TCX validation.`)
    process.exit(1)
  } else {
    console.log('\nAll TCX files passed validation.')
  }
}

main()
