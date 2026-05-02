// ─── Training load engine ─────────────────────────────────────────────────────
//
// Computes the standard Performance Management Chart (PMC) metrics from a
// sequence of activities. All formulas are transparent heuristics derived from
// Banister (1975) and Coggan's PMC model. These are established running-science
// approximations, not clinical guarantees.
//
// Consumers: ACWR injury-risk signal, weekly coaching brief, race prediction
// (fatigue adjustment), periodization phase detector, coach context builder.

// ─── Input / output types ─────────────────────────────────────────────────────

// Minimal shape required by computeTrainingLoad.
// Compatible with Prisma Activity records — any object with these two
// fields can be passed in directly.
export interface ActivityWithLoad {
  startedAt: Date
  trainingLoad: number
}

export interface TrainingLoadResult {
  atl: number          // Acute Training Load — 7-day exponential moving average
  ctl: number          // Chronic Training Load — 42-day exponential moving average
  tsb: number          // Training Stress Balance — CTL minus ATL (positive = fresh)
  acwr: number | null  // ATL ÷ CTL — null when < 28 days of history
  weeklyLoad: number   // Raw sum of trainingLoad in the trailing 7-day window
  trend: 'improving' | 'maintaining' | 'declining'
  explanation: string  // Plain-English state summary for coach context
}

// ─── EMA decay constants ──────────────────────────────────────────────────────
//
// The exponential moving average (EMA) for each day is:
//   EMA_today = EMA_yesterday × k + load_today × (1 − k)
//
// The decay factor k = e^(−1/τ) where τ is the time constant in days.
// A smaller k means faster decay (more weight on recent days).
//
// 7-day time constant (ATL):
//   k ≈ 0.8669 — each day, yesterday's contribution shrinks by ~13%.
//   After 7 days, the weight of a single past day is e^(−1) ≈ 37% of its
//   original value. ATL reacts quickly to load changes — it tracks acute
//   fatigue and day-to-day readiness.
//
// 42-day time constant (CTL):
//   k ≈ 0.9765 — each day, yesterday's contribution shrinks by ~2.4%.
//   CTL is a slow-moving fitness signal. It takes weeks of consistent
//   training to move it significantly up or down. This mirrors how long
//   physiological adaptations (aerobic base, mitochondrial density) take
//   to build or decay.
//
// The 7/42 pairing is standard in triathlon and running coaching software
// (TrainingPeaks, Garmin Connect, WKO). It was originally validated on
// competitive cyclists and has been widely adopted for running since Coggan
// and Allen's work in the early 2000s.
const K_ATL = Math.exp(-1 / 7)   // ≈ 0.8669
const K_CTL = Math.exp(-1 / 42)  // ≈ 0.9765

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  // "YYYY-MM-DD" in UTC — used as the daily load map key
  return d.toISOString().slice(0, 10)
}

function startOfDayUTC(d: Date): Date {
  const r = new Date(d)
  r.setUTCHours(0, 0, 0, 0)
  return r
}

function daysBetween(a: Date, b: Date): number {
  // Returns the number of whole calendar days between two UTC midnight dates
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

// ─── Rounding helpers ─────────────────────────────────────────────────────────

function r1(n: number) { return Math.round(n * 10) / 10 }
function r2(n: number) { return Math.round(n * 100) / 100 }
function r3(n: number) { return Math.round(n * 1000) / 1000 }

// ─── Banister TRIMP estimator ─────────────────────────────────────────────────

/**
 * Estimates training load (TRIMP) when activity.trainingLoad is not stored.
 *
 * Formula: TRIMP = duration_min × HRR × 0.64 × e^(1.92 × HRR)
 *   HRR = (avgHR − restingHR) / (maxHR − restingHR)   — Heart Rate Reserve fraction
 *
 * The exponential weight (0.64 × e^1.92HRR) makes high-intensity work
 * disproportionately heavier than easy work, reflecting the physiological
 * cost of lactate accumulation above the aerobic threshold. At HRR = 0.65
 * (easy aerobic), the multiplier ≈ 1.43. At HRR = 0.90 (threshold), ≈ 3.34.
 *
 * Source: Banister et al. (1975), revised Morton et al. (1990).
 * This is a heuristic approximation — not a clinical measurement.
 */
export function estimateTrainingLoad(
  durationMinutes: number,
  avgHR: number,
  restingHR: number,
  maxHR: number,
): number {
  const hrRange = maxHR - restingHR
  if (hrRange <= 0 || durationMinutes <= 0) return 0
  const hrr = Math.max(0, Math.min(1, (avgHR - restingHR) / hrRange))
  return durationMinutes * hrr * 0.64 * Math.exp(1.92 * hrr)
}

// ─── Explanation builder ──────────────────────────────────────────────────────

function buildExplanation(
  atl: number,
  ctl: number,
  tsb: number,
  acwr: number | null,
  trend: TrainingLoadResult['trend'],
  weeklyLoad: number,
): string {
  const parts: string[] = []

  // Fitness level (CTL magnitude)
  if (ctl < 20) {
    parts.push(`Fitness is low (CTL ${r1(ctl)}) — still building base.`)
  } else if (ctl < 40) {
    parts.push(`Fitness is building (CTL ${r1(ctl)}).`)
  } else if (ctl < 60) {
    parts.push(`Good fitness level (CTL ${r1(ctl)}).`)
  } else {
    parts.push(`High fitness level (CTL ${r1(ctl)}) — well-conditioned for race.`)
  }

  // Fatigue / freshness (TSB sign and magnitude)
  if (tsb < -30) {
    parts.push(`High fatigue (TSB ${r1(tsb)}) — typical of peak training.`)
  } else if (tsb < -10) {
    parts.push(`Moderate fatigue (TSB ${r1(tsb)}) — normal during quality training.`)
  } else if (tsb < 5) {
    parts.push(`Near-neutral form (TSB ${r1(tsb)}).`)
  } else {
    parts.push(`Fresh and recovered (TSB ${r1(tsb)}) — good form for quality sessions.`)
  }

  // Trend direction
  if (trend === 'improving') {
    parts.push(`Fitness trend: improving.`)
  } else if (trend === 'declining') {
    parts.push(`Fitness trend: declining — taper or recovery phase.`)
  }

  // Injury-risk copy follows AGENT_GUIDELINES language rules:
  // "risk signal / training-load spike / caution range / higher-risk pattern"
  if (acwr === null) {
    parts.push(`Injury-risk signal: insufficient history (< 4 weeks).`)
  } else if (acwr > 1.3) {
    parts.push(
      `Training-load spike: ACWR ${r3(acwr)} is in the higher-risk range (>1.3). ` +
      `Monitor recovery closely.`,
    )
  } else if (acwr > 1.15) {
    parts.push(`ACWR ${r3(acwr)} is in the caution range — elevated but manageable.`)
  } else if (acwr < 0.7) {
    parts.push(`ACWR ${r3(acwr)} is low — recovery or taper phase.`)
  } else {
    parts.push(`ACWR ${r3(acwr)} is within the optimal range (0.8–1.3).`)
  }

  void weeklyLoad // weeklyLoad surfaced in the result, not repeated in explanation

  return parts.join(' ')
}

// ─── Main engine ──────────────────────────────────────────────────────────────

/**
 * Computes the current training load state from an array of activities.
 *
 * The EMA iterates day-by-day from the first activity to the last, so
 * rest-day decay is handled correctly (load = 0 on days with no activity).
 * Multiple activities on the same calendar day are summed.
 *
 * "Current" means as of the final activity date — not today's calendar date.
 * This keeps the function deterministic regardless of when it is called,
 * which matters for the demo seed where the reference date is fixed.
 *
 * The function reads activity.trainingLoad directly from the database record.
 * Use estimateTrainingLoad() only when trainingLoad is missing (e.g., for
 * activities imported from an external source without a stored load value).
 */
export function computeTrainingLoad(activities: ActivityWithLoad[]): TrainingLoadResult {
  if (activities.length === 0) {
    return {
      atl: 0, ctl: 0, tsb: 0,
      acwr: null, weeklyLoad: 0,
      trend: 'maintaining',
      explanation: 'No training data available.',
    }
  }

  // Sort ascending so we can walk forward through time
  const sorted = [...activities].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
  )

  // Sum all loads that fall on the same calendar day.
  // Multiple activities in one day (e.g., morning + evening run) are additive.
  const dailyLoad = new Map<string, number>()
  for (const act of sorted) {
    const key = toDateKey(act.startedAt)
    dailyLoad.set(key, (dailyLoad.get(key) ?? 0) + act.trainingLoad)
  }

  const firstDay  = startOfDayUTC(sorted[0].startedAt)
  const lastDay   = startOfDayUTC(sorted[sorted.length - 1].startedAt)
  const totalDays = daysBetween(firstDay, lastDay) + 1 // inclusive

  let atl = 0
  let ctl = 0
  let ctlMinus7 = 0 // CTL 7 days before the final day — used for trend

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(firstDay)
    d.setUTCDate(d.getUTCDate() + i)

    const load = dailyLoad.get(toDateKey(d)) ?? 0

    // One-day EMA update (Banister PMC formula):
    //   ATL_today = ATL_yesterday × k_ATL + load_today × (1 − k_ATL)
    //   CTL_today = CTL_yesterday × k_CTL + load_today × (1 − k_CTL)
    //
    // On rest days load = 0, so both EMAs simply decay.
    atl = atl * K_ATL + load * (1 - K_ATL)
    ctl = ctl * K_CTL + load * (1 - K_CTL)

    // Capture CTL 7 days before the last iteration for trend computation
    if (i === totalDays - 1 - 7) {
      ctlMinus7 = ctl
    }
  }

  const tsb = ctl - atl

  // ACWR = ATL / CTL.
  // Requires ≥ 28 days (4 weeks) because CTL (42-day EMA) hasn't converged
  // with fewer data points — the ratio would be artificially high and
  // would produce false spike signals. Return null instead of a misleading value.
  const acwr: number | null =
    totalDays >= 28 && ctl > 0 ? r3(atl / ctl) : null

  // Weekly load: raw sum of loads in the trailing 7-day window.
  // This is the unadjusted sum, not the EMA — useful for "what did I actually
  // do this week?" display alongside ATL/CTL.
  const weekCutoff = new Date(lastDay)
  weekCutoff.setUTCDate(weekCutoff.getUTCDate() - 6) // 7 days inclusive
  let weeklyLoad = 0
  for (const act of sorted) {
    if (startOfDayUTC(act.startedAt) >= weekCutoff) {
      weeklyLoad += act.trainingLoad
    }
  }

  // Trend: compare CTL now vs CTL 7 days ago.
  // CTL is a 42-day EMA and changes slowly — a 1.0 TRIMP-unit threshold
  // is enough to distinguish meaningful direction from noise.
  // Only computed when there are ≥ 14 days of history; earlier, CTL is
  // still in its initial ramp-up and any comparison would be misleading.
  const TREND_THRESHOLD = 1.0
  const trend: TrainingLoadResult['trend'] =
    totalDays < 14            ? 'maintaining' :
    ctl - ctlMinus7 > TREND_THRESHOLD ? 'improving' :
    ctlMinus7 - ctl > TREND_THRESHOLD ? 'declining' :
    'maintaining'

  const explanation = buildExplanation(atl, ctl, tsb, acwr, trend, weeklyLoad)

  return {
    atl:        r2(atl),
    ctl:        r2(ctl),
    tsb:        r2(tsb),
    acwr,
    weeklyLoad: r1(weeklyLoad),
    trend,
    explanation,
  }
}
