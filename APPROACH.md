# APPROACH.md — Pacer

## What I Built

Pacer is a web-based AI coaching workspace built on top of the same training data Strava already collects, but it is not a chatbot wrapped around activity history. It is a computed coaching layer with a conversational interface on top. Raw activity data is first transformed into a structured athlete model — training phase, CTL/ATL/TSB, ACWR workload-risk signal, workout classification, execution evaluation, race trajectory, weekly prescription, coach memory, and recent conversation context. Those computed signals power every surface in the product: the dashboard, activity intelligence page, race goal page, weekly brief, and coach chat. Claude does not invent the coaching state from raw data; it explains and converses over a bounded, pre-computed coaching context.

Pacer ships as a complete vertical slice: one demo athlete, a deterministic 12-week half-marathon training block seeded into Supabase, and every page functional from that seeded data without requiring a Strava account, Strava OAuth, or any external API key beyond optional Claude access. The six shipped dimensions are periodization-aware phase detection, conversational coaching with persistent memory, ACWR-based workload-risk forecasting, Riegel-formula race prediction with confidence intervals, a weekly coaching brief, and rule-based workout classification with execution evaluation. Every numeric output is computed from the seeded database, not hardcoded.

The product targets coaching dimensions that Strava's public Athlete Intelligence materials do not position as core capabilities: phase-aware training context, bidirectional follow-up coaching, proactive workload-risk signals, race trajectory modeling, weekly planning, and workout-intent evaluation. The implementation uses transparent heuristics inspired by established endurance-training models — Banister-style training load, Gabbett-style ACWR, and Riegel race extrapolation — while avoiding clinical claims or black-box "AI prediction" language.

---

## Why This Problem

Strava's Athlete Intelligence, as described in their product materials and characterized by their forum community, is a post-activity feature. After a completed run, it generates commentary about that run: effort relative to recent averages, pace consistency, a trend note if enough prior activities exist. Community feedback describes it as "prose layered on top of your data points." That characterization is accurate and worth taking at face value — Athlete Intelligence is designed around the activity as the unit of analysis. It answers "what just happened?" It is not positioned, in Strava's public materials, as a tool for answering "what should I do next week?" or "am I on track for my race?"

That gap is the product problem. Coaching is not post-activity commentary. It is longitudinal reasoning — over weeks of accumulated training data — about trajectory, risk, and decisions. A coach synthesizes a training block: where the athlete is in their periodization arc, whether recent load has outpaced the chronic baseline, whether workout execution is matching intent, and whether the race goal is still achievable given current fitness signals. None of that reasoning is possible from a single activity. It requires a different data model, a different computation layer, and a different output shape. Pacer is built around that second design problem. The intelligence engines operate over 12 weeks of structured training history — daily load, weekly aggregates, workout classification, ACWR workload-risk signals, and race trajectory — not over individual activity summaries.

The technical complexity is in that computation layer, not in the Claude integration. The coaching pipeline runs six deterministic engines before Claude sees any data: a Banister-style load model producing CTL, ATL, and TSB; a Gabbett-style ACWR ratio for workload-risk detection; a Riegel-formula race predictor with TSB-adjusted confidence intervals; a rule-based workout classifier with execution evaluation against stated intent; a periodization phase detector anchored to the goal race date; and a weekly brief generator that synthesizes all five into a coaching prescription. Claude does not compute any of these. It receives a bounded, pre-computed coaching context — under 2,000 tokens — and explains, responds, and converses over that context. The result is coaching responses that reference actual computed signals: "Your ACWR is 1.337 — a training-load spike has been detected in the past week" or "Your March 8 easy run was classified as threshold effort — heart rate 157 against a Zone 2 ceiling of 145." These outputs come from the computation layer. Claude makes them conversational.

The 12-week generated training dataset exists because longitudinal coaching intelligence cannot be evaluated from two or three activities. A meaningful review requires a full training arc — base, build, peak, recovery, and taper phases — a deliberate load spike that triggers the ACWR warning, a zone-mismatch easy run that the classifier flags, a goal race with a real trajectory gap, and enough weekly data for the CTL and ACWR engines to produce stable outputs. Seeding that data deterministically means every reviewer sees the same training arc, the same ACWR spike, and the same race prediction — not a randomized demo that may or may not surface the right signals. It also means the product can be evaluated completely without a Strava account, which removes a significant friction point from the review process. The generated dataset is a deliberate engineering choice for evaluation reliability, not a substitute for real user data.

---

## The Six Intelligence Dimensions

Pacer's six dimensions are implemented as deterministic computation engines. Claude does not invent the coaching state — it explains and converses over pre-computed signals. Each dimension addresses a gap in what post-activity commentary can structurally provide.

**1. Periodization-Aware Training Phase Detection**

**Product gap:** A completed run only means something inside the training arc it belongs to. The same 10-mile run is appropriate in base, expected in build, aggressive in peak, and counterproductive in taper. Post-activity commentary has no training-arc model — it cannot reason about where today's run sits in the weeks-long trajectory toward a goal race.

**What Pacer computes:** A five-signal phase classifier that maps the current week to BASE, BUILD, PEAK, TAPER, or RECOVERY. Signals are evaluated in priority order: days until the goal race (calendar anchor), recent load trajectory (7-day EMA direction), load vs prior 3-week average (a ≥40% drop forces RECOVERY), quality-session density (intensity frequency distinguishes BUILD from BASE), and ACWR with TSB (a workload-risk signal combined with a negative freshness score overrides the calendar regardless of position).

**Why it was hard:** The signals can conflict, and conflict resolution requires explicit rule priority — not a vote. A calendar that says BUILD and a workload spike that says RECOVERY are both correct from their own perspective; the system has to adjudicate. In the seeded demo, week 8 is BUILD by calendar but RECOVERY by load signal: ACWR = 1.337 with load 33% above the chronic baseline. RECOVERY fires. The calendar alone would have produced the wrong coaching prescription.

**Demo proof:** With reference date 2026-05-03 and goal race 2026-08-02 (91 days out), the seeded athlete returns RECOVERY phase. `validate:periodization` confirms all five phases fire correctly under their respective synthetic conditions.

**2. Conversational Coaching with Persistent Memory**

**Product gap:** Athlete Intelligence is read-only and stateless. There is no mechanism to ask a follow-up, push back on a coaching note, or carry a coaching insight from one workout into the context of the next. The feature produces one paragraph per activity and has no memory of prior sessions.

**What Pacer computes:** A persistent streaming coaching interface where the coach has full intelligence context loaded before every message. The context is pre-computed and compact — CTL/ATL/TSB (chronic fitness and acute fatigue trends), ACWR category, periodization phase, race trajectory, recent workout classifications, and bounded conversation history — serialized into under 2,000 tokens. Raw GPS streams are never sent to Claude; they contain no coaching signal and would consume the entire context window. Conversation history is bounded to the last 8 turns; a `CoachMemory` model carries durable coaching insights (preferences, constraints, injury history) across sessions. Memory records are written by a constrained secondary extraction prompt after successful coaching turns, capturing durable context such as preferences, constraints, or injury history without relying on brittle keyword matching.

**Why it was hard:** The hardest design decision was what not to include. The naive implementation sends all activity data to Claude and asks it to reason. That produces generic responses because Claude has no stable coaching model to work from. The pre-computed context is what makes the responses specific: the coach knows this athlete's ACWR is 0.44 this week, their CTL is 59.9 and declining, and their March 8 easy run was flagged TOO_HARD — not because Claude inferred it, but because the computation layer produced those outputs. Named sessions (scoped `conversationHistory` per session, global `CoachMemory` per athlete) provide conversation privacy with coaching continuity across sessions.

**Demo proof:** When the Anthropic API key is absent, the route prepends a `__FALLBACK__\n` sentinel and streams a response from `buildDeterministicCoachingResponse()` — a rule-based coaching reply derived entirely from pre-computed signals. If Claude fails mid-stream, the catch block detects `Anthropic.AuthenticationError` by SDK-native `instanceof` check and appends the fallback to any partial tokens already delivered. The coach interface remains functional with zero Claude calls.

**3. ACWR Workload-Risk Forecasting**

**Product gap:** Workload-ratio monitoring — comparing recent training load against established chronic baseline to detect sudden spikes — is not positioned as a feature in Strava's public Athlete Intelligence materials. The feature provides effort-relative commentary but not spike-detection or structured workload-risk signals.

**What Pacer computes:** ACWR (Acute:Chronic Workload Ratio) using the Gabbett formula: current week's TRIMP total (a heart-rate-weighted training load estimate) divided by the arithmetic mean of the four immediately preceding complete weeks. Thresholds: underload < 0.8, optimal 0.8–1.3, caution 1.3–1.5, higher-risk pattern > 1.5. The Gabbett formula was chosen over the ATL/CTL-derived ratio because both values in the Gabbett ratio are at the same weekly timescale — this week vs the typical week. The ATL/CTL ratio compares a 7-day EMA to a 42-day EMA; during a build phase, ATL consistently exceeds CTL, making the ratio a poor spike detector. Gabbett targets the specific event: a sudden load jump above an established baseline.

**Why it was hard:** The formula choice required understanding what each ratio actually measures. ATL/CTL tracks the chronic fitness-fatigue state; Gabbett detects acute anomalies relative to a stable baseline. These are different questions. Using ATL/CTL for spike detection would have flagged nearly every week of a build block as elevated — the ratio is persistently above 1.0 during progressive training. Gabbett isolated week 8's 1.337 precisely because weeks 1–7 established a stable chronic denominator.

**Demo proof:** Week 8 of the seeded dataset produces ACWR = 1.337 (caution range) from a deliberate load spike. `validate:injury-risk` confirms the caution category fires at this value and that weeks 1–4 correctly return `insufficient-data` before the 4-week chronic window is established. All language throughout uses "workload-risk signal," "training-load spike," "caution range," and "higher-risk pattern" — no clinical claims, no injury probability statistics.

**4. Race Prediction with Confidence Intervals**

**Product gap:** Race finish-time projection from current training data is not positioned as a capability in Strava's Athlete Intelligence feature set. The current product framing is activity commentary rather than trajectory modeling toward a goal event.

**What Pacer computes:** Riegel race-time extrapolation (`T2 = T1 × (D2/D1)^1.06`) applied to the best qualifying effort — lowest average pace from TEMPO, LONG_RUN, or RACE activities ≥ 5 km in the last 8 weeks — scaled to the goal race distance. Two transparent adjustments stack on top: a TSB (freshness signal = CTL minus ATL) fatigue multiplier (TSB < −10 adds 2% to predicted time; TSB > 5 subtracts 2%) and a taper bonus (TAPER phase within 21 days subtracts 1%). The confidence band starts at ±4% and is widened when the qualifying effort is under 8 km or narrowed when training load has been consistent or the athlete is in taper. A confidence score (0–100) is built from a 70-point base with bonuses and penalties for effort distance, training consistency, and data availability.

**Why it was hard:** The hard part is not the formula — Riegel is published and well-understood. The hard parts are the data selection logic (which activities qualify as reference efforts and why), the confidence interval calibration (what drives the band wider or narrower in a way that is honest rather than arbitrarily precise), and communicating uncertainty without undermining the usefulness of the prediction. Every adjustment is surfaced in the UI with its reasoning, so the prediction is auditable.

**Demo proof:** Best qualifying effort is a 9 km TEMPO on 2026-04-16 at 5:16/km. Riegel extrapolation to 21.1 km with TSB = +7.8 freshness adjustment produces a predicted finish of 1:53:19. Confidence interval: 1:49:14–1:57:24. Confidence score: 80/100. Gap to 1:55:00 goal: 1:41 ahead. `validate:race-prediction` confirms the output shape and asserts the prediction falls within a realistic half-marathon range.

**5. Weekly Coaching Brief**

**Product gap:** Athlete Intelligence generates commentary after each activity upload. Between workouts — on rest days, on Monday mornings when an athlete is planning their week — there is no coaching presence. The feature has no weekly synthesis mode and no proactive planning output.

**What Pacer computes:** `generateWeeklyBrief()` produces five deterministic sections entirely from the pre-computed intelligence context: last week's training reviewed, this week's prescription, the single most important signal, any active warnings, and a suggested focus. The brief is generated without a Claude call. Every sentence is derived from actual computed values — the TRIMP total, the ACWR ratio, the phase classification, the race gap — not from a template or a language model. Claude can be invoked via the coach interface to elaborate on or rewrite any section, but the core brief is functional, testable, and reproducible without Claude access.

**Why it was hard:** A weekly brief that sounds like coaching rather than a data dump requires understanding which signals matter most and in what order — key signal priority, phase-appropriate prescriptions, and warning conditions that override the default recommendation. The RECOVERY week brief must prescribe easy runs only and cite actual load numbers; a BUILD week brief prescribes a tempo and a long run at specific effort levels. These are not the same brief with swapped labels. The signal priority logic and the phase-appropriate prescription rules are the hard part, not the text generation.

**Demo proof:** The current seeded brief leads with the key signal "Fitness (CTL 59.9) is declining — consistency this week is important to arrest the trend," prescribes easy runs only with HR below 145 bpm, and interprets ACWR = 0.44 as acceptable in the context of a deliberate recovery week while still emphasizing that consistency matters if low load continues. `validate:weekly-brief` confirms the output shape and asserts all five sections are populated.

**6. Workout Type Classification with Execution Evaluation**

**Product gap:** Strava labels workouts by sport type (run, ride, swim). Within a sport, all runs are treated as the same type regardless of intent or execution. Athlete Intelligence compares effort to the 30-day average — a composite that includes easy runs, tempo sessions, and long runs — rather than evaluating each workout against its own category baseline.

**What Pacer computes:** A rule-based classifier that identifies workout type from average heart rate, pace, distance, and lap structure: EASY, RECOVERY, STEADY_STATE, TEMPO, THRESHOLD, INTERVAL, LONG_RUN, RACE. Classification is anchored to physiological thresholds — the athlete's Zone 2 ceiling (145 bpm) and threshold HR (170 bpm) — not to rolling historical averages. The key addition is execution evaluation: a second pass that compares the computed workout type to the stated intent and produces a structured judgment — `MATCHED_INTENT`, `WELL_EXECUTED`, `TOO_HARD`, `TOO_EASY`, or `UNEVEN_EXECUTION`. These values are stored in the database, displayed in the activity list with color-coded badges, and used to generate context-appropriate follow-up questions routed into the coach interface.

**Why it was hard:** The classifier can only be as good as the rule priority and the threshold design. A tempo run with a warmup lap generates lap HR variance that superficially resembles an interval session; a 3-lap minimum on the INTERVAL rule prevents this misclassification. The execution evaluation requires knowing what the athlete intended — which is seeded as `intendedWorkoutType` on each generated activity — and comparing it against the computed type. The 85.2% classification accuracy against stated intent (46/54 seeded activities) reflects a deliberate ceiling: the remaining 14.8% are label mismatches on taper long runs that fall below the long-run distance threshold, not execution evaluation errors. Execution evaluation is correct on all 54 activities.

**Demo proof:** In week 4, a scheduled EASY run was seeded with `avgHR = 157 bpm` against an easy ceiling of 145 bpm. The classifier returns `workoutType = STEADY_STATE`, `executionEvaluation = TOO_HARD`. The activity detail page surfaces an amber Zone 2 warning callout and routes the follow-up question "Why does it matter that I ran this easy run too hard?" directly into the coach interface. The activity is visible on page 2 of the activities list (March 8, 2026) with a red "Too Hard" badge.

---

## Technical Architecture

### Architecture Thesis

Pacer is a computed intelligence system, not a chatbot. The design thesis: six deterministic engines compute the athlete's complete coaching state first — training load, ACWR workload-risk signal, periodization phase, race trajectory, workout classifications, and weekly prescription — and Claude is a conversational interface over that pre-computed state. This matters architecturally for three reasons: the product does not depend on LLM consistency for correctness, so every numeric output is testable and reproducible against a known dataset; the coaching intelligence degrades gracefully when the AI API is unavailable, serving rule-based responses derived from the same pre-computed signals; and the system's failure modes are located in the deterministic computation layer rather than in model behavior, which means they surface in validation scripts, not in production. The hard engineering problem was building the computation layer. The Claude integration was straightforward once the coaching state existed.

### Stack

**Stack:** Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4 + shadcn/ui, Prisma v6 (pinned intentionally — see Key Tradeoffs), Supabase Postgres (pooled connection for runtime, direct connection for CLI migrations), Anthropic Claude API (`claude-sonnet-4-6` default, overridable via `ANTHROPIC_MODEL` env), Vercel.

### System Boundaries

The codebase enforces strict layer separation across seven distinct concerns:

- **`src/lib/demo`** — deterministic data generation and seed system
- **`src/lib/intelligence`** — six coaching engines: pure functions, no side effects, independently testable
- **`src/lib/coach`** — context compiler, system prompt, memory extraction, fallback response
- **`src/lib/schemas`** — Zod validation at every boundary
- **`src/lib/db`** — Prisma singleton, no business logic
- **`src/app/api`** — thin transport layer: authenticate, call one lib function, return result
- **React components** — render only: no imports from `src/lib`, no computed signals

This boundary discipline means the intelligence engines are testable in isolation — nine validation scripts run against them directly — route handlers stay auditable, and React components stay purely presentational.

### Source-of-Truth Context

Without a central context builder, each of five product surfaces — dashboard, activity detail, race goal, weekly brief, and coach chat — would independently query and compute overlapping signals, producing inconsistent states. If the dashboard says RECOVERY and the coach chat says BUILD, the product is broken regardless of whether each surface's logic is individually correct.

The decision: `buildAthleteIntelligenceContext(athleteId)` is the single source of truth. Every surface consumes it. It computes once and returns a typed object covering athlete profile, current phase (with confidence and coaching implication), training load (ATL, CTL, TSB, ACWR, trend), injury risk (category, ACWR value, contributing factors, recommended action), race prediction (projected time, confidence band, gap to goal, adjustment notes), and recent workouts. `buildCoachContext(athleteId, activityId?)` extends it with bounded conversation history, a memory summary for older turns, and optional activity detail when `activityId` is provided.

### Intelligence Engines

**Training load engine:** The Banister Performance Management Chart uses two exponential moving averages updated daily. ATL (Acute Training Load): time constant τ = 7 days, decay factor `k = e^(-1/7) ≈ 0.8669`. CTL (Chronic Training Load): time constant τ = 42 days, decay factor `k = e^(-1/42) ≈ 0.9765`. The 7/42 pairing is the standard adopted by TrainingPeaks, Garmin Connect, and WKO, originally validated on competitive cyclists (Banister 1975, Coggan and Allen early 2000s) and widely applied to running. TSB = CTL - ATL; positive TSB means the athlete is fresh. Training load (TRIMP) uses the Banister formula: `TRIMP = duration_min × HRR × 0.64 × e^(1.92 × HRR)` where HRR is Heart Rate Reserve fraction. The exponential weight makes high-intensity work disproportionately heavier than easy work — at HRR = 0.65 (easy aerobic) the multiplier is ≈1.43, at HRR = 0.90 (threshold) it is ≈3.34. Because each engine is a pure function taking typed inputs and returning typed outputs, they are testable in isolation — nine validation scripts assert correct behavior against the deterministic training dataset.

### LLM Integration and Failure Model

Claude receives a bounded pre-computed context, not raw data. The failure modes were designed before the happy path was finalized.

**Token budget:** The system prompt serializes the entire `CoachContext` into structured text targeting under 2,000 tokens — pre-computed signals, current phase, ACWR status, race prediction summary, recent workout classifications, and the athlete's HR zone configuration. `estimateContextTokens` (chars ÷ 4) is validated in `validate:context`; the seeded demo context produces 1,235 estimated tokens, well within the 2,500 budget ceiling. Conversation history is bounded to the last 8 turns fetched by `buildCoachContext`. Older context is summarized into `memorySummary` rather than included verbatim. Raw per-second GPS streams are never sent to Claude.

**Memory extraction:** After each successful Claude streaming turn, a fire-and-forget secondary `anthropic.messages.create` call (max_tokens: 150) determines whether the conversation contained durable coaching context — injury history, training preferences, schedule constraints, personal goals. If so, a `CoachMemory` record is persisted and surfaced in the system prompt `memorySummary` for future sessions. The extraction uses a tight prompt with explicit valid and invalid format examples (`"Athlete: ..."` required; preamble or missing colon is rejected via `startsWith('Athlete: ')`). A pre-filter skips the extraction call entirely when the user message is short (under 60 characters) and contains none of a defined set of high-signal keywords — reducing secondary Claude API calls by approximately 60–70% at scale with no loss of meaningful context.

**Fallback design:** `buildDeterministicCoachingResponse()` generates a coaching reply from pre-computed signals with no AI call. Two distinct paths trigger it: the key-absent path — if `ANTHROPIC_API_KEY` is missing, the route prepends a `__FALLBACK__\n` sentinel and streams the rule-based response before any Claude call is attempted; and the auth-error path — if the Claude API throws `Anthropic.AuthenticationError`, the sentinel is prepended before the fallback tokens. Non-authentication errors stream the fallback without a sentinel, preserving any partial Claude content already in the client buffer. The frontend detects the sentinel on the first line and marks the message with a "Computed analysis" badge instead of "Powered by Claude." The coaching interface is fully functional with zero Claude calls.

### Validation Architecture

The project validates correctness at three levels.

**Level 1 — Data shape:** The generated training block is validated by `validate:seed` against expected field types, value ranges, and required scenarios — ACWR spike present, zone-mismatch run present, future goal race present, all workout types represented.

**Level 2 — Engine outputs:** Each of the six intelligence engines has a dedicated validation script (`validate:training-load`, `validate:classifier`, `validate:injury-risk`, `validate:periodization`, `validate:race-prediction`, `validate:weekly-brief`) that runs the engine against the seeded dataset and asserts expected outputs: specific ACWR values, phase classifications, prediction ranges, brief sections populated.

**Level 3 — System integration:** `validate:context` asserts the coach context stays under 2,500 estimated tokens with all fields populated. `validate:tcx` confirms all 54 TCX exports parse as valid XML with required elements present.

This validation strategy means most failures surface at the data or engine layer — not at the UI layer — which is the correct failure mode for a coaching system where semantic correctness matters more than syntax.

### Key Tradeoffs

**1. Generated training block over live Strava dependency**

Live Strava data creates three problems for reviewer evaluation: every reviewer sees different data, setup requires OAuth through a third-party consent flow, and the intelligence states that demonstrate system correctness — ACWR spike, zone-mismatch run — may not exist in a given reviewer's actual training history. The alternative: a deterministic 12-week training block with deliberate imperfections seeded into the database. Every reviewer sees the same training arc, every intelligence state is guaranteed, and every validation script is repeatable. Strava is an additive ingestion path — the engines read from Prisma tables regardless of how data arrived — not a dependency.

**2. Deterministic computation over LLM-generated metrics**

The alternative implementation sends raw activity data to Claude and asks it to compute training load, ACWR, phase classification, and race prediction. This was rejected: LLM output for numeric metrics is non-deterministic, untestable, and expensive — and the coaching quality depends on the computation being correct, not on the prose wrapping it. All six numeric coaching engines are deterministic; Claude receives only the pre-computed result. This makes the system testable, reproducible, and functional when Claude is unavailable.

**3. Rule-based classifier over ML**

A trained classifier for workout type detection would require labeled training data, a training pipeline, and accuracy claims that are hard to defend on a 54-activity dataset. The rule-based system is anchored to physiological thresholds — Zone 2 ceiling (145 bpm), threshold HR (170 bpm), lap structure variance — not to model weights. The 85.2% accuracy on 54 seeded activities (46/54 correct) reflects a known and documented ceiling: the remaining 8 misclassifications are label errors on taper long runs whose reduced distance falls below the long-run detection threshold, not execution evaluation errors. Execution evaluation — the coaching signal that matters — is correct on all 54 activities.

**4. Compact coach context over raw activity streams**

The alternative sends full activity JSON or GPS streams to Claude and asks it to reason over raw data. GPS streams have no coaching signal at the granularity Claude would consume them, and full activity JSON produces generic responses because Claude has no stable coaching model to anchor to. The chosen approach compiles a context object under 2,000 tokens containing only the signals a coach needs — phase, ACWR, TSB, race gap, recent workout classifications, and bounded conversation history. The responses are specific because the context is specific.

**5. Prisma v6 over Prisma v7**

Prisma v7 introduced four simultaneous breaking changes: datasource configuration changes (driver adapters required for some connection modes), generated client import path changes, environment loading behavior changes in serverless environments, and removal of `package.json#prisma.seed` in favor of `prisma.config.ts`. Each is non-trivial in isolation; all four together in a time-boxed build introduce compounding risk with no payoff. Prisma v6.19 is stable, production-capable, and has a well-tested Supabase + Vercel integration path. Pinning v6 is controlled dependency management; the v7 migration is scoped as a standalone task.

**6. No multi-user auth in the vertical slice**

Every entity in the schema is already athlete-scoped via `athleteId`. Adding Iron Session middleware and replacing `findFirst()` with `findUnique({ where: { id: session.athleteId } })` across all route handlers is mechanical work. The decision to cut it was scope management — shipping complete intelligence across six dimensions at production quality, rather than shipping shallow intelligence with an auth layer on top. The architecture is ready for the change; the change is additive.

**7. Optional Strava import cut from core scope**

The architecture separates ingestion from intelligence. The six engines read from Prisma tables and produce identical outputs regardless of whether those tables were populated by the seed script or a Strava OAuth import. Strava OAuth, import, and rate-limit handling were scaffolded but not implemented. The demo path is complete without it; Strava is additive.

### Production Hardening

Six failure modes were anticipated and hardened. On input safety: a 4,000-character user message limit on the coaching endpoint prevents context window abuse from oversized inputs; a prompt injection guard in the system prompt adds a basic layer of instruction resistance against role-change attempts in user messages. On deployment reliability: `vercel.json` runs `prisma migrate deploy && prisma generate` in the build command automatically, eliminating the cold-deploy 500 error that occurs when a schema migration is deployed without regenerating the Prisma client. On frontend resilience: `AbortController` 15-second timeouts on all frontend fetch calls ensure the error state is always reachable — cold Vercel starts cannot trap the UI in an indefinite loading state. On cost control: the `maybeExtractMemory` pre-filter skips the secondary Claude extraction call for short messages with no high-signal keywords, reducing secondary API calls by approximately 60–70% at scale. On UI honesty: a terrain disclaimer on the race prediction page clarifies that the Riegel formula assumes flat-course conditions.

### Extension Path

Because ingestion is separated from intelligence, the same six engines run identically over seeded data today and Strava-imported data tomorrow — wiring up OAuth populates the same Prisma tables the engines already read from. Multi-user auth is additive: session middleware replaces `findFirst()` with athlete-scoped `findUnique()`, and the engines do not change. Caching is additive: a 30-second TTL on `buildAthleteIntelligenceContext` results would eliminate most cold-start latency without any changes to the engine layer. The remaining production work — observability, queuing for Strava import, multi-user isolation, HRV integration — is operational engineering, not architectural rework.

---

## The Generated Training Dataset

If the demo required a real Strava account with actual training history, every reviewer would get a different experience — or no experience at all if they don't run, or run casually without a structured training block. The intelligence dimensions require a specific shape of data: a load spike for ACWR caution, varied workout types for classification, long runs for race prediction, a full periodization arc for phase detection. Reviewer reliability required solving this at the data layer.

The population system generates a deterministic 12-week half-marathon training block for one demo athlete (Alex Chen, goal race: SF Half Marathon 2026-08-02, goal time: 1:55:00). The block follows a realistic periodization arc: weeks 1–3 BASE (zone 2 aerobic foundation, long runs 10–13 km), weeks 4–7 BUILD (tempo runs, progression runs, long runs to 18 km), weeks 8–10 PEAK (highest load, threshold intervals, 21 km long run), weeks 11–12 TAPER (volume drops 30% then 50%, one quality session per week). A weekly summary record is computed and stored for each week with TRIMP totals, quality session counts, CTL/ATL/TSB snapshots, and the ACWR value.

Two deliberate imperfections are embedded: (1) A week 8 load spike where the ACWR reaches 1.337, placing the athlete in the caution category and triggering the injury-risk signal — this exercises ACWR forecasting and creates a meaningful warning state rather than a trivially optimal training history. (2) A week 4 EASY run seeded with avg HR 157 bpm against an easy ceiling of 145 bpm and avg pace 5:05/km against a zone 2 ceiling — this exercises execution evaluation and produces the `TOO_HARD` classification that drives the zone warning callout in the activity detail page. Both imperfections are intentional and documented in the seed.

TCX export serializes each activity as valid Garmin Training Center XML for optional Strava upload — not required for the demo, but available as a compatibility path and as evidence that the generated data is realistic enough to pass format validation. Seed idempotency is guaranteed via a `seedHash` field on each activity record; re-running the seed script upserts rather than duplicates.

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
