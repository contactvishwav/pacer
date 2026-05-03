module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/db/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
// Shared Prisma client — Next.js hot-reload safe singleton.
// Import this everywhere instead of calling new PrismaClient() per module.
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/training-load.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
__turbopack_context__.s([
    "computeTrainingLoad",
    ()=>computeTrainingLoad,
    "estimateTrainingLoad",
    ()=>estimateTrainingLoad
]);
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
const K_ATL = Math.exp(-1 / 7) // ≈ 0.8669
;
const K_CTL = Math.exp(-1 / 42) // ≈ 0.9765
;
// ─── Date helpers ─────────────────────────────────────────────────────────────
function toDateKey(d) {
    // "YYYY-MM-DD" in UTC — used as the daily load map key
    return d.toISOString().slice(0, 10);
}
function startOfDayUTC(d) {
    const r = new Date(d);
    r.setUTCHours(0, 0, 0, 0);
    return r;
}
function daysBetween(a, b) {
    // Returns the number of whole calendar days between two UTC midnight dates
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
// ─── Rounding helpers ─────────────────────────────────────────────────────────
function r1(n) {
    return Math.round(n * 10) / 10;
}
function r2(n) {
    return Math.round(n * 100) / 100;
}
function r3(n) {
    return Math.round(n * 1000) / 1000;
}
function estimateTrainingLoad(durationMinutes, avgHR, restingHR, maxHR) {
    const hrRange = maxHR - restingHR;
    if (hrRange <= 0 || durationMinutes <= 0) return 0;
    const hrr = Math.max(0, Math.min(1, (avgHR - restingHR) / hrRange));
    return durationMinutes * hrr * 0.64 * Math.exp(1.92 * hrr);
}
// ─── Explanation builder ──────────────────────────────────────────────────────
function buildExplanation(atl, ctl, tsb, acwr, trend, weeklyLoad) {
    const parts = [];
    // Fitness level (CTL magnitude)
    if (ctl < 20) {
        parts.push(`Fitness is low (CTL ${r1(ctl)}) — still building base.`);
    } else if (ctl < 40) {
        parts.push(`Fitness is building (CTL ${r1(ctl)}).`);
    } else if (ctl < 60) {
        parts.push(`Good fitness level (CTL ${r1(ctl)}).`);
    } else {
        parts.push(`High fitness level (CTL ${r1(ctl)}) — well-conditioned for race.`);
    }
    // Fatigue / freshness (TSB sign and magnitude)
    if (tsb < -30) {
        parts.push(`High fatigue (TSB ${r1(tsb)}) — typical of peak training.`);
    } else if (tsb < -10) {
        parts.push(`Moderate fatigue (TSB ${r1(tsb)}) — normal during quality training.`);
    } else if (tsb < 5) {
        parts.push(`Near-neutral form (TSB ${r1(tsb)}).`);
    } else {
        parts.push(`Fresh and recovered (TSB ${r1(tsb)}) — good form for quality sessions.`);
    }
    // Trend direction
    if (trend === 'improving') {
        parts.push(`Fitness trend: improving.`);
    } else if (trend === 'declining') {
        parts.push(`Fitness trend: declining — taper or recovery phase.`);
    }
    // Injury-risk copy follows AGENT_GUIDELINES language rules:
    // "risk signal / training-load spike / caution range / higher-risk pattern"
    if (acwr === null) {
        parts.push(`Injury-risk signal: insufficient history (< 4 weeks).`);
    } else if (acwr > 1.3) {
        parts.push(`Training-load spike: ACWR ${r3(acwr)} is in the higher-risk range (>1.3). ` + `Monitor recovery closely.`);
    } else if (acwr > 1.15) {
        parts.push(`ACWR ${r3(acwr)} is in the caution range — elevated but manageable.`);
    } else if (acwr < 0.7) {
        parts.push(`ACWR ${r3(acwr)} is low — recovery or taper phase.`);
    } else {
        parts.push(`ACWR ${r3(acwr)} is within the optimal range (0.8–1.3).`);
    }
    void weeklyLoad; // weeklyLoad surfaced in the result, not repeated in explanation
    return parts.join(' ');
}
function computeTrainingLoad(activities) {
    if (activities.length === 0) {
        return {
            atl: 0,
            ctl: 0,
            tsb: 0,
            acwr: null,
            weeklyLoad: 0,
            trend: 'maintaining',
            explanation: 'No training data available.'
        };
    }
    // Sort ascending so we can walk forward through time
    const sorted = [
        ...activities
    ].sort((a, b)=>a.startedAt.getTime() - b.startedAt.getTime());
    // Sum all loads that fall on the same calendar day.
    // Multiple activities in one day (e.g., morning + evening run) are additive.
    const dailyLoad = new Map();
    for (const act of sorted){
        const key = toDateKey(act.startedAt);
        dailyLoad.set(key, (dailyLoad.get(key) ?? 0) + act.trainingLoad);
    }
    const firstDay = startOfDayUTC(sorted[0].startedAt);
    const lastDay = startOfDayUTC(sorted[sorted.length - 1].startedAt);
    const totalDays = daysBetween(firstDay, lastDay) + 1 // inclusive
    ;
    let atl = 0;
    let ctl = 0;
    let ctlMinus7 = 0 // CTL 7 days before the final day — used for trend
    ;
    for(let i = 0; i < totalDays; i++){
        const d = new Date(firstDay);
        d.setUTCDate(d.getUTCDate() + i);
        const load = dailyLoad.get(toDateKey(d)) ?? 0;
        // One-day EMA update (Banister PMC formula):
        //   ATL_today = ATL_yesterday × k_ATL + load_today × (1 − k_ATL)
        //   CTL_today = CTL_yesterday × k_CTL + load_today × (1 − k_CTL)
        //
        // On rest days load = 0, so both EMAs simply decay.
        atl = atl * K_ATL + load * (1 - K_ATL);
        ctl = ctl * K_CTL + load * (1 - K_CTL);
        // Capture CTL 7 days before the last iteration for trend computation
        if (i === totalDays - 1 - 7) {
            ctlMinus7 = ctl;
        }
    }
    const tsb = ctl - atl;
    // ACWR = ATL / CTL.
    // Requires ≥ 28 days (4 weeks) because CTL (42-day EMA) hasn't converged
    // with fewer data points — the ratio would be artificially high and
    // would produce false spike signals. Return null instead of a misleading value.
    const acwr = totalDays >= 28 && ctl > 0 ? r3(atl / ctl) : null;
    // Weekly load: raw sum of loads in the trailing 7-day window.
    // This is the unadjusted sum, not the EMA — useful for "what did I actually
    // do this week?" display alongside ATL/CTL.
    const weekCutoff = new Date(lastDay);
    weekCutoff.setUTCDate(weekCutoff.getUTCDate() - 6); // 7 days inclusive
    let weeklyLoad = 0;
    for (const act of sorted){
        if (startOfDayUTC(act.startedAt) >= weekCutoff) {
            weeklyLoad += act.trainingLoad;
        }
    }
    // Trend: compare CTL now vs CTL 7 days ago.
    // CTL is a 42-day EMA and changes slowly — a 1.0 TRIMP-unit threshold
    // is enough to distinguish meaningful direction from noise.
    // Only computed when there are ≥ 14 days of history; earlier, CTL is
    // still in its initial ramp-up and any comparison would be misleading.
    const TREND_THRESHOLD = 1.0;
    const trend = totalDays < 14 ? 'maintaining' : ctl - ctlMinus7 > TREND_THRESHOLD ? 'improving' : ctlMinus7 - ctl > TREND_THRESHOLD ? 'declining' : 'maintaining';
    const explanation = buildExplanation(atl, ctl, tsb, acwr, trend, weeklyLoad);
    return {
        atl: r2(atl),
        ctl: r2(ctl),
        tsb: r2(tsb),
        acwr,
        weeklyLoad: r1(weeklyLoad),
        trend,
        explanation
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/injury-risk.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
__turbopack_context__.s([
    "computeInjuryRisk",
    ()=>computeInjuryRisk,
    "getAcwrCategory",
    ()=>getAcwrCategory
]);
// ─── Threshold constants ──────────────────────────────────────────────────────
//
// These ranges are broadly consistent with thresholds cited in workload-
// monitoring literature. They are coaching heuristics, not clinical values.
const ACWR_UNDERLOAD = 0.8;
const ACWR_CAUTION = 1.3;
const ACWR_HIGH_RISK = 1.5;
const MIN_PRIOR_WEEKS = 4 // Gabbett standard: need 4 complete prior weeks
;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function startOfDayUTC(d) {
    const r = new Date(d);
    r.setUTCHours(0, 0, 0, 0);
    return r;
}
function r3(n) {
    return Math.round(n * 1000) / 1000;
}
function r0(n) {
    return Math.round(n);
}
function getAcwrCategory(acwr) {
    if (acwr < ACWR_UNDERLOAD) return 'underload';
    if (acwr <= ACWR_CAUTION) return 'optimal';
    if (acwr <= ACWR_HIGH_RISK) return 'caution';
    return 'high-risk';
}
function computeInjuryRisk(activities, weeklySummaries) {
    if (activities.length === 0 || weeklySummaries.length === 0) {
        return insufficientResult([], []);
    }
    const sortedSummaries = [
        ...weeklySummaries
    ].sort((a, b)=>a.weekNumber - b.weekNumber);
    // ── History arrays for the last 6 weeks (computed before anything else) ──
    const last6 = sortedSummaries.slice(-6);
    const weeklyLoadTrend = last6.map((s)=>r0(s.totalLoad));
    const acwrHistory = last6.map((s)=>{
        const prior = sortedSummaries.filter((w)=>w.weekNumber < s.weekNumber).slice(-MIN_PRIOR_WEEKS);
        if (prior.length < MIN_PRIOR_WEEKS) return 0;
        const chronic = prior.reduce((sum, w)=>sum + w.totalLoad, 0) / MIN_PRIOR_WEEKS;
        return chronic > 0 ? r3(s.totalLoad / chronic) : 0;
    });
    // ── Find the current week ─────────────────────────────────────────────────
    //
    // "Current week" = the weekly summary whose Monday–Sunday window contains
    // the most recent activity's date.
    const sorted = [
        ...activities
    ].sort((a, b)=>a.startedAt.getTime() - b.startedAt.getTime());
    const refDate = startOfDayUTC(sorted[sorted.length - 1].startedAt);
    const currentSummary = sortedSummaries.find((s)=>{
        const weekStart = startOfDayUTC(s.weekStartDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
        return refDate >= weekStart && refDate <= weekEnd;
    });
    if (!currentSummary) {
        // Fallback: athlete hasn't completed the current week yet — estimate acute
        // load from activities in the trailing 7 days from the last activity date.
        const sevenDaysAgo = new Date(refDate.getTime() - 7 * 86_400_000);
        const recentActs = activities.filter((a)=>startOfDayUTC(a.startedAt) >= sevenDaysAgo);
        const acuteLoad = recentActs.reduce((s, a)=>s + a.trainingLoad, 0);
        const priorWeeks = sortedSummaries.slice(-MIN_PRIOR_WEEKS);
        if (priorWeeks.length < MIN_PRIOR_WEEKS) {
            return {
                ...insufficientResult(weeklyLoadTrend, acwrHistory),
                confidence: 'low'
            };
        }
        const chronicLoad = priorWeeks.reduce((s, w)=>s + w.totalLoad, 0) / MIN_PRIOR_WEEKS;
        const acwr = chronicLoad > 0 ? r3(acuteLoad / chronicLoad) : null;
        if (acwr === null) {
            return {
                ...insufficientResult(weeklyLoadTrend, acwrHistory),
                confidence: 'medium'
            };
        }
        const category = getAcwrCategory(acwr);
        return {
            acwr,
            category,
            confidence: 'medium',
            explanation: buildExplanation(acwr, category, acuteLoad, chronicLoad),
            contributingFactors: [
                'Current week is incomplete — acute load estimated from last 7 days',
                `Estimated acute load: ${r0(acuteLoad)} TRIMP from ${recentActs.length} session(s)`
            ],
            recommendedAction: buildRecommendation(category),
            weeklyLoadTrend,
            acwrHistory
        };
    }
    // ── Acute load: activities in the current calendar week ───────────────────
    const weekStart = startOfDayUTC(currentSummary.weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);
    const acuteActivities = activities.filter((a)=>a.startedAt >= weekStart && a.startedAt <= weekEnd);
    const acuteLoad = acuteActivities.reduce((s, a)=>s + a.trainingLoad, 0);
    // ── Chronic load: average of the 4 most recent prior complete weeks ───────
    const priorWeeks = sortedSummaries.filter((s)=>s.weekNumber < currentSummary.weekNumber).slice(-MIN_PRIOR_WEEKS);
    // ── Confidence and data sufficiency ───────────────────────────────────────
    const confidence = priorWeeks.length === MIN_PRIOR_WEEKS ? 'high' : priorWeeks.length >= 2 ? 'medium' : 'low';
    if (priorWeeks.length < MIN_PRIOR_WEEKS) {
        return {
            ...insufficientResult(weeklyLoadTrend, acwrHistory),
            confidence
        };
    }
    const chronicLoad = priorWeeks.reduce((s, w)=>s + w.totalLoad, 0) / MIN_PRIOR_WEEKS;
    const acwr = chronicLoad > 0 ? r3(acuteLoad / chronicLoad) : null;
    if (acwr === null) {
        return {
            ...insufficientResult(weeklyLoadTrend, acwrHistory),
            confidence
        };
    }
    // ── Category ──────────────────────────────────────────────────────────────
    const category = getAcwrCategory(acwr);
    // ── Contributing factors ──────────────────────────────────────────────────
    const factors = [];
    const pct = Math.round(Math.abs(acwr - 1) * 100);
    if (acwr > 1.0) {
        factors.push(`Acute load (${r0(acuteLoad)} TRIMP) is ${pct}% above the 4-week average (${r0(chronicLoad)} TRIMP)`);
    } else {
        factors.push(`Acute load (${r0(acuteLoad)} TRIMP) is ${pct}% below the 4-week average (${r0(chronicLoad)} TRIMP)`);
    }
    if (acuteActivities.length > 0) {
        factors.push(`${acuteActivities.length} session(s) in the current week`);
    }
    const qualityCount = currentSummary.qualitySessionCount ?? 0;
    if (qualityCount > 0) {
        factors.push(`${qualityCount} quality session(s) (tempo / threshold / interval) this week`);
    }
    const longRunM = currentSummary.longRunDistanceMeters ?? 0;
    if (longRunM > 14000) {
        factors.push(`Long run of ${Math.round(longRunM / 1000)} km this week — higher load contribution`);
    }
    // ── Explanation and recommendation ────────────────────────────────────────
    const explanation = buildExplanation(acwr, category, acuteLoad, chronicLoad);
    const recommendedAction = buildRecommendation(category);
    return {
        acwr,
        category,
        confidence,
        explanation,
        contributingFactors: factors,
        recommendedAction,
        weeklyLoadTrend,
        acwrHistory
    };
}
// ─── Explanation builder ──────────────────────────────────────────────────────
function buildExplanation(acwr, category, acuteLoad, chronicLoad) {
    const ratio = acwr.toFixed(2);
    switch(category){
        case 'underload':
            return `ACWR ${ratio} — training load this week (${r0(acuteLoad)} TRIMP) is below ` + `the 4-week average (${r0(chronicLoad)} TRIMP). ` + `This is the expected pattern during a recovery or taper week.`;
        case 'optimal':
            return `ACWR ${ratio} is within the optimal training range (0.8–1.3). ` + `Acute and chronic loads are well-matched — the weekly stimulus is ` + `appropriate for adaptation without overreach.`;
        case 'caution':
            return `ACWR ${ratio} is in the caution range — a training-load spike signal is detected. ` + `This week's load (${r0(acuteLoad)} TRIMP) is significantly above ` + `the 4-week average (${r0(chronicLoad)} TRIMP). Monitor fatigue closely.`;
        case 'high-risk':
            return `ACWR ${ratio} reflects a significant training-load spike — a higher-risk pattern. ` + `This week's load (${r0(acuteLoad)} TRIMP) is substantially above ` + `the 4-week chronic baseline (${r0(chronicLoad)} TRIMP).`;
        default:
            return 'Insufficient training history to compute a workload risk signal.';
    }
}
// ─── Recommendation builder ───────────────────────────────────────────────────
function buildRecommendation(category) {
    switch(category){
        case 'underload':
            return 'Maintain or gradually increase load to rebuild fitness momentum.';
        case 'optimal':
            return 'Load is well-managed. Maintain this pattern heading into next week.';
        case 'caution':
            return 'Consider reducing volume or intensity for the next 3–5 days to manage ' + 'this training-load spike before resuming full training.';
        case 'high-risk':
            return 'This training-load spike warrants a rest day followed by a reduced-load week. ' + 'Reassess session count and intensity for the next 5–7 days.';
        case 'insufficient-data':
            return 'Continue building your training history — the workload risk signal ' + 'becomes available after 4 complete weeks of data.';
    }
}
// ─── Insufficient-data fallback ───────────────────────────────────────────────
function insufficientResult(weeklyLoadTrend, acwrHistory) {
    return {
        acwr: null,
        category: 'insufficient-data',
        confidence: 'low',
        explanation: 'Fewer than 4 complete weeks of training history available. ' + 'A stable 4-week chronic baseline is required before the ACWR risk signal is meaningful.',
        contributingFactors: [],
        recommendedAction: 'Continue building your training history — the workload risk signal ' + 'becomes available after 4 complete weeks of data.',
        weeklyLoadTrend,
        acwrHistory
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/periodization.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
__turbopack_context__.s([
    "detectTrainingPhase",
    ()=>detectTrainingPhase
]);
// ─── Threshold constants ──────────────────────────────────────────────────────
const RECOVERY_LOAD_THRESHOLD = 0.60 // < 60% of prior 3-week avg
;
const RECOVERY_HIGH_RISK_TSB = -15 // TSB floor for high-risk injury check
;
const TAPER_DAYS_MAX = 21 // ≤ 21 days out → taper window
;
const TAPER_QUALITY_MAX = 2 // ≤ 2 quality sessions in taper
;
const PEAK_DAYS_MIN = 22 // ≥ 22 days out
;
const PEAK_DAYS_MAX = 42 // ≤ 42 days out
;
const PEAK_LOAD_FRACTION = 0.85 // ≥ 85% of recent max load
;
const PEAK_QUALITY_MIN = 3 // ≥ 3 quality sessions
;
const BUILD_DAYS_MIN = 43 // ≥ 43 days out
;
const BUILD_DAYS_MAX = 70 // ≤ 70 days out
;
const BUILD_QUALITY_MIN = 2 // ≥ 2 quality sessions
;
const BASE_DAYS_MIN = 70 // > 70 days out → BASE anchor
;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function r0(n) {
    return Math.round(n);
}
function daysUntil(target, ref) {
    return Math.max(0, Math.round((target.getTime() - ref.getTime()) / 86_400_000));
}
function r1(n) {
    return Math.round(n * 10) / 10;
}
// ─── Phase builders ───────────────────────────────────────────────────────────
// Each builder returns a complete PeriodizationResult for its phase.
function recovery(days, weeks, currentLoad, prior3Avg, tsb, injuryCategory) {
    const isLoadDrop = prior3Avg > 0 && currentLoad < prior3Avg * RECOVERY_LOAD_THRESHOLD;
    const dropPct = prior3Avg > 0 ? r0((1 - currentLoad / prior3Avg) * 100) : 0;
    const isInjuryDriven = injuryCategory === 'high-risk';
    const reason = isLoadDrop ? `Weekly load (${r0(currentLoad)} TRIMP) is ${dropPct}% below the 3-week average (${r0(prior3Avg)} TRIMP) — a load drop exceeding the 40% recovery threshold.` : `Training-load spike signal (${injuryCategory}) combined with sustained negative TSB (${r1(tsb)}) indicates the body needs unplanned recovery.`;
    const signals = [
        `Current load: ${r0(currentLoad)} TRIMP (3-week avg: ${r0(prior3Avg)} TRIMP)`,
        `TSB: ${r1(tsb)} (${tsb < -20 ? 'high fatigue' : tsb < 0 ? 'moderate fatigue' : 'recovering'})`
    ];
    if (isInjuryDriven) signals.push(`Injury-risk category: ${injuryCategory}`);
    if (days > 0) signals.push(`Days until race: ${days} (${weeks} weeks)`);
    return {
        phase: 'RECOVERY',
        confidence: isLoadDrop && Math.abs(tsb) < 10 ? 'medium' : 'high',
        primaryReason: reason,
        supportingSignals: signals,
        coachingImplication: injuryCategory === 'high-risk' || injuryCategory === 'caution' ? 'Load spike detected — prioritize recovery this week before adding volume.' : 'Planned recovery phase — trust the process, your fitness is preserved.',
        daysUntilRace: days,
        weeksUntilRace: weeks
    };
}
function taper(days, weeks, currentLoad, prevLoad, qualityCount, tsb) {
    return {
        phase: 'TAPER',
        confidence: 'high',
        primaryReason: `Race is ${days} days away. Load is reducing (${r0(currentLoad)} vs ${r0(prevLoad)} TRIMP last week) — taper phase confirmed.`,
        supportingSignals: [
            `Days until race: ${days} (${weeks} weeks)`,
            `Load delta: −${r0(prevLoad - currentLoad)} TRIMP week-over-week`,
            `Quality sessions this week: ${qualityCount} (≤ ${TAPER_QUALITY_MAX} expected in taper)`,
            `TSB: ${r1(tsb)} (${tsb > 0 ? 'fresh' : tsb > -10 ? 'near-neutral' : 'still building freshness'})`
        ],
        coachingImplication: 'Reduce volume but preserve race sharpness with short, race-pace efforts 2–3 times this week. Trust the taper.',
        daysUntilRace: days,
        weeksUntilRace: weeks
    };
}
function peak(days, weeks, currentLoad, recentMaxLoad, qualityCount, ctl) {
    const loadPct = recentMaxLoad > 0 ? r0(currentLoad / recentMaxLoad * 100) : 100;
    return {
        phase: 'PEAK',
        confidence: 'high',
        primaryReason: `Race is ${days} days away. Current load (${r0(currentLoad)} TRIMP) is ${loadPct}% of recent peak with ${qualityCount} quality sessions — peak-block density confirmed.`,
        supportingSignals: [
            `Days until race: ${days} (${weeks} weeks)`,
            `Load at ${loadPct}% of recent maximum (${r0(recentMaxLoad)} TRIMP)`,
            `Quality sessions: ${qualityCount} (≥ ${PEAK_QUALITY_MIN} expected in peak)`,
            `CTL: ${r1(ctl)} (fitness level)`
        ],
        coachingImplication: 'Maintain quality session density but protect recovery. Race-specificity is the priority now.',
        daysUntilRace: days,
        weeksUntilRace: weeks
    };
}
function build(days, weeks, recentLoads, qualityCount, ctl) {
    const trendStr = recentLoads.map(r0).join(' → ');
    return {
        phase: 'BUILD',
        confidence: 'high',
        primaryReason: `Race is ${days} days away. Load trending upward (${trendStr} TRIMP) with ${qualityCount} quality sessions — progressive build phase confirmed.`,
        supportingSignals: [
            `Days until race: ${days} (${weeks} weeks)`,
            `Load trend (last 3 weeks): ${trendStr} TRIMP`,
            `Quality sessions: ${qualityCount} (≥ ${BUILD_QUALITY_MIN} expected in build)`,
            `CTL: ${r1(ctl)} — fitness building`
        ],
        coachingImplication: 'Continue progressive overload with 2–3 quality sessions per week. Build race confidence through tempo consistency and long-run progression.',
        daysUntilRace: days,
        weeksUntilRace: weeks
    };
}
function base(days, weeks, currentLoad, prior3Avg, qualityCount, ctl, isCalendarBased) {
    const reason = isCalendarBased ? `Race is ${days} days away (${weeks} weeks) — well outside the peak build window (>10 weeks).` : `Load is consistent (${r0(currentLoad)} TRIMP vs ${r0(prior3Avg)} TRIMP avg) with ${qualityCount} quality session(s) per week — foundational aerobic phase.`;
    return {
        phase: 'BASE',
        confidence: isCalendarBased ? 'high' : 'medium',
        primaryReason: reason,
        supportingSignals: [
            `Days until race: ${days} (${weeks} weeks)`,
            `Weekly load: ${r0(currentLoad)} TRIMP (3-week avg: ${r0(prior3Avg)} TRIMP)`,
            `Quality sessions: ${qualityCount}`,
            `CTL: ${r1(ctl)} — aerobic base`
        ],
        coachingImplication: 'Focus on aerobic base development and consistent volume. Keep easy runs truly easy, add volume gradually, and introduce quality work only when ready.',
        daysUntilRace: days,
        weeksUntilRace: weeks
    };
}
function detectTrainingPhase(input) {
    const ref = input.referenceDate ?? new Date();
    const days = daysUntil(input.goalRaceDate, ref);
    const weeks = r1(days / 7);
    // ── Sort summaries and extract recent window ───────────────────────────────
    const sorted = [
        ...input.weeklySummaries
    ].sort((a, b)=>a.weekNumber - b.weekNumber);
    const last4 = sorted.slice(-4);
    const current = last4[last4.length - 1];
    const prior3 = last4.slice(0, 3);
    const currentLoad = current?.totalLoad ?? 0;
    const prior3Avg = prior3.length > 0 ? prior3.reduce((s, w)=>s + w.totalLoad, 0) / prior3.length : currentLoad;
    const currentQuality = current?.qualitySessionCount ?? 0;
    const currentCTL = input.currentTrainingLoad.ctl;
    const tsb = input.currentTrainingLoad.tsb;
    const injuryCategory = input.currentInjuryRisk.category;
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
    const loadDropped = prior3Avg > 0 && currentLoad < prior3Avg * RECOVERY_LOAD_THRESHOLD;
    const highRiskNegativeTsb = injuryCategory === 'high-risk' && tsb < RECOVERY_HIGH_RISK_TSB;
    if (loadDropped || highRiskNegativeTsb) {
        return recovery(days, weeks, currentLoad, prior3Avg, tsb, injuryCategory);
    }
    // ── Rule 2: TAPER ─────────────────────────────────────────────────────────
    //
    // Calendar-anchored: race within 3 weeks AND intentional load reduction AND
    // low quality session count (sharpening, not building).
    const prevWeekLoad = prior3[prior3.length - 1]?.totalLoad ?? currentLoad;
    const loadDecreasing = currentLoad < prevWeekLoad;
    if (days <= TAPER_DAYS_MAX && loadDecreasing && currentQuality <= TAPER_QUALITY_MAX) {
        return taper(days, weeks, currentLoad, prevWeekLoad, currentQuality, tsb);
    }
    // ── Rule 3: PEAK ──────────────────────────────────────────────────────────
    //
    // Calendar window: 22–42 days out. Load near recent maximum (high density)
    // AND high quality session frequency (race-specificity).
    const recentMaxLoad = Math.max(...last4.map((w)=>w.totalLoad), 1);
    const nearRecentMax = currentLoad >= recentMaxLoad * PEAK_LOAD_FRACTION;
    if (days >= PEAK_DAYS_MIN && days <= PEAK_DAYS_MAX && nearRecentMax && currentQuality >= PEAK_QUALITY_MIN) {
        return peak(days, weeks, currentLoad, recentMaxLoad, currentQuality, currentCTL);
    }
    // ── Rule 4: BUILD ─────────────────────────────────────────────────────────
    //
    // Calendar window: 43–70 days out. Progressive load increase over 3 weeks
    // AND quality session frequency ≥ 2 per week (adding intensity).
    const trend3 = last4.slice(-3).map((w)=>w.totalLoad);
    const loadTrendingUp = trend3.length >= 3 && trend3[2] > trend3[0] // current week load > 2 weeks ago
    ;
    if (days >= BUILD_DAYS_MIN && days <= BUILD_DAYS_MAX && loadTrendingUp && currentQuality >= BUILD_QUALITY_MIN) {
        return build(days, weeks, trend3, currentQuality, currentCTL);
    }
    // ── Rule 5 & Default: BASE ────────────────────────────────────────────────
    //
    // Race is far away (> 10 weeks) OR load pattern shows consistent low-intensity
    // foundational work with minimal quality sessions.
    const isCalendarBased = days > BASE_DAYS_MIN;
    return base(days, weeks, currentLoad, prior3Avg, currentQuality, currentCTL, isCalendarBased);
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/race-prediction.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── Race prediction engine ────────────────────────────────────────────────────
//
// Transparent heuristic: Riegel formula + fatigue/taper adjustments.
// This is an estimated trajectory based on current training data, not a
// scientific guarantee or clinical prediction.
//
// Riegel formula: T2 = T1 × (D2 / D1)^1.06
//   T1 = best qualifying effort time (seconds)
//   D1 = best qualifying effort distance (meters)
//   D2 = goal race distance (meters)
//
// Best effort: fastest avg pace across TEMPO, LONG_RUN, RACE activities
//   ≥ 5000 m from the last 8 weeks (caller pre-filters the window).
//
// Adjustments applied in order:
//   1. Fatigue (TSB-based): < −10 → ×1.02, > 5 → ×0.98, else no-op
//   2. Taper bonus: TAPER phase + ≤ 21 days to race → ×0.99
//   Both adjustments are independent and can stack.
//
// Confidence band: multiplicative adjustments to the ±4 % base.
//   All matching conditions apply; they compound.
//
// Language rule: use "projected finish", "estimated trajectory",
//   "confidence range". Never "you will finish in X".
__turbopack_context__.s([
    "predictRaceTime",
    ()=>predictRaceTime
]);
// ─── Constants ────────────────────────────────────────────────────────────────
const RIEGEL_EXPONENT = 1.06;
const QUALIFYING_TYPES = new Set([
    'TEMPO',
    'LONG_RUN',
    'RACE'
]);
const MIN_QUALIFY_DISTANCE_M = 5000;
// Confidence band — multiplicative adjustments on base ±4 %
const BAND_BASE = 0.04;
const BAND_WIDEN_SHORT_EFFORT = 1.15 // × factor when best effort < 8 km
;
const BAND_NARROW_CONSISTENT = 0.90 // × factor when last 4 wks all > 200 load
;
const BAND_NARROW_TAPER = 0.95 // × factor in taper + ≤ 21 days to race
;
const CONSISTENT_LOAD_THRESHOLD = 200 // TRIMP per week
;
const TAPER_DAYS_THRESHOLD = 21;
// Confidence score
const SCORE_BASE = 70;
const SCORE_LONG_EFFORT_BONUS = 15 // best effort ≥ 10 km
;
const SCORE_CONSISTENT_BONUS = 10 // last 4 weeks all > 200 load
;
const SCORE_SHORT_EFFORT_PENALTY = 20 // best effort < 8 km
;
const SCORE_FEW_ACTIVITIES_PENALTY = 10 // fewer than 3 qualifying activities
;
const SCORE_CAP = 95;
const SCORE_FLOOR = 10;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function r0(n) {
    return Math.round(n);
}
function formatTime(totalSeconds) {
    if (totalSeconds <= 0) return '—';
    const s = r0(totalSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor(s % 3600 / 60);
    const sec = s % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    return `${m}:${String(sec).padStart(2, '0')}`;
}
function formatPace(secPerKm) {
    const m = Math.floor(secPerKm / 60);
    const s = r0(secPerKm) % 60;
    return `${m}:${String(s).padStart(2, '0')}/km`;
}
function formatDate(d) {
    return d.toISOString().slice(0, 10) // "YYYY-MM-DD" UTC
    ;
}
// ─── Gap formatter ────────────────────────────────────────────────────────────
function buildGapString(gap) {
    if (gap === null) return '—';
    if (gap === 0) return 'exactly on goal pace';
    const abs = Math.abs(gap);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const timeStr = `${m}:${String(s).padStart(2, '0')}`;
    return gap > 0 ? `${timeStr} behind goal pace` : `${timeStr} ahead of goal pace`;
}
// ─── whatNeedsToHappen builder ────────────────────────────────────────────────
function buildWhatNeedsToHappen(gap, goalTimeSeconds, goalDistanceM, phase, confidenceScore, qualifyingCount) {
    if (gap === null) {
        return 'Set a goal time to unlock gap analysis and see what pace you need on race day.';
    }
    const phaseAdvice = {
        BASE: 'Aerobic base development is the priority now — speed comes later.',
        BUILD: 'The build phase is the right time to sharpen race-pace fitness with tempo and threshold sessions.',
        PEAK: 'Peak phase: race-specific sessions are the priority. Protect recovery between hard efforts.',
        TAPER: 'The hay is in the barn. Trust the taper and focus on race-day execution.',
        RECOVERY: 'Recovery phase: protect this week. Fitness is preserved during planned rest.',
        UNSTRUCTURED: 'Follow the training plan to build race-specific fitness.'
    };
    const phaseNote = phaseAdvice[phase.phase] ?? '';
    const lowConfidenceNote = confidenceScore < 50 ? ' Complete more qualifying sessions (tempo, long run, or race of ≥ 5 km) to sharpen the estimate.' : '';
    const fewActivitiesNote = qualifyingCount < 3 ? ' More qualifying activities will improve estimate accuracy.' : '';
    if (gap <= 0) {
        const cushion = gap === 0 ? 'exactly on target' : `${buildGapString(gap)}`;
        return (`Current projected finish is ${cushion} — you are on track. ` + `${phaseNote}` + `${lowConfidenceNote || fewActivitiesNote || ' Maintain consistency through race day.'}`).trim();
    }
    // Athlete is behind goal — compute pace improvement needed per km
    const distanceKm = goalDistanceM / 1000;
    const paceGapSecPerKm = gap / distanceKm;
    const paceGapM = Math.floor(paceGapSecPerKm / 60);
    const paceGapS = r0(paceGapSecPerKm) % 60;
    const paceGapStr = paceGapM > 0 ? `${paceGapM}:${String(paceGapS).padStart(2, '0')}/km` : `${r0(paceGapSecPerKm)} sec/km`;
    const goalPaceSecPerKm = goalTimeSeconds !== null ? goalTimeSeconds / distanceKm : 0;
    const goalPaceStr = formatPace(r0(goalPaceSecPerKm));
    return (`To hit the goal, target ~${goalPaceStr} average race pace — that's ~${paceGapStr} ` + `faster per km than the current projected finish. ` + `${phaseNote}` + `${lowConfidenceNote || fewActivitiesNote}`).trim();
}
// ─── No-data fallback result ──────────────────────────────────────────────────
function noDataResult(goalRace) {
    return {
        predictedTimeSeconds: 0,
        predictedTimeFormatted: '—',
        confidenceLow: 0,
        confidenceLowFormatted: '—',
        confidenceHigh: 0,
        confidenceHighFormatted: '—',
        confidenceScore: SCORE_FLOOR,
        gapToGoalSeconds: null,
        gapToGoalFormatted: '—',
        explanation: `No qualifying activities (TEMPO, LONG_RUN, or RACE ≥ ${MIN_QUALIFY_DISTANCE_M / 1000} km) ` + `found in the last 8 weeks. Cannot generate a projected finish for ${goalRace.raceName}.`,
        whatNeedsToHappen: `Complete at least one tempo run, long run, or race of ${MIN_QUALIFY_DISTANCE_M / 1000} km ` + `or more to generate an estimated trajectory.`,
        dataQualityNotes: [
            `No qualifying activities found in the last 8 weeks. ` + `A minimum of 1 activity is required; 3 or more improves reliability.`
        ],
        bestEffortActivity: null
    };
}
function predictRaceTime(input) {
    const { goalRace, recentActivities, weeklySummaries, currentTrainingLoad, currentPhase } = input;
    // ── Filter qualifying activities ─────────────────────────────────────────
    const qualifying = recentActivities.filter((a)=>QUALIFYING_TYPES.has(a.workoutType) && a.distanceMeters >= MIN_QUALIFY_DISTANCE_M);
    if (qualifying.length === 0) {
        return noDataResult(goalRace);
    }
    // ── Best effort: lowest avgPaceSecPerKm ───────────────────────────────────
    const bestEffort = qualifying.reduce((best, a)=>a.avgPaceSecPerKm < best.avgPaceSecPerKm ? a : best);
    // ── Last 4 weeks consistency check ───────────────────────────────────────
    const sorted4 = [
        ...weeklySummaries
    ].sort((a, b)=>b.weekNumber - a.weekNumber).slice(0, 4);
    const allLast4Consistent = sorted4.length === 4 && sorted4.every((w)=>w.totalLoad > CONSISTENT_LOAD_THRESHOLD);
    // ── Riegel base ───────────────────────────────────────────────────────────
    const t1 = bestEffort.movingTimeSeconds;
    const d1 = bestEffort.distanceMeters;
    const d2 = goalRace.distanceMeters;
    const rawRiegel = t1 * Math.pow(d2 / d1, RIEGEL_EXPONENT);
    // ── Adjustments ───────────────────────────────────────────────────────────
    const tsb = currentTrainingLoad.tsb;
    let timeMultiplier = 1.0;
    const adjustmentNotes = [];
    // 1. Fatigue (mutually exclusive TSB bands)
    if (tsb < -10) {
        timeMultiplier *= 1.02;
        adjustmentNotes.push(`fatigue (+2 %, TSB ${tsb.toFixed(1)})`);
    } else if (tsb > 5) {
        timeMultiplier *= 0.98;
        adjustmentNotes.push(`freshness (−2 %, TSB ${tsb.toFixed(1)})`);
    }
    // 2. Taper bonus (independent — can stack with fatigue adjustment)
    const isTaper = currentPhase.phase === 'TAPER' && currentPhase.daysUntilRace < TAPER_DAYS_THRESHOLD;
    if (isTaper) {
        timeMultiplier *= 0.99;
        adjustmentNotes.push(`taper bonus (−1 %, race in ${currentPhase.daysUntilRace} days)`);
    }
    const predictedTimeSeconds = r0(rawRiegel * timeMultiplier);
    // ── Confidence band (multiplicative adjustments on base ±4 %) ─────────────
    const dataQualityNotes = [];
    let bandFactor = BAND_BASE;
    if (bestEffort.distanceMeters < 8000) {
        bandFactor *= BAND_WIDEN_SHORT_EFFORT;
        dataQualityNotes.push(`Best qualifying effort is ${(bestEffort.distanceMeters / 1000).toFixed(1)} km — ` + `under 8 km. Confidence range is wider due to the high extrapolation ratio to ` + `${(d2 / 1000).toFixed(1)} km.`);
    }
    if (allLast4Consistent) {
        bandFactor *= BAND_NARROW_CONSISTENT;
    }
    if (isTaper) {
        bandFactor *= BAND_NARROW_TAPER;
    }
    // confidenceLow < predictedTime < confidenceHigh is guaranteed by construction
    const confidenceLow = r0(predictedTimeSeconds * (1 - bandFactor));
    const confidenceHigh = r0(predictedTimeSeconds * (1 + bandFactor));
    // ── Confidence score ──────────────────────────────────────────────────────
    let score = SCORE_BASE;
    if (bestEffort.distanceMeters >= 10000) score += SCORE_LONG_EFFORT_BONUS;
    else if (bestEffort.distanceMeters < 8000) score -= SCORE_SHORT_EFFORT_PENALTY;
    if (allLast4Consistent) score += SCORE_CONSISTENT_BONUS;
    if (qualifying.length < 3) score -= SCORE_FEW_ACTIVITIES_PENALTY;
    const confidenceScore = Math.min(SCORE_CAP, Math.max(SCORE_FLOOR, score));
    // ── Gap to goal ───────────────────────────────────────────────────────────
    const gapToGoalSeconds = goalRace.goalTimeSeconds !== null ? predictedTimeSeconds - goalRace.goalTimeSeconds : null;
    // ── Explanation ───────────────────────────────────────────────────────────
    const distKm = (bestEffort.distanceMeters / 1000).toFixed(1);
    const pace = formatPace(bestEffort.avgPaceSecPerKm);
    const dateStr = formatDate(bestEffort.startedAt);
    const typeStr = bestEffort.workoutType.toLowerCase().replace('_', ' ');
    let explanation = `Projected finish estimated from your ${typeStr} on ${dateStr} ` + `(${distKm} km at ${pace}). The Riegel formula extrapolates this effort ` + `to ${(d2 / 1000).toFixed(1)} km.`;
    if (adjustmentNotes.length > 0) {
        explanation += ` Applied: ${adjustmentNotes.join(', ')}.`;
    }
    explanation += ` Estimated trajectory based on current training data — ` + `confidence range: ${formatTime(confidenceLow)}–${formatTime(confidenceHigh)}.`;
    // ── What needs to happen ──────────────────────────────────────────────────
    const whatNeedsToHappen = buildWhatNeedsToHappen(gapToGoalSeconds, goalRace.goalTimeSeconds, d2, currentPhase, confidenceScore, qualifying.length);
    return {
        predictedTimeSeconds,
        predictedTimeFormatted: formatTime(predictedTimeSeconds),
        confidenceLow,
        confidenceLowFormatted: formatTime(confidenceLow),
        confidenceHigh,
        confidenceHighFormatted: formatTime(confidenceHigh),
        confidenceScore,
        gapToGoalSeconds,
        gapToGoalFormatted: buildGapString(gapToGoalSeconds),
        explanation,
        whatNeedsToHappen,
        dataQualityNotes,
        bestEffortActivity: {
            date: dateStr,
            distanceKm: Math.round(bestEffort.distanceMeters / 100) / 10,
            paceFormatted: pace,
            workoutType: bestEffort.workoutType
        }
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/weekly-brief.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── Weekly coaching brief generator ──────────────────────────────────────────
//
// Generates a deterministic weekly brief from computed signals — no Claude call.
// Claude can narrativize this in the coach chat, but the brief itself works
// without any AI. This guarantees the brief is always available.
//
// The brief answers five coaching questions:
//   1. What did the athlete actually do last week?        → lastWeekReview
//   2. What should they do this week?                    → thisWeekPrescription
//   3. What is the single most important signal?         → keySignal
//   4. Are there any warnings to surface?                → warnings
//   5. What should they focus on?                        → suggestedFocus
//
// Key signal priority order:
//   1. Injury-risk caution/high-risk (overrides everything)
//   2. Gap to goal > 5 min behind
//   3. CTL declining
//   4. TAPER phase (race approach readiness)
//   5. Default: TSB form status
//
// Prescription override: caution/high-risk injury signal forces
//   recovery-first messaging regardless of the calendar phase.
__turbopack_context__.s([
    "generateWeeklyBrief",
    ()=>generateWeeklyBrief
]);
// ─── Helpers ──────────────────────────────────────────────────────────────────
function r0(n) {
    return Math.round(n);
}
function r1(n) {
    return Math.round(n * 10) / 10;
}
function formatGapTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}
// ─── lastWeekReview builder ───────────────────────────────────────────────────
function buildLastWeekReview(summaries, injuryRisk, recentActivities) {
    if (summaries.length === 0) {
        return [
            'No training data available for last week.',
            'Continue following your training plan.'
        ];
    }
    const current = summaries[summaries.length - 1];
    const prior = summaries.length > 1 ? summaries[summaries.length - 2] : null;
    const bullets = [];
    // 1. Total load vs prior week
    if (prior !== null && prior.totalLoad > 0) {
        const pct = Math.abs(r0((current.totalLoad - prior.totalLoad) / prior.totalLoad * 100));
        const dir = current.totalLoad >= prior.totalLoad ? 'up' : 'down';
        bullets.push(`Logged ${r0(current.totalLoad)} TRIMP — ${pct}% ${dir} from the prior week ` + `(${r0(prior.totalLoad)} TRIMP).`);
    } else {
        bullets.push(`Logged ${r0(current.totalLoad)} TRIMP total training load.`);
    }
    // 2. Activity count and quality sessions
    const qCount = current.qualitySessionCount;
    const qStr = qCount > 0 ? `, including ${qCount} quality session${qCount !== 1 ? 's' : ''}` : ', with no quality sessions';
    bullets.push(`Completed ${current.activityCount} workout${current.activityCount !== 1 ? 's' : ''}${qStr}.`);
    // 3. ACWR if available and not optimal (caution, high-risk, or underload)
    const cat = injuryRisk.category;
    if (injuryRisk.acwr !== null && cat !== 'optimal' && cat !== 'insufficient-data') {
        const label = cat === 'high-risk' ? 'a higher-risk pattern' : cat === 'caution' ? 'the caution range — a training-load spike signal' : 'below the optimal range (recovery or taper pattern)';
        bullets.push(`ACWR this week was ${injuryRisk.acwr.toFixed(2)} — in ${label}.`);
    }
    // 4. Execution quality from last 2 weeks' activities
    const tooHard = recentActivities.filter((a)=>a.executionEvaluation === 'TOO_HARD').length;
    const wellExecuted = recentActivities.filter((a)=>a.executionEvaluation === 'WELL_EXECUTED').length;
    if (tooHard > 0) {
        bullets.push(`${tooHard} session${tooHard !== 1 ? 's' : ''} ran too hard — ` + `heart rate exceeded the easy ceiling on what were planned as easy efforts.`);
    } else if (wellExecuted > 0) {
        bullets.push(`${wellExecuted} quality session${wellExecuted !== 1 ? 's' : ''} well executed — ` + `heart rate and pace matched the prescribed effort.`);
    }
    // Guarantee minimum of 2 bullets
    if (bullets.length < 2) bullets.push('Continue building training consistency.');
    return bullets.slice(0, 4);
}
// ─── thisWeekPrescription builder ────────────────────────────────────────────
function buildPrescription(phase, injury, summaries) {
    // Injury override — regardless of phase
    if (injury.category === 'caution' || injury.category === 'high-risk') {
        return [
            'Training-load spike detected — reduce all session intensity and volume this week.',
            'No quality sessions (tempo, threshold, intervals) until the workload risk signal normalizes.',
            'Keep all runs easy: heart rate below your easy zone ceiling for every session.',
            'Prioritize rest days and full recovery before resuming progressive training.'
        ];
    }
    const current = summaries.length > 0 ? summaries[summaries.length - 1] : null;
    switch(phase.phase){
        case 'TAPER':
            return buildTaperPrescription(phase);
        case 'PEAK':
            return buildPeakPrescription(summaries);
        case 'BUILD':
            return buildBuildPrescription(current);
        case 'RECOVERY':
            return buildRecoveryPrescription();
        default:
            return buildBasePrescription(current) // BASE + UNSTRUCTURED
            ;
    }
}
function buildTaperPrescription(phase) {
    const bullets = [
        'Reduce total volume by 20–30% from last week — shorter runs, same or fewer sessions.',
        'Include one short quality session: 3–4 × 1 km at goal race pace with full recovery between reps.',
        'Prioritize sleep (8+ hours), hydration, and race-day nutrition practice.',
        'Avoid trying new shoes, routes, or foods this close to race day — trust what has worked.'
    ];
    // Final week: include all 4 bullets for maximum detail
    return phase.daysUntilRace <= 7 ? bullets : bullets.slice(0, 3);
}
function buildPeakPrescription(summaries) {
    const avgQuality = summaries.length > 0 ? Math.round(summaries.reduce((s, w)=>s + w.qualitySessionCount, 0) / summaries.length) : 2;
    const qTarget = Math.min(Math.max(avgQuality, 2), 3);
    return [
        `Maintain high-quality density: target ${qTarget} quality session${qTarget !== 1 ? 's' : ''} this week (interval, tempo, or threshold).`,
        'Protect recovery between hard sessions — at least one full easy day between each quality effort.',
        'Race-specific intensity is the priority: include one session at goal race pace or faster.',
        'Avoid adding new volume — load is at its peak, the goal now is quality and race specificity.'
    ];
}
function buildBuildPrescription(summary) {
    const lastLoad = summary?.totalLoad ?? 0;
    const targetStr = lastLoad > 0 ? `around ${r0(lastLoad * 1.08)} TRIMP (a 5–10% step-up)` : 'modestly more than last week';
    return [
        `Increase load modestly — target ${targetStr}.`,
        'Include one tempo run: 25–40 min at lactate-threshold pace (comfortably hard, controlled breathing).',
        'Complete your weekly long run — extend by 1–2 km from last week if energy permits.',
        'Monitor fatigue: if TSB drops below −15, insert an easy day before the next quality session.'
    ];
}
function buildRecoveryPrescription() {
    return [
        'Easy runs only this week — no tempo, threshold, or interval sessions.',
        'Keep heart rate below your easy zone ceiling for every session.',
        'Let your ACWR ratio come back to the optimal range (0.8–1.3) before adding load.',
        'If any session feels harder than expected, cut it short without hesitation.'
    ];
}
function buildBasePrescription(summary) {
    const targetCount = summary?.activityCount ?? 4;
    return [
        'Keep all easy runs genuinely easy — heart rate at or below your easy zone ceiling for the full effort.',
        `Aim for ${targetCount} sessions this week, prioritizing consistency over intensity.`,
        'Introduce quality work only when rested: one optional tempo or strides session if TSB is above 0.',
        'Focus on aerobic base development — volume and consistency now will pay off in the build phase.'
    ];
}
// ─── keySignal builder ────────────────────────────────────────────────────────
function buildKeySignal(injury, pred, load, phase) {
    // Priority 1 — injury risk spike
    if (injury.category === 'caution' || injury.category === 'high-risk') {
        const acwrNote = injury.acwr !== null ? ` (ACWR ${injury.acwr.toFixed(2)})` : '';
        return `Training-load spike signal detected${acwrNote} — this week's load is significantly above ` + `your 4-week chronic average. Prioritize recovery before adding more volume.`;
    }
    // Priority 2 — gap to goal > 5 min behind
    if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds > 300) {
        return `Projected finish is ${formatGapTime(pred.gapToGoalSeconds)} behind your goal — ` + `targeted tempo sessions will build the race-pace fitness needed to close this gap.`;
    }
    // Priority 3 — CTL declining
    if (load.trend === 'declining') {
        return `Fitness (CTL ${r1(load.ctl)}) is declining — ` + `consistency this week is important to arrest the trend and rebuild your aerobic base.`;
    }
    // Priority 4 — TAPER (race is close)
    if (phase.phase === 'TAPER') {
        return `Race is ${phase.daysUntilRace} days away — fitness is locked in. ` + `Trust the taper, stay fresh, and focus on race-day execution.`;
    }
    // Default — TSB form status
    const tsb = load.tsb;
    const status = tsb > 10 ? 'fresh and well-recovered' : tsb > 0 ? 'well-balanced' : tsb > -10 ? 'moderately fatigued' : 'carrying significant accumulated fatigue';
    return `Training Stress Balance (TSB ${r1(tsb)}) indicates you are currently ${status}. ` + `${load.explanation}`;
}
// ─── warnings builder ─────────────────────────────────────────────────────────
function buildWarnings(injury, pred, load, phase) {
    const warnings = [];
    if (injury.category === 'caution' || injury.category === 'high-risk') {
        const acwrNote = injury.acwr !== null ? ` (ACWR ${injury.acwr.toFixed(2)})` : '';
        warnings.push(`Training-load spike${acwrNote} in the ${injury.category} range — ` + `reduce load before the next hard session.`);
    }
    if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds > 600) {
        warnings.push(`Current trajectory is ${formatGapTime(pred.gapToGoalSeconds)} behind goal — ` + `significant race-pace improvement is needed.`);
    }
    if (load.tsb < -15) {
        warnings.push(`TSB of ${r1(load.tsb)} indicates heavy fatigue — a recovery day is strongly recommended.`);
    }
    if (phase.daysUntilRace > 0 && phase.daysUntilRace <= 14) {
        warnings.push(`Race day is ${phase.daysUntilRace} days away — prioritize sleep, hydration, and race-day logistics.`);
    }
    return warnings.slice(0, 2);
}
// ─── suggestedFocus builder ───────────────────────────────────────────────────
function buildSuggestedFocus(injury, pred, load, phase) {
    if (injury.category === 'caution' || injury.category === 'high-risk') {
        return 'The priority this week is bringing your training-load spike signal down — ' + 'no hard sessions until the workload risk returns to the optimal range.';
    }
    if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds > 300) {
        return 'Focus on consistent quality sessions to build race-pace fitness — ' + 'the gap to your goal is closeable with targeted tempo work this week.';
    }
    if (phase.phase === 'TAPER') {
        if (pred.gapToGoalSeconds !== null && pred.gapToGoalSeconds <= 0) {
            return 'You are on track for your goal — stay consistent and trust the taper.';
        }
        return `Race is ${phase.daysUntilRace} days away — reduce volume, stay sharp, and trust your preparation.`;
    }
    if (phase.phase === 'PEAK') {
        return 'Focus on quality over quantity this week — your fitness is there, protect it with adequate recovery.';
    }
    if (phase.phase === 'BUILD') {
        return 'Continue progressive build this week — one tempo and one long run are the session priorities.';
    }
    if (phase.phase === 'RECOVERY') {
        return 'Protect recovery this week — easy efforts only, let your body absorb the recent training load.';
    }
    // BASE / UNSTRUCTURED / default
    if (load.tsb < -10) {
        return 'Consistency is the priority this week — keep efforts easy and let accumulated fatigue clear before adding intensity.';
    }
    return 'Build your aerobic base with consistent zone-2 running and gradual volume progression this week.';
}
function generateWeeklyBrief(input) {
    return {
        lastWeekReview: buildLastWeekReview(input.recentWeeklySummaries, input.currentInjuryRisk, input.recentClassifiedActivities),
        thisWeekPrescription: buildPrescription(input.currentPhase, input.currentInjuryRisk, input.recentWeeklySummaries),
        keySignal: buildKeySignal(input.currentInjuryRisk, input.racePrediction, input.currentTrainingLoad, input.currentPhase),
        warnings: buildWarnings(input.currentInjuryRisk, input.racePrediction, input.currentTrainingLoad, input.currentPhase),
        suggestedFocus: buildSuggestedFocus(input.currentInjuryRisk, input.racePrediction, input.currentTrainingLoad, input.currentPhase)
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/context.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAthleteIntelligenceContext",
    ()=>buildAthleteIntelligenceContext,
    "buildCoachContext",
    ()=>buildCoachContext,
    "estimateContextTokens",
    ()=>estimateContextTokens
]);
// ─── Central intelligence context builder ─────────────────────────────────────
//
// Single integration point for all six intelligence engines.
// Every API route and Claude call goes through this file.
// Never call individual engines directly from route handlers.
//
// Two exported functions:
//   buildAthleteIntelligenceContext(athleteId)
//     → Full context for the dashboard and all read API routes.
//       Runs all six engines and returns everything needed to render the product.
//
//   buildCoachContext(athleteId, activityId?)
//     → Compact context sent to Claude on every coaching API call.
//       Targets < 2,000 tokens before the system prompt and user message.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/db/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$training$2d$load$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/training-load.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$injury$2d$risk$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/injury-risk.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$periodization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/periodization.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$race$2d$prediction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/race-prediction.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$weekly$2d$brief$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/weekly-brief.ts [app-route] (ecmascript)");
;
;
;
;
;
;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPace(secPerKm) {
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm) % 60;
    return `${m}:${String(s).padStart(2, '0')}/km`;
}
function formatGoalTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor(totalSeconds % 3600 / 60);
    const s = totalSeconds % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
async function buildAthleteIntelligenceContext(athleteId) {
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 86_400_000);
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 86_400_000);
    const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 86_400_000);
    const twoWeeksAgo = new Date(now.getTime() - 2 * 7 * 86_400_000);
    // Parallel DB loads — athlete, goal race, summaries, memories
    const [athlete, goalRace, allSummaries, coachMemories] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].athlete.findUniqueOrThrow({
            where: {
                id: athleteId
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].goalRace.findFirst({
            where: {
                athleteId,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].weeklyTrainingSummary.findMany({
            where: {
                athleteId
            },
            orderBy: {
                weekNumber: 'asc'
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].coachMemory.findMany({
            where: {
                athleteId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        })
    ]);
    // Activities for the last 12 weeks, with laps for the classifier
    const activities = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].activity.findMany({
        where: {
            athleteId,
            startedAt: {
                gte: twelveWeeksAgo
            }
        },
        include: {
            laps: true
        },
        orderBy: {
            startedAt: 'asc'
        }
    });
    const last12Summaries = allSummaries.slice(-12);
    // ── Engine 1: training load ───────────────────────────────────────────────
    const trainingLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$training$2d$load$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeTrainingLoad"])(activities.map((a)=>({
            startedAt: a.startedAt,
            trainingLoad: a.trainingLoad
        })));
    // ── Engine 2: injury risk ─────────────────────────────────────────────────
    const injuryRisk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$injury$2d$risk$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeInjuryRisk"])(activities.map((a)=>({
            startedAt: a.startedAt,
            trainingLoad: a.trainingLoad
        })), last12Summaries);
    // ── Engine 3: training phase ──────────────────────────────────────────────
    const periodizationSummaries = last12Summaries.map((s)=>({
            weekNumber: s.weekNumber,
            weekStartDate: s.weekStartDate,
            totalLoad: s.totalLoad,
            qualitySessionCount: s.qualitySessionCount,
            ctl: s.ctl,
            atl: s.atl,
            tsb: s.tsb,
            acwr: s.acwr
        }));
    // Fallback race date if no goal race: 90 days from now
    const raceDateForPhase = goalRace?.raceDate ?? new Date(now.getTime() + 90 * 86_400_000);
    const phase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$periodization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectTrainingPhase"])({
        goalRaceDate: raceDateForPhase,
        weeklySummaries: periodizationSummaries,
        currentInjuryRisk: injuryRisk,
        currentTrainingLoad: trainingLoad,
        recentActivities: activities.filter((a)=>a.startedAt >= fourWeeksAgo).map((a)=>({
                startedAt: a.startedAt,
                workoutType: a.workoutType,
                trainingLoad: a.trainingLoad
            })),
        referenceDate: now
    });
    // ── Engine 4: race prediction ─────────────────────────────────────────────
    let racePrediction;
    if (goalRace) {
        const engineGoalRace = {
            raceName: goalRace.raceName,
            raceDate: goalRace.raceDate,
            distanceMeters: goalRace.distanceMeters,
            goalTimeSeconds: goalRace.goalTimeSeconds
        };
        const recentForPrediction = activities.filter((a)=>a.startedAt >= eightWeeksAgo).map((a)=>({
                startedAt: a.startedAt,
                distanceMeters: a.distanceMeters,
                movingTimeSeconds: a.movingTimeSeconds,
                avgPaceSecPerKm: a.avgPaceSecPerKm,
                workoutType: a.workoutType,
                executionEvaluation: a.executionEvaluation
            }));
        const summariesForPrediction = last12Summaries.filter((s)=>s.weekStartDate >= eightWeeksAgo).map((s)=>({
                weekNumber: s.weekNumber,
                weekStartDate: s.weekStartDate,
                totalLoad: s.totalLoad
            }));
        racePrediction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$race$2d$prediction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["predictRaceTime"])({
            goalRace: engineGoalRace,
            recentActivities: recentForPrediction,
            weeklySummaries: summariesForPrediction,
            currentTrainingLoad: trainingLoad,
            currentPhase: phase
        });
    } else {
        racePrediction = {
            predictedTimeSeconds: 0,
            predictedTimeFormatted: '—',
            confidenceLow: 0,
            confidenceLowFormatted: '—',
            confidenceHigh: 0,
            confidenceHighFormatted: '—',
            confidenceScore: 10,
            gapToGoalSeconds: null,
            gapToGoalFormatted: '—',
            explanation: 'No active goal race set.',
            whatNeedsToHappen: 'Set a goal race to enable race prediction.',
            dataQualityNotes: [],
            bestEffortActivity: null
        };
    }
    // ── Engine 5: weekly brief ────────────────────────────────────────────────
    const recentClassifiedActivities = activities.filter((a)=>a.startedAt >= twoWeeksAgo).map((a)=>({
            startedAt: a.startedAt,
            distanceMeters: a.distanceMeters,
            movingTimeSeconds: a.movingTimeSeconds,
            avgPaceSecPerKm: a.avgPaceSecPerKm,
            workoutType: a.workoutType,
            executionEvaluation: a.executionEvaluation
        }));
    const briefGoalRace = goalRace ? {
        raceName: goalRace.raceName,
        raceDate: goalRace.raceDate,
        distanceMeters: goalRace.distanceMeters,
        goalTimeSeconds: goalRace.goalTimeSeconds
    } : {
        raceName: 'No race set',
        raceDate: new Date(now.getTime() + 90 * 86_400_000),
        distanceMeters: 21097.5,
        goalTimeSeconds: null
    };
    const briefInput = {
        recentWeeklySummaries: last12Summaries.slice(-4),
        currentInjuryRisk: injuryRisk,
        currentPhase: phase,
        currentTrainingLoad: trainingLoad,
        racePrediction,
        goalRace: briefGoalRace,
        recentClassifiedActivities
    };
    const weeklyBrief = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$weekly$2d$brief$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateWeeklyBrief"])(briefInput);
    // ── Recent activities for display ─────────────────────────────────────────
    const recentActivities = [
        ...activities
    ].reverse().slice(0, 10).map((a)=>({
            id: a.id,
            date: a.startedAt.toISOString().slice(0, 10),
            workoutType: a.workoutType,
            executionEvaluation: a.executionEvaluation,
            distanceKm: Math.round(a.distanceMeters / 100) / 10,
            durationMinutes: Math.round(a.durationSeconds / 60),
            avgHR: a.avgHeartRate,
            trainingLoad: a.trainingLoad
        }));
    return {
        athlete,
        goalRace,
        trainingLoad,
        injuryRisk,
        phase,
        racePrediction,
        weeklyBrief,
        recentActivities,
        weeklySummaries: last12Summaries,
        coachMemories
    };
}
async function buildCoachContext(athleteId, activityId) {
    // Step 1: full intelligence context
    const ctx = await buildAthleteIntelligenceContext(athleteId);
    // Step 2: selected activity (if provided)
    let selectedActivity = null;
    if (activityId) {
        const act = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].activity.findUnique({
            where: {
                id: activityId
            }
        });
        if (act) {
            selectedActivity = {
                date: act.startedAt.toISOString().slice(0, 10),
                workoutType: act.workoutType,
                distanceKm: Math.round(act.distanceMeters / 100) / 10,
                durationMinutes: Math.round(act.durationSeconds / 60),
                avgHR: act.avgHeartRate,
                avgPaceFormatted: formatPace(act.avgPaceSecPerKm),
                executionEvaluation: act.executionEvaluation,
                executionNote: act.workoutTypeExplanation,
                trainingLoad: act.trainingLoad
            };
        }
    }
    // Steps 3 & 4: conversation history and memories — parallel
    const [rawMessages, memories] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].coachMessage.findMany({
            where: {
                conversation: {
                    athleteId
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 8
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].coachMemory.findMany({
            where: {
                athleteId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 3
        })
    ]);
    // Chronological order, filter system messages
    const conversationHistory = rawMessages.reverse().filter((m)=>m.role !== 'SYSTEM').map((m)=>({
            role: m.role === 'USER' ? 'user' : 'assistant',
            content: m.content
        }));
    // Concatenate memory summaries in chronological order
    const memorySummary = memories.length > 0 ? [
        ...memories
    ].reverse().map((m)=>m.summary).join('\n\n') : null;
    // HR zone derivation from stored maxHR / restingHR
    const maxHR = ctx.athlete.maxHeartRate ?? 185;
    const restingHR = ctx.athlete.restingHeartRate ?? 52;
    const easyHRCeiling = Math.round(maxHR * 0.785) // Zone 2 upper bound (~78–79 %)
    ;
    const thresholdHR = Math.round(maxHR * 0.919) // Lactate threshold (~92 % max HR)
    ;
    // Step 5: assemble compact context
    const context = {
        athlete: {
            name: ctx.athlete.name,
            thresholdHR,
            easyHRCeiling,
            restingHR
        },
        goalRace: ctx.goalRace ? {
            name: ctx.goalRace.raceName,
            raceDate: ctx.goalRace.raceDate.toISOString().slice(0, 10),
            distanceKm: ctx.goalRace.distanceMeters / 1000,
            goalTimeFormatted: ctx.goalRace.goalTimeSeconds ? formatGoalTime(ctx.goalRace.goalTimeSeconds) : '—',
            daysUntilRace: ctx.phase.daysUntilRace
        } : null,
        fitness: {
            ctl: ctx.trainingLoad.ctl,
            atl: ctx.trainingLoad.atl,
            tsb: ctx.trainingLoad.tsb,
            acwr: ctx.injuryRisk.acwr,
            acwrCategory: ctx.injuryRisk.category,
            trend: ctx.trainingLoad.trend,
            phase: ctx.phase.phase,
            phaseConfidence: ctx.phase.confidence,
            daysUntilRace: ctx.phase.daysUntilRace
        },
        injuryRisk: {
            category: ctx.injuryRisk.category,
            explanation: ctx.injuryRisk.explanation,
            recommendedAction: ctx.injuryRisk.recommendedAction,
            contributingFactors: ctx.injuryRisk.contributingFactors
        },
        racePrediction: ctx.racePrediction.predictedTimeSeconds > 0 ? {
            predictedTimeFormatted: ctx.racePrediction.predictedTimeFormatted,
            confidenceScore: ctx.racePrediction.confidenceScore,
            gapToGoalFormatted: ctx.racePrediction.gapToGoalFormatted,
            whatNeedsToHappen: ctx.racePrediction.whatNeedsToHappen
        } : null,
        weeklyBrief: {
            lastWeekReview: ctx.weeklyBrief.lastWeekReview,
            thisWeekPrescription: ctx.weeklyBrief.thisWeekPrescription,
            keySignal: ctx.weeklyBrief.keySignal,
            warnings: ctx.weeklyBrief.warnings,
            suggestedFocus: ctx.weeklyBrief.suggestedFocus
        },
        selectedActivity,
        recentActivities: ctx.recentActivities.map((a)=>({
                date: a.date,
                workoutType: a.workoutType,
                distanceKm: a.distanceKm,
                executionEvaluation: a.executionEvaluation,
                trainingLoad: a.trainingLoad
            })),
        conversationHistory,
        memorySummary
    };
    // Step 6: token estimate warning
    const tokenCount = estimateContextTokens(context);
    if (tokenCount > 2500) {
        console.warn(`[Pacer] Coach context exceeds 2,500 estimated tokens (${tokenCount}) — ` + `consider compressing conversation history`);
    }
    return context;
}
function estimateContextTokens(context) {
    return Math.round(JSON.stringify(context).length / 4);
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/schemas/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiResponseSchema",
    ()=>ApiResponseSchema,
    "apiError",
    ()=>apiError,
    "apiSuccess",
    ()=>apiSuccess,
    "createTypedApiResponseSchema",
    ()=>createTypedApiResponseSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const ApiResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('success', [
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(true),
        data: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(false),
        error: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        code: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })
]);
function createTypedApiResponseSchema(dataSchema) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('success', [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(true),
            data: dataSchema
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(false),
            error: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
            code: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    ]);
}
function apiSuccess(data) {
    return {
        success: true,
        data
    };
}
function apiError(error, code) {
    return {
        success: false,
        error,
        ...code ? {
            code
        } : {}
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/app/api/weekly-brief/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
// GET /api/weekly-brief
//
// Returns the deterministic weekly coaching brief plus a summary card
// of the key signals that drove it.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/db/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$context$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/intelligence/context.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/schemas/api.ts [app-route] (ecmascript)");
;
;
;
;
const dynamic = 'force-dynamic';
async function GET() {
    // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
    const athlete = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].athlete.findFirst();
    if (!athlete) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiError"])('No athlete data found. Run npx prisma db seed first.'), {
            status: 404
        });
    }
    try {
        const ctx = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$intelligence$2f$context$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAthleteIntelligenceContext"])(athlete.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiSuccess"])({
            brief: ctx.weeklyBrief,
            summary: {
                weeklyLoad: ctx.trainingLoad.weeklyLoad,
                acwr: ctx.injuryRisk.acwr,
                phase: ctx.phase.phase,
                daysUntilRace: ctx.phase.daysUntilRace,
                racePredictionGap: ctx.racePrediction.gapToGoalFormatted
            }
        }));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to compute intelligence context',
            ...("TURBOPACK compile-time truthy", 1) ? {
                details: msg
            } : "TURBOPACK unreachable"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10994ab._.js.map