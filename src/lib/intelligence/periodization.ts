// ─── Periodization-aware training phase detector ──────────────────────────────
//
// Classifies the current training phase from five signals:
//   1. Days until goal race  — macro periodization anchor
//   2. Recent load trajectory — are we loading, holding, or unloading?
//   3. Load vs prior 3-week average — sudden drops signal recovery
//   4. Quality session count — intensity frequency indicates BUILD/PEAK
//   5. Injury-risk category + TSB — high-risk with negative TSB forces RECOVERY
//
// Rules are evaluated in order; first match wins.
// RECOVERY → TAPER → PEAK → BUILD → BASE → default BASE
//
// Rationale for this ordering:
//   RECOVERY overrides everything — an athlete spiking load or showing injury
//   signals needs rest regardless of where they are on the calendar.
//   TAPER is calendar-anchored near race day (overrides BUILD/PEAK).
//   PEAK and BUILD are calendar-bounded windows.
//   BASE is the catch-all for everything else.

import type { TrainingPhase } from '../schemas/enums'
import type { TrainingLoadResult } from './training-load'
import type { InjuryRiskResult } from './injury-risk'

// ─── Input types ──────────────────────────────────────────────────────────────

// Extended weekly summary — compatible with Prisma WeeklyTrainingSummary records.
// Includes the CTL/ATL/TSB snapshots stored at the end of each week, which
// allow the phase detector to observe load-fitness trends without recomputing
// the full EMA from scratch.
export interface PeriodizationWeeklySummary {
  weekNumber:          number
  weekStartDate:       Date
  totalLoad:           number
  qualitySessionCount: number
  ctl:                 number
  atl:                 number
  tsb:                 number
  acwr:                number
  trainingPhase?:      TrainingPhase  // stored phase from seed (for display only)
}

// Minimal activity shape needed by phase detector.
// Full classification results are not required — workoutType + date suffice.
export interface ClassifiedActivitySummary {
  startedAt:   Date
  workoutType: string  // WorkoutType value
  trainingLoad: number
}

export interface PeriodizationInput {
  goalRaceDate:        Date
  weeklySummaries:     PeriodizationWeeklySummary[]
  currentInjuryRisk:   InjuryRiskResult
  currentTrainingLoad: TrainingLoadResult
  recentActivities:    ClassifiedActivitySummary[]
  referenceDate?:      Date  // defaults to today; override for testing
}

// ─── Output type ──────────────────────────────────────────────────────────────

export interface PeriodizationResult {
  phase:               TrainingPhase
  confidence:          'high' | 'medium' | 'low'
  primaryReason:       string
  supportingSignals:   string[]
  coachingImplication: string
  daysUntilRace:       number
  weeksUntilRace:      number
}

// ─── Threshold constants ──────────────────────────────────────────────────────

const RECOVERY_LOAD_THRESHOLD    = 0.60  // < 60% of prior 3-week avg
const RECOVERY_HIGH_RISK_TSB     = -15   // TSB floor for high-risk injury check
const TAPER_DAYS_MAX             = 21    // ≤ 21 days out → taper window
const TAPER_QUALITY_MAX          = 2     // ≤ 2 quality sessions in taper
const PEAK_DAYS_MIN              = 22    // ≥ 22 days out
const PEAK_DAYS_MAX              = 42    // ≤ 42 days out
const PEAK_LOAD_FRACTION         = 0.85  // ≥ 85% of recent max load
const PEAK_QUALITY_MIN           = 3     // ≥ 3 quality sessions
const BUILD_DAYS_MIN             = 43    // ≥ 43 days out
const BUILD_DAYS_MAX             = 70    // ≤ 70 days out
const BUILD_QUALITY_MIN          = 2     // ≥ 2 quality sessions
const BASE_DAYS_MIN              = 70    // > 70 days out → BASE anchor

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r0(n: number): number { return Math.round(n) }

function daysUntil(target: Date, ref: Date): number {
  return Math.max(0, Math.round((target.getTime() - ref.getTime()) / 86_400_000))
}

function r1(n: number): number { return Math.round(n * 10) / 10 }

// ─── Phase builders ───────────────────────────────────────────────────────────
// Each builder returns a complete PeriodizationResult for its phase.

function recovery(
  days: number,
  weeks: number,
  currentLoad: number,
  prior3Avg: number,
  tsb: number,
  injuryCategory: string,
): PeriodizationResult {
  const isLoadDrop  = prior3Avg > 0 && currentLoad < prior3Avg * RECOVERY_LOAD_THRESHOLD
  const dropPct     = prior3Avg > 0 ? r0((1 - currentLoad / prior3Avg) * 100) : 0
  const isInjuryDriven = injuryCategory === 'high-risk'

  const reason = isLoadDrop
    ? `Weekly load (${r0(currentLoad)} TRIMP) is ${dropPct}% below the 3-week average (${r0(prior3Avg)} TRIMP) — a load drop exceeding the 40% recovery threshold.`
    : `Training-load spike signal (${injuryCategory}) combined with sustained negative TSB (${r1(tsb)}) indicates the body needs unplanned recovery.`

  const signals: string[] = [
    `Current load: ${r0(currentLoad)} TRIMP (3-week avg: ${r0(prior3Avg)} TRIMP)`,
    `TSB: ${r1(tsb)} (${tsb < -20 ? 'high fatigue' : tsb < 0 ? 'moderate fatigue' : 'recovering'})`,
  ]
  if (isInjuryDriven) signals.push(`Injury-risk category: ${injuryCategory}`)
  if (days > 0) signals.push(`Days until race: ${days} (${weeks} weeks)`)

  return {
    phase: 'RECOVERY',
    confidence: isLoadDrop && Math.abs(tsb) < 10 ? 'medium' : 'high',
    primaryReason: reason,
    supportingSignals: signals,
    coachingImplication: (injuryCategory === 'high-risk' || injuryCategory === 'caution')
      ? 'Load spike detected — prioritize recovery this week before adding volume.'
      : 'Planned recovery phase — trust the process, your fitness is preserved.',
    daysUntilRace: days,
    weeksUntilRace: weeks,
  }
}

function taper(
  days: number,
  weeks: number,
  currentLoad: number,
  prevLoad: number,
  qualityCount: number,
  tsb: number,
): PeriodizationResult {
  return {
    phase: 'TAPER',
    confidence: 'high',
    primaryReason:
      `Race is ${days} days away. Load is reducing (${r0(currentLoad)} vs ${r0(prevLoad)} TRIMP last week) — taper phase confirmed.`,
    supportingSignals: [
      `Days until race: ${days} (${weeks} weeks)`,
      `Load delta: −${r0(prevLoad - currentLoad)} TRIMP week-over-week`,
      `Quality sessions this week: ${qualityCount} (≤ ${TAPER_QUALITY_MAX} expected in taper)`,
      `TSB: ${r1(tsb)} (${tsb > 0 ? 'fresh' : tsb > -10 ? 'near-neutral' : 'still building freshness'})`,
    ],
    coachingImplication:
      'Reduce volume but preserve race sharpness with short, race-pace efforts 2–3 times this week. Trust the taper.',
    daysUntilRace: days,
    weeksUntilRace: weeks,
  }
}

function peak(
  days: number,
  weeks: number,
  currentLoad: number,
  recentMaxLoad: number,
  qualityCount: number,
  ctl: number,
): PeriodizationResult {
  const loadPct = recentMaxLoad > 0 ? r0((currentLoad / recentMaxLoad) * 100) : 100
  return {
    phase: 'PEAK',
    confidence: 'high',
    primaryReason:
      `Race is ${days} days away. Current load (${r0(currentLoad)} TRIMP) is ${loadPct}% of recent peak with ${qualityCount} quality sessions — peak-block density confirmed.`,
    supportingSignals: [
      `Days until race: ${days} (${weeks} weeks)`,
      `Load at ${loadPct}% of recent maximum (${r0(recentMaxLoad)} TRIMP)`,
      `Quality sessions: ${qualityCount} (≥ ${PEAK_QUALITY_MIN} expected in peak)`,
      `CTL: ${r1(ctl)} (fitness level)`,
    ],
    coachingImplication:
      'Maintain quality session density but protect recovery. Race-specificity is the priority now.',
    daysUntilRace: days,
    weeksUntilRace: weeks,
  }
}

function build(
  days: number,
  weeks: number,
  recentLoads: number[],
  qualityCount: number,
  ctl: number,
): PeriodizationResult {
  const trendStr = recentLoads.map(r0).join(' → ')
  return {
    phase: 'BUILD',
    confidence: 'high',
    primaryReason:
      `Race is ${days} days away. Load trending upward (${trendStr} TRIMP) with ${qualityCount} quality sessions — progressive build phase confirmed.`,
    supportingSignals: [
      `Days until race: ${days} (${weeks} weeks)`,
      `Load trend (last 3 weeks): ${trendStr} TRIMP`,
      `Quality sessions: ${qualityCount} (≥ ${BUILD_QUALITY_MIN} expected in build)`,
      `CTL: ${r1(ctl)} — fitness building`,
    ],
    coachingImplication:
      'Continue progressive overload with 2–3 quality sessions per week. Build race confidence through tempo consistency and long-run progression.',
    daysUntilRace: days,
    weeksUntilRace: weeks,
  }
}

function base(
  days: number,
  weeks: number,
  currentLoad: number,
  prior3Avg: number,
  qualityCount: number,
  ctl: number,
  isCalendarBased: boolean,
): PeriodizationResult {
  const reason = isCalendarBased
    ? `Race is ${days} days away (${weeks} weeks) — well outside the peak build window (>10 weeks).`
    : `Load is consistent (${r0(currentLoad)} TRIMP vs ${r0(prior3Avg)} TRIMP avg) with ${qualityCount} quality session(s) per week — foundational aerobic phase.`

  return {
    phase: 'BASE',
    confidence: isCalendarBased ? 'high' : 'medium',
    primaryReason: reason,
    supportingSignals: [
      `Days until race: ${days} (${weeks} weeks)`,
      `Weekly load: ${r0(currentLoad)} TRIMP (3-week avg: ${r0(prior3Avg)} TRIMP)`,
      `Quality sessions: ${qualityCount}`,
      `CTL: ${r1(ctl)} — aerobic base`,
    ],
    coachingImplication:
      'Focus on aerobic base development and consistent volume. Keep easy runs truly easy, add volume gradually, and introduce quality work only when ready.',
    daysUntilRace: days,
    weeksUntilRace: weeks,
  }
}

// ─── Main detector ────────────────────────────────────────────────────────────

export function detectTrainingPhase(input: PeriodizationInput): PeriodizationResult {
  const ref  = input.referenceDate ?? new Date()
  const days = daysUntil(input.goalRaceDate, ref)
  const weeks = r1(days / 7)

  // ── Sort summaries and extract recent window ───────────────────────────────
  const sorted  = [...input.weeklySummaries].sort((a, b) => a.weekNumber - b.weekNumber)
  const last4   = sorted.slice(-4)
  const current = last4[last4.length - 1]
  const prior3  = last4.slice(0, 3)

  const currentLoad = current?.totalLoad ?? 0
  const prior3Avg   = prior3.length > 0
    ? prior3.reduce((s, w) => s + w.totalLoad, 0) / prior3.length
    : currentLoad
  const currentQuality = current?.qualitySessionCount ?? 0
  const currentCTL     = input.currentTrainingLoad.ctl
  const tsb            = input.currentTrainingLoad.tsb
  const injuryCategory = input.currentInjuryRisk.category

  // ── Rule 1: RECOVERY ──────────────────────────────────────────────────────
  //
  // Two paths to recovery:
  //   A) Load dropped more than 40% vs recent average — could be planned or
  //      forced; either way, treat as recovery.
  //   B) High-risk injury signal combined with sustained negative TSB —
  //      unplanned recovery indicated.
  //
  // Rule 1 intentionally fires before any calendar-based rules. A load crash or
  // injury signal overrides everything else.
  const loadDropped        = prior3Avg > 0 && currentLoad < prior3Avg * RECOVERY_LOAD_THRESHOLD
  const highRiskNegativeTsb =
    injuryCategory === 'high-risk' && tsb < RECOVERY_HIGH_RISK_TSB

  if (loadDropped || highRiskNegativeTsb) {
    return recovery(days, weeks, currentLoad, prior3Avg, tsb, injuryCategory)
  }

  // ── Rule 2: TAPER ─────────────────────────────────────────────────────────
  //
  // Calendar-anchored: race within 3 weeks AND intentional load reduction AND
  // low quality session count (sharpening, not building).
  const prevWeekLoad  = prior3[prior3.length - 1]?.totalLoad ?? currentLoad
  const loadDecreasing = currentLoad < prevWeekLoad

  if (days <= TAPER_DAYS_MAX && loadDecreasing && currentQuality <= TAPER_QUALITY_MAX) {
    return taper(days, weeks, currentLoad, prevWeekLoad, currentQuality, tsb)
  }

  // ── Rule 3: PEAK ──────────────────────────────────────────────────────────
  //
  // Calendar window: 22–42 days out. Load near recent maximum (high density)
  // AND high quality session frequency (race-specificity).
  const recentMaxLoad = Math.max(...last4.map(w => w.totalLoad), 1)
  const nearRecentMax = currentLoad >= recentMaxLoad * PEAK_LOAD_FRACTION

  if (
    days >= PEAK_DAYS_MIN &&
    days <= PEAK_DAYS_MAX &&
    nearRecentMax &&
    currentQuality >= PEAK_QUALITY_MIN
  ) {
    return peak(days, weeks, currentLoad, recentMaxLoad, currentQuality, currentCTL)
  }

  // ── Rule 4: BUILD ─────────────────────────────────────────────────────────
  //
  // Calendar window: 43–70 days out. Progressive load increase over 3 weeks
  // AND quality session frequency ≥ 2 per week (adding intensity).
  const trend3 = last4.slice(-3).map(w => w.totalLoad)
  const loadTrendingUp =
    trend3.length >= 3 &&
    trend3[2] > trend3[0]  // current week load > 2 weeks ago

  if (
    days >= BUILD_DAYS_MIN &&
    days <= BUILD_DAYS_MAX &&
    loadTrendingUp &&
    currentQuality >= BUILD_QUALITY_MIN
  ) {
    return build(days, weeks, trend3, currentQuality, currentCTL)
  }

  // ── Rule 5 & Default: BASE ────────────────────────────────────────────────
  //
  // Race is far away (> 10 weeks) OR load pattern shows consistent low-intensity
  // foundational work with minimal quality sessions.
  const isCalendarBased = days > BASE_DAYS_MIN
  return base(days, weeks, currentLoad, prior3Avg, currentQuality, currentCTL, isCalendarBased)
}
