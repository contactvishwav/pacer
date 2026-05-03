// ─── ACWR injury-risk forecasting engine ──────────────────────────────────────
//
// Uses the Gabbett ratio (acute weekly load ÷ rolling 4-week chronic average)
// for training-load spike detection.
//
// Why Gabbett here instead of ATL/CTL (see training-load.ts):
//   The Gabbett formula compares "what I did this week" to "what I normally
//   do per week" — both values are at the same weekly scale. ATL/CTL compares
//   a 7-day EMA to a 42-day EMA; during an active build phase ATL consistently
//   exceeds CTL, so the ratio stays above 1.0 throughout most of a training
//   block. That makes ATL/CTL a useful fitness/fatigue tracker but a noisy
//   spike detector. Gabbett detects the specific event (a sudden load jump
//   above an established chronic baseline) that correlates with workload spikes.
//
// ACWR thresholds are inspired by commonly cited workload-monitoring ranges
// in sports-science literature (see Gabbett 2016, Hulin et al 2016) and are
// used here as coaching heuristics, not medical predictions.
//
// Language rules (AGENT_GUIDELINES §Injury-risk language):
//   Use: "risk signal", "training-load spike", "caution range", "higher-risk pattern".
//   Never: medical claims, injury probability statistics, "2-4x injury risk", etc.

import type { ActivityWithLoad } from './training-load'

// ─── Input types ──────────────────────────────────────────────────────────────

// Minimal weekly summary shape required by this engine.
// Compatible with WeeklySummaryData (generate-training-plan.ts) and Prisma
// WeeklyTrainingSummary records — optional fields degrade gracefully.
export interface WeeklyTrainingSummaryData {
  weekStartDate: Date
  weekNumber: number
  totalLoad: number
  activityCount?: number
  qualitySessionCount?: number
  longRunDistanceMeters?: number | null
}

// ─── Output types ─────────────────────────────────────────────────────────────

export type InjuryRiskCategory =
  | 'insufficient-data' // fewer than 4 complete prior weeks
  | 'underload'         // ACWR < 0.8 — load below chronic baseline (recovery/taper)
  | 'optimal'           // 0.8 ≤ ACWR ≤ 1.3 — well-managed stimulus
  | 'caution'           // 1.3 < ACWR ≤ 1.5 — training-load spike detected
  | 'high-risk'         // ACWR > 1.5 — significant higher-risk pattern

export type InjuryRiskConfidence = 'high' | 'medium' | 'low'

export interface InjuryRiskResult {
  acwr: number | null
  category: InjuryRiskCategory
  confidence: InjuryRiskConfidence
  explanation: string
  contributingFactors: string[]
  recommendedAction: string
  weeklyLoadTrend: number[]  // chronological load totals for the last 6 weeks
  acwrHistory: number[]      // Gabbett ACWR for the last 6 weeks (0 = insufficient data)
}

// ─── Threshold constants ──────────────────────────────────────────────────────
//
// These ranges are broadly consistent with thresholds cited in workload-
// monitoring literature. They are coaching heuristics, not clinical values.

const ACWR_UNDERLOAD  = 0.8
const ACWR_CAUTION    = 1.3
const ACWR_HIGH_RISK  = 1.5
const MIN_PRIOR_WEEKS = 4 // Gabbett standard: need 4 complete prior weeks

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDayUTC(d: Date): Date {
  const r = new Date(d)
  r.setUTCHours(0, 0, 0, 0)
  return r
}

function r3(n: number): number { return Math.round(n * 1000) / 1000 }
function r0(n: number): number { return Math.round(n) }

// ─── getAcwrCategory ──────────────────────────────────────────────────────────

export function getAcwrCategory(acwr: number): InjuryRiskCategory {
  if (acwr < ACWR_UNDERLOAD)  return 'underload'
  if (acwr <= ACWR_CAUTION)   return 'optimal'
  if (acwr <= ACWR_HIGH_RISK) return 'caution'
  return 'high-risk'
}

// ─── computeInjuryRisk ────────────────────────────────────────────────────────
//
// Gabbett ACWR formula:
//   acute  = sum of trainingLoad for all activities in the current calendar week
//   chronic = average weekly totalLoad for the 4 complete weeks immediately
//             preceding the current week (from weeklySummaries)
//   ACWR   = acute / chronic
//
// "Current week" is determined by finding the weekly summary whose date range
// contains the most recent activity. This aligns the acute and chronic windows
// to the same calendar-week granularity — the same approach the seed uses when
// populating WeeklyTrainingSummary.acwr.
//
// ACWR is null when fewer than 4 prior complete weeks exist in weeklySummaries.
// Return category 'insufficient-data' in that case rather than a noisy ratio.

export function computeInjuryRisk(
  activities: ActivityWithLoad[],
  weeklySummaries: WeeklyTrainingSummaryData[],
): InjuryRiskResult {
  if (activities.length === 0 || weeklySummaries.length === 0) {
    return insufficientResult([], [])
  }

  const sortedSummaries = [...weeklySummaries].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  )

  // ── History arrays for the last 6 weeks (computed before anything else) ──
  const last6 = sortedSummaries.slice(-6)
  const weeklyLoadTrend = last6.map(s => r0(s.totalLoad))
  const acwrHistory = last6.map(s => {
    const prior = sortedSummaries
      .filter(w => w.weekNumber < s.weekNumber)
      .slice(-MIN_PRIOR_WEEKS)
    if (prior.length < MIN_PRIOR_WEEKS) return 0
    const chronic = prior.reduce((sum, w) => sum + w.totalLoad, 0) / MIN_PRIOR_WEEKS
    return chronic > 0 ? r3(s.totalLoad / chronic) : 0
  })

  // ── Find the current week ─────────────────────────────────────────────────
  //
  // "Current week" = the weekly summary whose Monday–Sunday window contains
  // the most recent activity's date.
  const sorted = [...activities].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
  )
  const refDate = startOfDayUTC(sorted[sorted.length - 1].startedAt)

  const currentSummary = sortedSummaries.find(s => {
    const weekStart = startOfDayUTC(s.weekStartDate)
    const weekEnd   = new Date(weekStart)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
    return refDate >= weekStart && refDate <= weekEnd
  })

  if (!currentSummary) {
    // Fallback: athlete hasn't completed the current week yet — estimate acute
    // load from activities in the trailing 7 days from the last activity date.
    const sevenDaysAgo = new Date(refDate.getTime() - 7 * 86_400_000)
    const recentActs   = activities.filter(a => startOfDayUTC(a.startedAt) >= sevenDaysAgo)
    const acuteLoad    = recentActs.reduce((s, a) => s + a.trainingLoad, 0)

    const priorWeeks = sortedSummaries.slice(-MIN_PRIOR_WEEKS)
    if (priorWeeks.length < MIN_PRIOR_WEEKS) {
      return { ...insufficientResult(weeklyLoadTrend, acwrHistory), confidence: 'low' }
    }

    const chronicLoad = priorWeeks.reduce((s, w) => s + w.totalLoad, 0) / MIN_PRIOR_WEEKS
    const acwr = chronicLoad > 0 ? r3(acuteLoad / chronicLoad) : null
    if (acwr === null) {
      return { ...insufficientResult(weeklyLoadTrend, acwrHistory), confidence: 'medium' }
    }

    const category = getAcwrCategory(acwr)
    return {
      acwr,
      category,
      confidence: 'medium',
      explanation: buildExplanation(acwr, category, acuteLoad, chronicLoad),
      contributingFactors: [
        'Current week is incomplete — acute load estimated from last 7 days',
        `Estimated acute load: ${r0(acuteLoad)} TRIMP from ${recentActs.length} session(s)`,
      ],
      recommendedAction: buildRecommendation(category),
      weeklyLoadTrend,
      acwrHistory,
    }
  }

  // ── Acute load: activities in the current calendar week ───────────────────
  const weekStart = startOfDayUTC(currentSummary.weekStartDate)
  const weekEnd   = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
  weekEnd.setUTCHours(23, 59, 59, 999)

  const acuteActivities = activities.filter(
    a => a.startedAt >= weekStart && a.startedAt <= weekEnd,
  )
  const acuteLoad = acuteActivities.reduce((s, a) => s + a.trainingLoad, 0)

  // ── Chronic load: average of the 4 most recent prior complete weeks ───────
  const priorWeeks = sortedSummaries
    .filter(s => s.weekNumber < currentSummary.weekNumber)
    .slice(-MIN_PRIOR_WEEKS)

  // ── Confidence and data sufficiency ───────────────────────────────────────
  const confidence: InjuryRiskConfidence =
    priorWeeks.length === MIN_PRIOR_WEEKS ? 'high' :
    priorWeeks.length >= 2               ? 'medium' :
    'low'

  if (priorWeeks.length < MIN_PRIOR_WEEKS) {
    return { ...insufficientResult(weeklyLoadTrend, acwrHistory), confidence }
  }

  const chronicLoad =
    priorWeeks.reduce((s, w) => s + w.totalLoad, 0) / MIN_PRIOR_WEEKS
  const acwr = chronicLoad > 0 ? r3(acuteLoad / chronicLoad) : null

  if (acwr === null) {
    return { ...insufficientResult(weeklyLoadTrend, acwrHistory), confidence }
  }

  // ── Category ──────────────────────────────────────────────────────────────
  const category = getAcwrCategory(acwr)

  // ── Contributing factors ──────────────────────────────────────────────────
  const factors: string[] = []

  const pct = Math.round(Math.abs(acwr - 1) * 100)
  if (acwr > 1.0) {
    factors.push(
      `Acute load (${r0(acuteLoad)} TRIMP) is ${pct}% above the 4-week average (${r0(chronicLoad)} TRIMP)`,
    )
  } else {
    factors.push(
      `Acute load (${r0(acuteLoad)} TRIMP) is ${pct}% below the 4-week average (${r0(chronicLoad)} TRIMP)`,
    )
  }

  if (acuteActivities.length > 0) {
    factors.push(`${acuteActivities.length} session(s) in the current week`)
  }

  const qualityCount = currentSummary.qualitySessionCount ?? 0
  if (qualityCount > 0) {
    factors.push(
      `${qualityCount} quality session(s) (tempo / threshold / interval) this week`,
    )
  }

  const longRunM = currentSummary.longRunDistanceMeters ?? 0
  if (longRunM > 14000) {
    factors.push(
      `Long run of ${Math.round(longRunM / 1000)} km this week — higher load contribution`,
    )
  }

  // ── Explanation and recommendation ────────────────────────────────────────
  const explanation     = buildExplanation(acwr, category, acuteLoad, chronicLoad)
  const recommendedAction = buildRecommendation(category)

  return {
    acwr,
    category,
    confidence,
    explanation,
    contributingFactors: factors,
    recommendedAction,
    weeklyLoadTrend,
    acwrHistory,
  }
}

// ─── Explanation builder ──────────────────────────────────────────────────────

function buildExplanation(
  acwr: number,
  category: InjuryRiskCategory,
  acuteLoad: number,
  chronicLoad: number,
): string {
  const ratio = acwr.toFixed(2)
  switch (category) {
    case 'underload':
      return (
        `ACWR ${ratio} — training load this week (${r0(acuteLoad)} TRIMP) is below ` +
        `the 4-week average (${r0(chronicLoad)} TRIMP). ` +
        `This is the expected pattern during a recovery or taper week.`
      )
    case 'optimal':
      return (
        `ACWR ${ratio} is within the optimal training range (0.8–1.3). ` +
        `Acute and chronic loads are well-matched — the weekly stimulus is ` +
        `appropriate for adaptation without overreach.`
      )
    case 'caution':
      return (
        `ACWR ${ratio} is in the caution range — a training-load spike signal is detected. ` +
        `This week's load (${r0(acuteLoad)} TRIMP) is significantly above ` +
        `the 4-week average (${r0(chronicLoad)} TRIMP). Monitor fatigue closely.`
      )
    case 'high-risk':
      return (
        `ACWR ${ratio} reflects a significant training-load spike — a higher-risk pattern. ` +
        `This week's load (${r0(acuteLoad)} TRIMP) is substantially above ` +
        `the 4-week chronic baseline (${r0(chronicLoad)} TRIMP).`
      )
    default:
      return 'Insufficient training history to compute a workload risk signal.'
  }
}

// ─── Recommendation builder ───────────────────────────────────────────────────

function buildRecommendation(category: InjuryRiskCategory): string {
  switch (category) {
    case 'underload':
      return 'Maintain or gradually increase load to rebuild fitness momentum.'
    case 'optimal':
      return 'Load is well-managed. Maintain this pattern heading into next week.'
    case 'caution':
      return (
        'Consider reducing volume or intensity for the next 3–5 days to manage ' +
        'this training-load spike before resuming full training.'
      )
    case 'high-risk':
      return (
        'This training-load spike warrants a rest day followed by a reduced-load week. ' +
        'Reassess session count and intensity for the next 5–7 days.'
      )
    case 'insufficient-data':
      return (
        'Continue building your training history — the workload risk signal ' +
        'becomes available after 4 complete weeks of data.'
      )
  }
}

// ─── Insufficient-data fallback ───────────────────────────────────────────────

function insufficientResult(
  weeklyLoadTrend: number[],
  acwrHistory: number[],
): InjuryRiskResult {
  return {
    acwr: null,
    category: 'insufficient-data',
    confidence: 'low',
    explanation:
      'Fewer than 4 complete weeks of training history available. ' +
      'A stable 4-week chronic baseline is required before the ACWR risk signal is meaningful.',
    contributingFactors: [],
    recommendedAction:
      'Continue building your training history — the workload risk signal ' +
      'becomes available after 4 complete weeks of data.',
    weeklyLoadTrend,
    acwrHistory,
  }
}
