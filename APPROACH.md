# APPROACH.md — Pacer

## What I Built

Pacer is a web-based AI coaching workspace built on top of the same data Strava already collects, extending six intelligence dimensions that are confirmed absent from Strava's current Athlete Intelligence feature. It ships as a complete vertical slice: one demo athlete, a deterministic 12-week half-marathon training block seeded into Supabase, and every page functional from that seeded data without requiring a Strava account, Strava OAuth, or any external API key beyond optional Claude access. The six dimensions — periodization phase detection, conversational coaching with persistent memory, ACWR injury-risk forecasting, Riegel-formula race prediction with confidence intervals, a weekly coaching brief, and rule-based workout classification with execution evaluation — are all rooted in established sports science (Banister 1975, Riegel 1977, Gabbett 2016) rather than marketing-copy heuristics. Every numeric output is computed from the seeded database, not hardcoded.

---

## Why This Problem

Strava's Athlete Intelligence, as described by Strava's own product team and confirmed by their forum community, is a post-activity commentary feature. After you complete a run, it generates a paragraph describing what happened: effort level, pace consistency, a trend sentence if there are enough prior activities. Community feedback on the Strava Labs forum characterizes it plainly as "prose layered on top of your data points" and "no more than a statistical analysis." That characterization is accurate. The feature is backward-looking and read-only. It describes a completed workout; it does not synthesize training history, flag emerging problems, or answer the questions a runner actually needs answered heading into race week.

The architectural failure is specific: Strava built a describer, not a coach. A describer consumes one activity and produces commentary about that activity. A coach consumes a training block — weeks of accumulated data — and reasons about trajectory, risk, and decisions. These are different systems with different data models and different output shapes. Pacer is the second design problem. The intelligence engines compute over 12 weeks of structured training history and produce actionable outputs: "Your ACWR is 1.337 — a training-load spike has been detected. Consider reducing volume for the next 3–5 days." "Your projected half-marathon finish is 1:53:19, 1:41 ahead of goal pace." "This easy run was executed at threshold effort — the workout classifier flagged a zone mismatch." These outputs do not exist in Strava's current product.

---

## The Six Intelligence Dimensions

**1. Periodization-Aware Training Phase Detection**

Strava knows you ran today. It does not know what week of your training plan today represents or how that changes what the run meant. Pacer's phase detector classifies the current week as BASE, BUILD, PEAK, TAPER, or RECOVERY using five signals evaluated in priority order: days until the goal race (calendar anchor), recent load trajectory (7-day EMA direction), load vs prior 3-week average (sudden drops flag RECOVERY), quality session count (intensity frequency distinguishes BUILD from BASE), and injury-risk category with TSB (ACWR > 1.3 with TSB < -15 forces RECOVERY regardless of calendar position). RECOVERY overrides everything; TAPER is calendar-anchored. The rule order matters: in week 8 of the seeded dataset, a deliberate load spike (ACWR = 1.337, load 33% above chronic baseline) triggers RECOVERY despite the calendar placing the athlete in what would otherwise be BUILD. With the reference date of 2026-05-03 and the race on 2026-08-02 (91 days out), the live seeded data returns RECOVERY. Synthetic unit tests in `validate:periodization` confirm all five phases fire correctly under their respective conditions.

**2. Conversational Coaching with Persistent Memory**

Strava commentary is read-only. Pacer supports a persistent streaming conversation where the coach has full intelligence context loaded before every message. The context is compact — pre-computed PMC signals, current phase, ACWR category, race prediction, and recent workout classifications serialized into under 2,000 tokens — rather than raw GPS streams, which would consume the entire context window and tell Claude almost nothing useful. The conversation backend uses `anthropic.messages.stream()` with `export const runtime = 'nodejs'` and `export const maxDuration = 60`. History is bounded to the last 8 turns; the system prompt carries a `memorySummary` field for older context. Two deterministic fallback paths handle Claude unavailability: if `ANTHROPIC_API_KEY` is absent, the route prepends a `__FALLBACK__\n` sentinel and streams a response from `buildDeterministicCoachingResponse()` — a rule-based coaching reply derived entirely from the pre-computed signals. If Claude fails mid-stream, the catch block streams the fallback text after any partial tokens already delivered. A sessionStorage bridge (`coach_prefill_question`, `coach_activity_id`) carries context from activity detail, weekly brief, race goal, and dashboard pages directly into the first coach message.

The coach interface uses named sessions — a `CoachSession` model (sidebar-ordered by `updatedAt`) rather than the raw `CoachConversation` model. Each session has its own isolated `conversationHistory` in `buildCoachContext`: when a `sessionId` is provided, the message query is scoped to `{ sessionId }` instead of the global `{ conversation: { athleteId } }`. `CoachMemory`, however, stays global per athlete — a coaching insight extracted from a session on Monday is surfaced in system prompts for sessions on Wednesday. This is the correct trade-off: conversation privacy (each session has its own history) vs. coaching continuity (the coach always has the athlete's full durable context). Sessions are auto-named from the first 40 characters of the opening message; the user can rename them inline or delete them. Existing messages were backfilled to a "Legacy" session via a data migration so no history was lost.

**3. ACWR Injury-Risk Forecasting**

Strava does not compute Acute:Chronic Workload Ratio and does not flag load spikes. Pacer uses the Gabbett ACWR formula rather than the ATL/CTL-derived ratio because the Gabbett formula compares "what I did this week" to "what I normally do per week" — both at the same weekly scale. ATL/CTL compares a 7-day EMA to a 42-day EMA; during a build phase, ATL consistently exceeds CTL, so the ratio stays above 1.0 throughout most of a training block, making it a poor spike detector. Gabbett targets the specific event — a sudden load jump above an established chronic baseline — that correlates with workload spikes in the sports-science literature (Gabbett 2016, Hulin et al 2016). The formula: acute = current week's TRIMP total; chronic = arithmetic mean of the 4 immediately preceding complete weeks. Thresholds: underload < 0.8, optimal 0.8–1.3, caution 1.3–1.5, high-risk > 1.5. In the seeded dataset, week 8 produces ACWR = 1.337 (caution), triggered by the deliberate load spike embedded in the training block. Language throughout uses "risk signal," "training-load spike," "caution range," "higher-risk pattern" — no medical claims, no injury probability statistics.

**4. Race Prediction with Confidence Intervals**

Strava does not project race finish times. Pacer uses the Riegel endurance formula (`T2 = T1 × (D2/D1)^1.06`) applied to the best qualifying effort (lowest avg pace from TEMPO, LONG_RUN, or RACE activities ≥ 5 km in the last 8 weeks) and extrapolated to the goal race distance. Two transparent adjustments stack on top: a TSB fatigue/freshness multiplier (TSB < -10 adds 2%, TSB > 5 subtracts 2%) and a taper bonus (TAPER phase within 21 days of race subtracts 1%). In the seeded demo, the best qualifying effort is a 9 km TEMPO on 2026-04-16 at 5:16/km. Riegel extrapolation to 21.1 km gives a raw projection; the TSB freshness adjustment (TSB = 7.8, subtracting 2%) produces the final prediction of 1:53:19. The confidence band starts at ±4% and is widened when the best effort is under 8 km (×1.15) or narrowed when training has been consistent over 4 weeks (×0.90) or during taper (×0.95). The confidence score (0–100) is built from a 70-point base with bonuses for long qualifying efforts (+15 if ≥ 10 km) and consistency (+10) and penalties for short efforts (-20) and few qualifying activities (-10). All adjustments are surfaced in the UI with their reasoning. Gap analysis computes the delta to the goal time; in the demo, the athlete is 1:41 ahead of the 1:55:00 goal.

**5. Weekly Coaching Brief**

Strava produces per-activity commentary. It does not synthesize weekly training status into a structured brief. Pacer's `generateWeeklyBrief()` produces five deterministic sections — last week review, this week's prescription, the key signal, warnings, and suggested focus — entirely from the pre-computed intelligence context, with no Claude call required. Claude can be invoked to elaborate on or rewrite the brief via the coach interface, but the core brief is testable, reproducible, and functional when Claude is unavailable. This matters for two reasons: it means the feature degrades gracefully without an API key, and it means the brief can be validated by `validate:weekly-brief` against a known schema rather than against Claude's probabilistic output. The key signal and week prescription are phase-appropriate — a RECOVERY week brief prescribes easy runs only and cites the actual TRIMP numbers from the prior week. A sessionStorage bridge carries the keySignal into the coach chat as a prefilled question.

**6. Workout Type Classification with Execution Evaluation**

Strava labels workouts by sport type (run, ride, swim). It does not classify workout intent within a sport or evaluate whether the workout was executed as intended. Pacer's rule-based classifier identifies workout type from pace, average heart rate, distance, and HR-to-pace ratio: EASY, RECOVERY, STEADY_STATE, TEMPO, THRESHOLD, INTERVAL, LONG_RUN, RACE. Classification accuracy against intended workout type is 85.2% across 54 seeded activities. The key addition is execution evaluation: an assessment of whether the athlete ran the workout as intended. Enum values — `MATCHED_INTENT`, `WELL_EXECUTED`, `TOO_HARD`, `TOO_EASY`, `UNEVEN_EXECUTION` — are stored in the database and used by `buildFollowUpQuestion()` to generate routing-appropriate coach questions. In week 4, a scheduled EASY run was seeded with avg HR 157 bpm against an easy ceiling of 145 bpm; the classifier detects the zone mismatch and returns `executionEvaluation = TOO_HARD`, triggering the zone warning callout in the activity detail UI.

---

## Technical Architecture

**Stack:** Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4 + shadcn/ui, Prisma v6 (pinned — see §Prisma v6 Decision), Supabase Postgres (pooled connection for runtime, direct connection for CLI migrations), Anthropic Claude API (`claude-sonnet-4-6` default, overridable via `ANTHROPIC_MODEL` env), Vercel.

**Unified intelligence context:** The central abstraction is `buildAthleteIntelligenceContext(athleteId)`. Every page in the app needs some version of the same signals — training phase, ACWR, race prediction, recent workout types. Computing these independently per route would produce duplicated logic, inconsistent results, and redundant database roundtrips per page load. The context builder computes everything once and returns a typed object covering athlete profile, current phase (with confidence and coaching implication), training load (ATL, CTL, TSB, ACWR, trend), injury risk (category, ACWR value, contributing factors, recommended action), race prediction (projected time, confidence band, gap to goal, adjustment notes), and recent workouts. `buildCoachContext(athleteId, activityId?)` extends this with the bounded conversation history, a memory summary for older turns, and optional activity detail when `activityId` is provided.

**Thin route handlers:** Route files authenticate, extract parameters, call one function from `src/lib`, and return the result. No database queries in routes, no computation, no conditional logic beyond null guards. All business logic lives in `src/lib/intelligence`, `src/lib/coach`, `src/lib/demo`, `src/lib/db`, and `src/lib/schemas`. React components fetch from API routes and render what they receive — they do not import from `src/lib` directly and do not compute signals.

**Training load engine:** The Banister Performance Management Chart uses two exponential moving averages updated daily. ATL (Acute Training Load): time constant τ = 7 days, decay factor `k = e^(-1/7) ≈ 0.8669`. CTL (Chronic Training Load): time constant τ = 42 days, decay factor `k = e^(-1/42) ≈ 0.9765`. The 7/42 pairing is the standard adopted by TrainingPeaks, Garmin Connect, and WKO, originally validated on competitive cyclists (Banister 1975, Coggan and Allen early 2000s) and widely applied to running. TSB = CTL - ATL; positive TSB means the athlete is fresh. Training load (TRIMP) uses the Banister formula: `TRIMP = duration_min × HRR × 0.64 × e^(1.92 × HRR)` where HRR is Heart Rate Reserve fraction. The exponential weight makes high-intensity work disproportionately heavier than easy work — at HRR = 0.65 (easy aerobic) the multiplier is ≈1.43, at HRR = 0.90 (threshold) it is ≈3.34.

**Token budget for Claude:** The system prompt serializes the entire `CoachContext` into structured text targeting under 2,000 tokens — pre-computed signals, current phase, ACWR status, race prediction summary, recent workout classifications, and the athlete's HR zone configuration. `estimateContextTokens` (chars ÷ 4) is validated in `validate:context`; the seeded demo context produces 1,235 estimated tokens, well within the 2,500 budget ceiling. Conversation history is bounded to the last 8 turns fetched by `buildCoachContext`. Older context is summarized into `memorySummary` rather than included verbatim. Raw per-second GPS streams are never sent to Claude.

**Claude-powered memory extraction:** After each successful Claude streaming turn, a fire-and-forget secondary `anthropic.messages.create` call (max_tokens: 150) determines whether the conversation contained durable coaching context — injury history, training preferences, schedule constraints, personal goals. If so, a `CoachMemory` record is persisted and surfaced in the system prompt `memorySummary` for future sessions. The extraction uses a tight prompt with explicit valid and invalid format examples (`"Athlete: ..."` required; preamble or missing colon is rejected via `startsWith('Athlete: ')`). The call is invoked with `void` and never blocks the streaming response — errors are caught silently.

**Server-side pagination on activities:** The `/api/activities` route accepts `page` and `limit` query parameters and returns `page`, `totalPages`, and `totalCount` alongside paginated results. URL state (`?page=N`) allows direct linking to specific pages, making the week 4 zone-mismatch run on page 2 consistently addressable for the reviewer demo flow.

**Deterministic fallback with sentinel detection:** `buildDeterministicCoachingResponse()` generates a coaching reply from the pre-computed intelligence context signals without any AI call. Two paths trigger it: (1) Gap 2A — if `ANTHROPIC_API_KEY` is absent (`!apiKey || apiKey.trim() === ''`), the route prepends `__FALLBACK__\n` and streams the fallback word-by-word before any Claude call is attempted; (2) Gap 2B — if the Claude API throws `Anthropic.AuthenticationError` (HTTP 401, detected via `instanceof` check in the catch block), the sentinel is prepended before the fallback tokens. Non-authentication errors stream the fallback without a sentinel, preserving any partial Claude content already in the client buffer. The frontend detects the sentinel on the first line and marks the message with a "Computed analysis" badge instead of "Powered by Claude."

**Production Hardening**
Six production-readiness fixes were applied based on a post-build audit: (1) user message character limit (4,000 chars max) on the coaching endpoint to prevent runaway context window abuse, (2) prompt injection guard added to the system prompt, (3) `vercel.json` configured with automated `prisma migrate deploy && prisma generate` in the build command to prevent cold-deploy 500 errors, (4) `AbortController` 15-second timeouts on all frontend fetch calls to prevent indefinite loading states on cold Vercel starts, (5) terrain disclaimer added to the race prediction page clarifying the flat-course Riegel assumption, (6) `maybeExtractMemory` pre-filter added to skip Claude extraction calls for short low-signal messages, reducing API cost ~60-70% at scale.

---

## The Generated Training Dataset

If the demo required a real Strava account with actual training history, every reviewer would get a different experience — or no experience at all if they don't run, or run casually without a structured training block. The intelligence dimensions require a specific shape of data: a load spike for ACWR caution, varied workout types for classification, long runs for race prediction, a full periodization arc for phase detection. Reviewer reliability required solving this at the data layer.

The population system generates a deterministic 12-week half-marathon training block for one demo athlete (Alex Chen, goal race: SF Half Marathon 2026-08-02, goal time: 1:55:00). The block follows a realistic periodization arc: weeks 1–3 BASE (zone 2 aerobic foundation, long runs 10–13 km), weeks 4–7 BUILD (tempo runs, progression runs, long runs to 18 km), weeks 8–10 PEAK (highest load, threshold intervals, 21 km long run), weeks 11–12 TAPER (volume drops 30% then 50%, one quality session per week). A weekly summary record is computed and stored for each week with TRIMP totals, quality session counts, CTL/ATL/TSB snapshots, and the ACWR value.

Two deliberate imperfections are embedded: (1) A week 8 load spike where the ACWR reaches 1.337, placing the athlete in the caution category and triggering the injury-risk signal — this exercises ACWR forecasting and creates a meaningful warning state rather than a trivially optimal training history. (2) A week 4 EASY run seeded with avg HR 157 bpm against an easy ceiling of 145 bpm and avg pace 5:05/km against a zone 2 ceiling — this exercises execution evaluation and produces the `TOO_HARD` classification that drives the zone warning callout in the activity detail page. Both imperfections are intentional and documented in the seed.

TCX export serializes each activity as valid Garmin Training Center XML for optional Strava upload — not required for the demo, but available as a compatibility path and as evidence that the generated data is realistic enough to pass format validation. Seed idempotency is guaranteed via a `seedHash` field on each activity record; re-running the seed script upserts rather than duplicates.

---

## Prisma v6 Decision

Prisma v7 introduced four breaking changes that are non-trivial to absorb simultaneously in a time-boxed build. First, datasource configuration: v7 changes how the `datasource db` block works and, for some connection modes, requires explicit driver adapters. The v6 pattern — `url = env("DATABASE_URL")` for the pooled runtime connection, `directUrl = env("DIRECT_URL")` for the direct CLI migration connection — is clean, stable, and well-documented for Supabase. Second, client imports: v7 changes the generated client import path and initialization pattern, requiring mechanical updates across every file that instantiates PrismaClient. Third, environment loading: v7 changes when and how `DATABASE_URL` is resolved, particularly in serverless environments, introducing runtime startup differences that are hard to predict without testing. Fourth, seed behavior: v7 removes `package.json#prisma.seed` in favor of `prisma.config.ts` — a config migration that sits on top of the three changes above.

None of these are insurmountable in isolation. All four together, in a single take-home build, introduce compounding risk with no payoff relative to the task. Prisma v6.19 is stable, production-capable, and has a clear Supabase + Vercel integration path that is well-tested and documented. The `package.json#prisma.seed` deprecation warning that late v6 builds emit is acceptable — it is a warning, not an error, caused by Prisma v7 moving the config format, not by anything broken in v6 behavior. Pinning to v6 was deliberate dependency management, not avoidance of new technology. A production continuation of this project would schedule the v7 migration as a standalone task with proper testing time — not as a side effect of a feature build.

---

## How I Used AI Tools

**Claude Code** handled the backend: Prisma schema design, the deterministic training block generator in `src/lib/demo`, all six intelligence engines in `src/lib/intelligence`, the Zod schema layer, every API route, the coach context builder and system prompt, the streaming coach route, the validation scripts (`validate:seed`, `validate:training-load`, `validate:classifier`, `validate:injury-risk`, `validate:periodization`, `validate:race-prediction`, `validate:weekly-brief`, `validate:context`, `validate:tcx`), and this documentation.

**Cursor** handled the frontend: all page components, the streaming chat UI, the `ConfidenceIntervalBar`, `ACWRZoneBar`, `PhaseCard`, and `WeeklyBriefPage` implementations, the sessionStorage bridge pattern across pages, loading/empty/error states, and visual polish passes.

**This Claude.ai session** (planning and review tier): product thesis framing, architecture decisions before implementation, critical review of implementation choices against the product goals, and the feature audit documented in `docs/FEATURE_AUDIT.md`.

The decisions AI could not make: the product thesis (Strava built a describer; the right problem is a coach), the choice to use Gabbett ACWR rather than ATL/CTL-derived ratio for spike detection (this required reading and evaluating the sports-science literature, not just knowing that ACWR exists), the coaching context architecture (what goes into the system prompt, what stays out, how to bound history without losing continuity), the system prompt design (the balance between context richness and token budget), and every scope decision about what to cut.

Moments I overrode AI output:

The **INTERVAL classifier 3-lap minimum.** The classifier initially lacked a minimum-lap guard — with a 1-lap threshold, multi-effort tempo sessions with two hard splits were misclassified as INTERVAL. Raising the minimum to 3 laps required understanding what an interval session structurally is (repeated short efforts with recovery, not a single hard effort split in two) and confirming the fix with `validate:classifier` (which now finds 6 qualifying INTERVAL activities).

**Schema alignment — 12 type mismatches.** After the six intelligence engines were built, a dedicated Claude.ai review prompt compared engine return types against the Zod schemas side-by-side. It surfaced 12 type mismatches — fields typed as `string` where the engine returned `number`, optional fields missing from the schema, enum values not matching the database enum. Each required understanding the downstream impact before deciding whether to tighten the schema or change the engine output. All 12 were patched before the route layer was built on top.

**Prisma v6 pin.** This was a judgment call made explicitly against what Cursor and Claude Code both defaulted to — both would have installed the latest version and needed explicit instruction to stay on v6.

**Memory extraction prompt correction.** The initial extraction prompt produced "Athlete prefers morning runs..." (no colon after "Athlete") because the prompt's own example text used that format. Claude followed the example rather than the instruction. Adding explicit valid/invalid format examples and changing the check from `startsWith('Athlete:')` to `startsWith('Athlete: ')` (with trailing space) resolved the false-negative rate.

**Authentication error detection.** The initial fallback trigger used heuristic key validation (`apiKey.length < 20`). Replacing it with `instanceof Anthropic.AuthenticationError` in the catch block made the detection type-safe and SDK-native — no brittle string checks, no false positives on valid keys that happen to be short.

**Server-side pagination.** The activities list initially used a load-more pattern. After observing that reviewers needed to navigate to specific workouts in the 54-activity dataset, it was replaced with proper server-side pagination (`page`/`limit`/`totalPages`) with URL state, so the zone-mismatch week 4 run on page 2 is consistently addressable by URL.

---

## What I Intentionally Cut

**Mobile app.** The web app is responsive but not a native app. The intelligence and coaching work equally well on mobile web. A native app adds significant build complexity for no intelligence gain in a one-week take-home scope.

**Multi-user and authentication.** One demo athlete, hardcoded in the seed. The architecture is built around `athleteId` so multi-user is an additive extension — add auth middleware, session management, and database isolation — but the current build has no authentication system. This was a deliberate scope decision, not an oversight.

**HRV and sleep integration.** HRV and sleep quality are valuable training signals. Incorporating them requires Garmin Connect, Apple Health, or Oura API integration — each a separate integration project. The ACWR signal provides a reasonable recovery-status proxy from data Strava already collects.

**Training plan generation.** The coach can advise on the current plan but does not generate a new structured training plan. Plan generation requires building progression logic, workout-type ratios, and recovery constraints — a distinct feature layer above the current intelligence stack, and one that carries more coaching liability.

**Strava OAuth import.** The architecture separates data ingestion from intelligence — the same engines run identically whether data arrived via the seed script or the Strava API. But Strava OAuth is not implemented. Reviewer evaluation does not require it.

**Matched activity comparison and physiological drift detection.** This would have been a seventh intelligence dimension (a "stretch D7" from the original product spec). Time constraints and scope discipline prevented reaching it.

---

## What Breaks First Under Pressure

**Strava API rate limits on import (100 non-upload/15min).** The architecture supports Strava as an alternative data path, but the rate limit means a full historical import requires pagination across hours. The current seed script is a better demo path; Strava import would need a queue with backoff.

**CTL underestimation for athletes with history longer than 12 weeks.** The 42-day time constant means CTL takes roughly 6 weeks to converge from a cold start. The seeded 12-week block covers this adequately, but an athlete who imports 2+ years of Strava history would see CTL computed accurately, while an athlete who starts fresh has a 4-6 week blind period where CTL underestimates true fitness. The system currently does not communicate this cold-start artifact to the user.

**Workout classifier accuracy at 85.2%.** The misclassifications are exclusively label errors (LONG_RUN classified as EASY in taper weeks), not execution evaluation errors — the coaching signal that matters (TOO_HARD, WELL_EXECUTED, MATCHED_INTENT) is correct on all 54 activities. The fix would require injecting periodization phase context into the classifier, creating a dependency cycle that was intentionally avoided in this architecture. Late taper long runs (weeks 11–12) misclassify as EASY because the taper distance shrinks below the long-run detection threshold, pulling them into the easy HR + moderate distance zone. This is expected and documented in `docs/FEATURE_AUDIT.md` — it is a consequence of a purely rule-based classifier without periodization context — but it is a real accuracy ceiling.

**Claude API costs at conversation scale.** The 8-turn history bound and 2,000-token system prompt keep per-message costs manageable in the demo, but a production coaching product with thousands of daily active users and long conversation histories would need a more aggressive summarization strategy.

**Token budget is estimated, not exact.** `estimateContextTokens` uses character count divided by 4 as a proxy for token count. This is a standard approximation but can be off by ±20% for content with unusual character distributions. The 2,500-token ceiling includes enough buffer that this is not currently a problem, but a production system should use the Anthropic token-counting API for accurate measurement.

**Cold Vercel starts on the dashboard.** `buildAthleteIntelligenceContext` runs 6 intelligence engines and 4+ DB queries synchronously. On a cold Vercel serverless start, this takes 4-8 seconds. A 30-second in-memory cache with TTL would reduce p95 latency to cold-start time only — not yet implemented.

---

## What I Would Build Next

**Strava OAuth import with idempotent activity sync.** The architecture is already separated — wiring up a real OAuth flow populates the same Prisma tables the intelligence engines read from. The generated data path stays as demo and fallback.

**Multi-athlete with proper authentication.** The `athleteId` abstraction makes this largely additive: auth middleware, Iron Session for per-user session management, database-level data isolation. The intelligence layer does not need to change.

**Physiological drift detection.** Compare current training responses (HR at a given pace) to baseline responses from earlier in the training block. Detecting that easy pace is getting easier at the same HR is the most actionable signal you can give a runner, and Strava has all the data for it.

**HRV and sleep correlation via Garmin Connect or Apple Health.** Cross-referencing ACWR with recovery metrics would substantially improve the injury-risk signal and allow the coach to distinguish "ACWR is high because you trained hard" from "ACWR is high and you also slept poorly — back off."

**Weekly brief push delivery.** The brief is already generated deterministically server-side; delivery via email or push notification is a pipeline question. An athlete who opens Pacer once per week after their long run would benefit most from a push rather than a pull.

---

## Live URL

[Vercel URL — to be added after deployment]
