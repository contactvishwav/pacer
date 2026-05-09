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

Requiring a real Strava account with actual training history would make reviewer evaluation non-deterministic. Different reviewers have different training histories — or none at all. More importantly, the intelligence dimensions require a specific longitudinal data shape: a periodization arc with distinct phases, a load spike that triggers the ACWR warning, varied workout types for the classifier, a long-run progression for race prediction, and a zone-mismatch easy run for execution evaluation. These states may not exist in a given reviewer's history, may exist in the wrong sequence, or may exist only partially. The decision to generate data was an evaluation reliability decision, not a shortcut.

The generator produces a deterministic 12-week half-marathon training block for demo athlete Alex Chen (goal: SF Half Marathon 2026-08-02, 1:55:00). The block follows a structured periodization arc: weeks 1–3 BASE (zone 2 aerobic foundation, long runs 10–13 km), weeks 4–7 BUILD (tempo runs, progression runs, long runs to 18 km), weeks 8–10 PEAK (highest load, threshold intervals, 21 km long run), weeks 11–12 TAPER (volume drops 30% then 50%, one quality session per week). The arc structure matters because each phase creates distinct signal conditions that exercise different parts of the intelligence pipeline. A monotonically easy training block would not test the ACWR engine, the phase detector, or the classifier in any meaningful way.

Two deliberate imperfections are embedded. First: a week 8 load spike where ACWR reaches 1.337, placing the athlete in the caution range — this exercises the ACWR workload-risk engine and creates a meaningful warning state visible on the dashboard. Second: a week 4 EASY run seeded with avg HR 157 bpm against an easy ceiling of 145 bpm — the classifier returns `executionEvaluation = TOO_HARD`, which triggers the Zone 2 warning callout in the activity detail page and routes a context-aware follow-up question into the coach interface. Both imperfections are documented in the seed and deterministic — they appear identically for every reviewer.

The generated dataset writes raw activity records and weekly training summaries into the database — not pre-computed intelligence outputs. The training phase, ACWR value, race prediction, weekly brief, and workout classifications are all computed live by the six intelligence engines from those database records on each request. Changing the seed data changes the engine outputs. This matters because it means the intelligence layer is being exercised for real, not bypassed by hardcoded UI values. A reviewer inspecting the code can follow the computation from the database record through the engine to the API response to the UI — nothing is faked.

Each generated activity is exported as a TCX file (Training Center XML — the format Garmin and Strava use for activity file exchange). This is not required for the demo but demonstrates that the generated data is realistic enough to pass format validation and could be uploaded to Strava via the Activities API as a future integration path. Seed idempotency is enforced via a `seedHash` field on the metadata record — re-running the seed script upserts rather than duplicates. Because data ingestion is fully separated from the intelligence engines, Strava OAuth import can write into the same Prisma tables the engines read from; the engines require no changes when the data source changes.

---

## How I Used AI Tools

### Workflow

The build was staged rather than open-ended. Each stage had a scoped prompt, an expected output, a validation step, and a commit checkpoint before the next stage began. The sequence in order: product thesis and scope definition before any code; architecture rules encoded in `AGENT_GUIDELINES.md` and `AGENT_GUIDELINES_SUMMARY.md` before any implementation prompt; Prisma schema design and migration; deterministic training dataset generation and seed validation; the six intelligence engines — one prompt per engine, one validation script per engine, one commit per engine; the API route layer; the coach context builder and streaming route; frontend surfaces in Cursor; validation and audit passes; and documentation and deployment readiness.

The goal was not to ask AI to "build an app." The goal was to constrain implementation through architecture guidelines, scoped prompts, validation scripts, and structured review passes so that the output matched a pre-defined system design rather than whatever the model would produce by default. `AGENT_GUIDELINES.md` and `AGENT_GUIDELINES_SUMMARY.md` were written before any implementation prompt and referenced at the start of every subsequent Claude Code session. The guidelines encoded: Prisma v6 pin, TCX over FIT policy, thin route handler rule, `src/lib` boundary discipline, cautious injury-risk language requirements, and the deterministic coaching fallback requirement. This was the mechanism for maintaining architectural consistency across a multi-session, multi-tool build.

### Tool Delegation

Claude Code was used for all backend work where multi-file consistency across a large codebase mattered: Prisma schema, the deterministic training block generator in `src/lib/demo`, all six intelligence engines in `src/lib/intelligence`, the Zod schema layer, every API route, the coach context builder and system prompt, the streaming coaching route with its two fallback paths, nine validation scripts, and all documentation. Claude Code was chosen here because it reasons across many files simultaneously and holds architectural context across a full session — the coaching route references the context builder which references all six engines, and Claude Code could navigate that dependency graph without losing coherence.

Cursor was used for all frontend surfaces where interactive iteration mattered more than cross-file consistency: all page components (dashboard, activities, activity detail, coach chat, race goal, weekly brief), the streaming chat UI consuming the SSE response token by token, the `ConfidenceIntervalBar` and `ACWRZoneBar` visualizations, the sessionStorage bridge pattern across pages, badge and card components, loading and empty and error states, and the product polish passes. Cursor was chosen here because the iteration loop for UI work — change a component, see the visual result, adjust — is faster with an IDE tool than with a terminal agent.

This Claude.ai session served as the planning and review layer: product thesis framing and validation before any code was written, architecture decision review (Prisma v6 vs v7, TCX vs FIT, Gabbett vs ATL/CTL, generated data vs live Strava), critical review of implementation outputs against the product goals, and the feature audit that became `docs/FEATURE_AUDIT.md`. This layer did not write code. It shaped the constraints that the implementation tools worked within. The full planning and review session is available at: [https://claude.ai/share/aedf5ea9-8171-4580-95f4-1d6ad9886739](https://claude.ai/share/aedf5ea9-8171-4580-95f4-1d6ad9886739)

### Where I Directed or Overrode AI Output

**Product thesis.** The model would have built a general fitness assistant or a Strava wrapper. The explicit constraint was: Strava built a post-activity describer; the right product is a training-block coach. This framing determined the scope, the six intelligence dimensions, and every subsequent architectural decision. Every prompt that followed was constrained by it.

**Architecture decision — deterministic engines before Claude.** The naive implementation sends raw activity data to Claude and asks it to reason about fitness. This produces non-deterministic, untestable, hallucination-prone results for a domain where numeric correctness matters. The constraint was explicit before any code was written: compute all coaching signals deterministically first; Claude receives only the pre-computed state. Every intelligence engine prompt enforced this, and it is the most consequential architecture decision in the system.

**Architecture decision — Gabbett ACWR over ATL/CTL ratio.** The model defaulted to the PMC-style ATL/CTL ratio as the spike-detection metric. This was overridden after evaluating what each formula actually measures: ATL/CTL tracks chronic fitness trend and stays elevated throughout a build block, making it a poor spike detector. Gabbett compares this week's load to the prior four-week baseline at the same weekly timescale, isolating acute anomalies precisely. The override required reading the Gabbett (2016) and Hulin (2016) papers, not just knowing that ACWR exists as a concept.

**Architecture decision — compact `CoachContext` over raw activity streams.** The model's first instinct was to include full activity JSON in the coaching prompt. This was overridden with a specific token budget (under 2,000 tokens), a defined set of fields (phase, ACWR, TSB, race gap, recent workout classifications, bounded conversation history), and the explicit rule that raw GPS streams are never sent to Claude. The responses are specific because the context is specific — this is an engineering constraint, not a model capability.

**Architecture decision — generated training block over live Strava dependency.** The model would have built toward a Strava import flow as the primary data path. The decision to use a deterministic generated dataset was made before any code was written and encoded in `AGENT_GUIDELINES.md`. The reasoning: live Strava data makes reviewer evaluation non-deterministic, requires OAuth setup, and may not contain the specific data shapes — load spike, zone-mismatch run, full periodization arc — needed to exercise every intelligence dimension. Strava is additive; the deterministic dataset is the evaluation-reliability foundation.

**Architecture decision — TCX over FIT for generated activities.** The model defaulted to generating FIT files. FIT is a binary format that requires an encoder library and produces opaque output that is hard to validate. TCX is XML — human-readable, supports HR, cadence, GPS, laps, and timestamps, accepted by Strava, and validatable with a standard XML parser. This was a two-line policy change in `AGENT_GUIDELINES.md` that prevented an entire category of debugging risk.

**Dependency decision — Prisma v6 pin.** Both Claude Code and Cursor defaulted to installing the latest Prisma version. Prisma v7 introduced four simultaneous breaking changes: datasource configuration format, driver adapter requirement, generated client import path, and seed behavior. In a time-boxed build, absorbing all four simultaneously introduces compounding risk with no payoff. Prisma v6 was pinned explicitly in the first prompt and enforced throughout via `AGENT_GUIDELINES.md`.

**Correction — INTERVAL classifier 3-lap minimum.** The initial classifier had no minimum-lap guard. Tempo sessions with a warmup lap generated enough lap HR variance to trigger the INTERVAL rule. The fix required understanding what an interval session structurally is — repeated short efforts with recovery laps, not a single hard effort split across two segments — and adding a 3-lap minimum threshold. The `validate:classifier` script surfaced the misclassification.

**Correction — 12 schema-to-engine type mismatches.** After the six engines were built, a dedicated review pass compared engine return types against the Zod schemas side-by-side. It surfaced 12 type mismatches: enum values that didn't align, nullable fields typed as non-nullable, confidence values typed as float where the engine returned a string enum. Claude Code had generated the schemas and the engines in separate prompts without checking alignment. Each mismatch required a judgment call — tighten the schema or change the engine output — before the route layer was built on top.

**Correction — memory extraction prompt format.** The initial extraction prompt included the example "Athlete prefers morning runs..." without a colon. Claude followed the example rather than the instruction and produced outputs that failed the `startsWith('Athlete: ')` check silently — no memories were written. The fix was adding explicit valid and invalid format examples to the prompt and tightening the check to include the trailing space. The root cause was that the extraction prompt was an AI output itself; reviewing it with the same rigor as code outputs caught the bug.

**Correction — authentication error detection.** The initial fallback trigger used heuristic key validation (`apiKey.length < 20`). This is not robust — key formats can change, and length thresholds are arbitrary. Replaced with `instanceof Anthropic.AuthenticationError` in the catch block: SDK-native, type-safe, no false positives on valid keys that happen to be short.

**Correction — server-side pagination.** The activities list initially fetched all 54 activities at once with a load-more button. After observing that reviewers needed to navigate to specific workouts by URL — specifically the week 4 zone-mismatch run on page 2 — it was replaced with proper server-side pagination: `page`/`limit`/`totalPages` in the API response, URL state via `useSearchParams`, and Previous/Next controls in the UI.

### How I Used AI to Improve Quality

After each major implementation stage, a structured audit prompt was run against the completed work before moving forward. The feature audit reviewed all six intelligence dimensions against a checklist: backend engine file present, API route wired, frontend surface rendering correctly, seeded data demonstrating the feature, and a passing validation script. It found and fixed one regression — the dashboard Coach CTA question pills navigated to the coach page but discarded the question text, producing blank sessions — before any reviewer saw the product. The backend schema review pass found the 12 type mismatches between engine outputs and Zod schemas before any frontend code was built on top of them. The production readiness audit produced `docs/PRODUCTION_AUDIT.md` and identified six fixes applied before submission. Each audit was scoped to the current state against the original architecture constraints — it surfaced gaps, it did not generate new features.

### What AI Could Not Decide

The model could generate code given a well-specified prompt. It could not own: the product thesis — what kind of product Pacer is, and what distinguishes it from a chatbot with activity data attached; the coaching model — which signals belong in the context, which stay out, and why; the boundary between deterministic computation and LLM explanation — the most consequential architecture decision in the system; the data shape the generated training block needed to create — what imperfections to seed and which features they exercise; what to cut from scope and why — no multi-user auth, no native app, optional Strava, no HRV or sleep integration; which injury-risk claims were safe to make and how to phrase them so they are useful without being medical claims; and which production gaps were acceptable for a finished vertical slice versus which would need to be addressed before real users. These decisions required product judgment, domain knowledge, and an understanding of what a Luma engineering team would actually evaluate — none of which the model could infer from a prompt.

---

## What I Intentionally Cut

Pacer is a finished vertical slice across six intelligence dimensions, not a finished product. The cuts below were made deliberately: each feature is real and valuable, but each would have traded depth in the core coaching intelligence for breadth across engineering concerns that are independent of whether the intelligence approach works. The goal was to prove the thesis completely, not to sketch it broadly.

### Native Mobile App

The web application is fully responsive and functional on mobile browsers. A native iOS or Android app would not change what the intelligence engines compute — the coaching state, ACWR signals, race prediction, and weekly brief are identical regardless of rendering surface. The functional difference is zero. The difference is visual and ergonomic: a 375px phone viewport makes it genuinely hard to present multi-card coaching dashboards, confidence interval range bars, and activity intelligence panels in a way that feels designed rather than compressed. The dashboard was built for the information density a coaching product requires, and that density reads best on a larger screen. A native app would allow surface-specific layout decisions — a bottom-tab coach interface, a glanceable widget for ACWR and phase, swipe-through activity cards — that a responsive web layout cannot replicate without compromising the desktop experience. This is a rendering and distribution decision, not an intelligence decision. The computation layer requires no changes.

### Multi-User Authentication

Every entity in the schema is already scoped by `athleteId`. The multi-user extension is mechanical: add Iron Session middleware, replace the current `findFirst()` calls with `findUnique({ where: { id: session.athleteId } })`, and add OAuth flow management. The intelligence engines, context builder, and API routes require no changes. This was cut because shipping shallow auth with deep intelligence gaps would have been a worse demonstration than deep intelligence with no auth. A reviewer evaluating whether the coaching approach works does not need multi-user isolation.

### Live Strava OAuth Import

The architecture separates ingestion from intelligence. The six coaching engines read from Prisma tables regardless of how data arrived — from the seed script or from a Strava import pipeline. Wiring up Strava OAuth, the activities endpoint, stream fetching, and rate-limit handling is real engineering work but it is plumbing, not intelligence. The Strava API also introduces review friction: OAuth setup, rate-limit windows, and data shape variability that depends on what the reviewer has actually run. The generated training block solves the reviewer-reliability problem directly. Strava is an additive ingestion path, not a prerequisite.

### Background Jobs and Queue Infrastructure

Historical imports, weekly brief delivery, and long-running data sync operations would eventually require background job infrastructure — queues, retries, exponential backoff, dead-letter handling, and job status visibility. The current seeded review path is deterministic and synchronous, so none of this is needed for the vertical slice. Adding a job queue before proving the intelligence approach works would be premature infrastructure. This is a deployment and reliability concern, not a coaching concern.

### Production Observability

A real coaching service at scale would require structured logging, error tracking, model latency and cost dashboards, ingestion failure alerts, and distributed tracing. The current submission uses nine validation scripts, a deterministic fallback path for Claude unavailability, frontend fetch timeouts, and documented smoke tests. These cover the failure modes that matter for a single-athlete review environment. Sentry, OpenTelemetry, and cost dashboards are additive operational concerns that have no bearing on whether the coaching intelligence is correct.

### Weekly Brief Push and Email Delivery

The weekly brief is already generated server-side on request without a Claude call. Delivering it proactively — via email, push notification, or calendar integration — is an engagement and retention decision, not an intelligence decision. An athlete who opens Pacer once a week would benefit more from a push than a pull interaction model. This was cut because the harder engineering problem was making the brief deterministic, phase-appropriate, and useful — not delivering it through a pipeline. The delivery layer is additive once the content layer is proven.

The cuts above share a common logic: each involves real engineering work that is independent of whether the core thesis — that computed coaching signals over a training block produce more useful coaching than per-activity commentary — is correct. Proving the thesis required depth across six intelligence dimensions, a reliable evaluation environment, a validated computation layer, and a polished interface. Breadth across auth, integrations, delivery pipelines, and observability would have diluted all of that without proving anything new. The architecture leaves most of these extensions additive; the intelligence work would not need to be redone.

---

## What Breaks First Under Pressure

This section is a production risk map, not a list of missing features. It documents where a finished vertical slice would fail first when serving real athletes at scale, what the current implementation already does to reduce each risk, and what the remaining production gap is. Several items have received meaningful hardening after the initial build — those mitigations are noted — but a production gap remains in each case.

### 1. Multi-User Authentication and Data Isolation

**Why it breaks first:** The current implementation uses `findFirst()` with no authentication. Every API call returns the seeded demo athlete. The first real user would see their data mixed with or replaced by the demo athlete's data.

**Current mitigation:** Every entity in the schema is scoped by `athleteId`. The intelligence engines, context builder, and all API routes are parameterized on `athleteId` with no athlete-specific assumptions baked in. The route handlers contain explicit comments marking the auth placeholder.

**Production fix:** Add Iron Session middleware, replace `findFirst()` with `findUnique({ where: { id: session.athleteId } })` in all route handlers, implement OAuth session management. The intelligence layer requires no changes — this is mechanical auth plumbing on a correctly scoped schema.

---

### 2. Claude API Cost and Context Scaling

**Why it breaks first:** Each coaching turn sends approximately 2,000 tokens of pre-computed context to Claude, plus a secondary `maybeExtractMemory` call per turn. At 10,000 DAU at 10 messages per day, combined API cost reaches approximately $50,000 per month with no per-user throttle.

**Current mitigation:** A per-conversation message limit of 50 enforced in the conversations route returns HTTP 429 before the limit is exceeded. A three-stage context compression cascade triggers when token count exceeds 2,500: conversation history is trimmed to the last 4 turns, then the memory summary is capped at 200 characters, then recent activities are trimmed to 5. A per-conversation extraction cap of 5 memories prevents unbounded secondary Claude calls. The `maybeExtractMemory` pre-filter skips the extraction call entirely for short messages (under 60 characters) with no high-signal keywords, reducing secondary API calls by approximately 60–70% at scale. Per-turn cost estimates are logged as structured JSON events (`coach_turn_cost_estimate`) for visibility in Vercel function logs.

**Production fix:** The current mitigations control per-conversation cost but not fleet-level cost. A user with many conversations faces no quota. Production requires per-user daily message quotas enforced in the database, IP-based rate limiting independent of conversation structure, model routing for simple follow-ups, and cost dashboards with anomaly alerting.

---

### 3. Synchronous Intelligence Computation on Cold Serverless Starts

**Why it breaks first:** `buildAthleteIntelligenceContext` runs six intelligence engines and four or more database queries synchronously on every dashboard request. On a cold Vercel serverless start this takes 4–8 seconds. Under concurrent traffic, multiple function instances each maintain their own isolated memory space — a cache hit on instance A does not help instance B.

**Current mitigation:** An in-memory context cache with a 30-second TTL persists `buildAthleteIntelligenceContext` results across warm requests within a single function instance, eliminating recomputation for the common case. CDN cache headers (`s-maxage=30, stale-while-revalidate=60`) are set on the dashboard, weekly brief, and race prediction routes so Vercel's edge cache serves repeat requests without hitting the origin. `AbortController` 15-second timeouts on all frontend fetch calls ensure the error state is always reachable — cold starts cannot trap the UI in an indefinite loading state.

**Production fix:** The in-memory cache helps warm single-instance requests but not the serverless fleet. Production requires a shared external cache (Redis or Vercel KV) so cache hits are consistent across all function instances, background refresh after new activity import to invalidate stale context, and incremental recomputation triggering only the engines whose inputs changed.

---

### 4. Live Ingestion Reliability and Backpressure

**Why it breaks first:** A production service with real users syncing 90-day Strava histories would need to handle import inline in a request — blocking, rate-limited, and with no recovery path if interrupted mid-import.

**Current mitigation:** The seeded review path is fully deterministic and synchronous. The seed script is idempotent via `seedHash`. Ingestion is architecturally separated from intelligence — the same Prisma tables can be populated by a background job without changing any engine.

**Production fix:** Background job infrastructure with queues, retries, exponential backoff, idempotent resume from last-synced activity, dead-letter handling, and visible import status. No architectural changes to the intelligence layer are required.

---

### 5. Real-World Data Quality and Schema Drift

**Why it breaks first:** The generated training dataset is clean and intentionally shaped. Real wearable data has missing heart rate, indoor runs without GPS, incorrect sport labels, corrupt elevation, and inconsistent units across device manufacturers.

**Current mitigation:** Zod schemas validate all intelligence engine outputs and API response shapes. The generated dataset validates that the computation layer works correctly when inputs are well-formed — which is the right first validation target.

**Production fix:** Zod validation at external data boundaries (Strava API responses, TCX upload parsing) before data enters the Prisma tables. Data-quality scores per activity. UI confidence warnings when classifier or race predictor inputs are insufficient. Ingestion normalization for known device quirks.

---

### 6. Rule-Based Classifier Ceiling

**Why it breaks first:** The workout classifier achieves 85.2% accuracy on the 54-activity seeded validation set but uses physiological threshold rules that struggle with real-world workout variety: progression runs, strides, fartlek, and deliberately uneven efforts challenge threshold-based classification.

**Current mitigation:** The 14.8% misclassification rate is exclusively label errors on taper long runs falling below the long-run distance threshold — not execution evaluation errors. Execution evaluation is correct on all 54 activities. The 3-lap minimum on the INTERVAL rule prevents warmup-plus-main sessions from misclassifying.

**Production fix:** A two-pass pipeline — classify raw workout structure first, then apply phase-aware interpretation as a second enrichment step that adjusts labels based on periodization context. This is a deliberate v1 boundary.

---

### 7. Training-Load Cold Start

**Why it breaks first:** CTL and ATL are exponential moving averages with 42-day and 7-day time constants. An athlete starting fresh has a 4–6 week period where CTL underestimates true fitness and ACWR ratios are unstable. The system currently does not communicate this cold-start state to the user.

**Current mitigation:** The 12-week seeded block gives the engines enough history for stable outputs from day one. `validate:injury-risk` confirms `insufficient-data` returns correctly for weeks 1–4 and meaningful ACWR appears from week 5 onward.

**Production fix:** Minimum history requirements with user-facing confidence indicators ("Your fitness score is still building — 3 weeks of data remaining"). Baseline initialization using average-athlete priors for short histories. Explicit cold-start state surfaced in the UI rather than showing low CTL without context.

---

### 8. Coach Memory Privacy and Retention

**Why it breaks first:** `CoachMemory` records store durable coaching context — training preferences, schedule constraints, injury history — across all sessions. In the demo, all reviewer sessions share the same athlete's memory pool. Without per-user isolation, one reviewer's memories appear in another reviewer's coaching context.

**Current mitigation:** Memory management API endpoints (`GET /api/coach/memories`, `DELETE /api/coach/memories`, `DELETE /api/coach/memories/[id]`, `PATCH /api/coach/memories/[id]`) and a `/coach/memories` management page allow athletes to view, edit, and delete individual memories or clear all memories at once. A 25-memory per-athlete retention limit with oldest-first eviction is enforced via `enforceMemoryRetentionPolicy` called fire-and-forget after each extraction.

**Production fix:** The management features help individual users control their memories but do not solve the underlying multi-tenancy gap. Production requires per-user memory isolation enforced after multi-user auth is implemented, privacy disclosure in the settings UI, GDPR data export including memory records, and application-layer encryption for sensitive athlete context.

---

### 9. Injury-Risk Language and Health-Advice Boundary

**Why it breaks first:** ACWR is a workload-risk signal, not a medical assessment. Under adversarial input, Claude can produce clinical-sounding language — injury probabilities, diagnoses, treatment recommendations — despite system prompt constraints. The streaming architecture means flagged content reaches the client before any post-hoc filter can act.

**Current mitigation:** A two-layer safety system runs after each Claude stream completes. Layer 1 is a synchronous pre-filter (`needsSafetyClassification`) that checks the response against broad health-adjacent term substrings and structural medical-language regex patterns (condition suffixes like `-itis`/`-osis`, dosage amounts, diagnosis-like sentence structure, percentage-based risk claims, medical urgency phrases) — catching the full semantic space of health-adjacent language without depending on specific drug or condition names. Layer 2 is a secondary Claude call (`classifyCoachingResponse`, max 50 tokens) that only fires when Layer 1 triggers. If classification fails, a safety disclaimer is appended to both the live stream and the stored database record. The system prompt includes an explicit `## Health and Medical Boundaries` section with enumerated prohibitions and a required professional-referral pattern for pain or injury disclosures. `validate:safety` and `validate:prompt-constraints` regression scripts assert correct classifier and constraint behavior.

**Production fix:** The classifier currently runs post-stream — it detects problems after content has already reached the client. Production requires streaming interception: buffer and evaluate content before forwarding to the client, or use a two-stage generation approach (generate candidate, classify, deliver if safe, regenerate if not). Additionally: adversarial prompt injection tests in CI and legal review of all coaching copy before broad launch.

---

### 10. Prompt and Model Regression

**Why it breaks first:** The six deterministic engines are fully testable and validated by nine scripts. Claude outputs are not. A system prompt change, context structure change, or model version upgrade can silently shift coaching tone, factual grounding, or safety constraint adherence. Without automated enforcement, regression tests only catch problems when someone remembers to run them.

**Current mitigation:** Three regression scripts were added after the initial build: `validate:context-drift` runs `buildAthleteIntelligenceContext` twice with cache invalidation and asserts deep JSON equality plus 13 value-range assertions across all six engines — no Claude calls required; `validate:coaching` calls Claude with the full system prompt and asserts that ≥ 4 of 5 expected grounding values (CTL, ACWR, phase, days until race, goal time) appear in the response; `validate:prompt-constraints` fires five adversarial inputs through the full coaching pipeline and asserts each response passes the safety classifier and contains a professional referral. `validate:regression` runs all three in sequence and prints a summary table.

**Production fix:** The regression tests exist but run manually. Production requires CI integration so tests run automatically on every change to `system-prompt.ts` or context structure, automated triggers on `ANTHROPIC_MODEL` env var changes before deployment, pinned model version with a tested upgrade process, and coaching tone regression benchmarks to catch subtle quality drift.

---

### 11. Observability and Incident Response

**Why it breaks first:** Without structured logging aggregation, error tracking, or alerting, a Claude API outage causing 100% fallback responses across all users is invisible until users complain. The fallback works correctly — users see computed coaching — but the engineering team has no signal that something is wrong.

**Current mitigation:** Structured JSON-formatted console events are emitted at key lifecycle points via `console.log(JSON.stringify({...}))` and `console.warn(JSON.stringify({...}))`: cache hit and cache miss events in the context builder (`intelligence_context_cache_hit`, `intelligence_context_cache_miss`), safety classification failures and errors in the classifier (`safety_classification_failed`, `safety_classification_error`), safety disclaimer append events (`safety_disclaimer_appended`), and per-turn cost estimates in both coaching routes (`coach_turn_cost_estimate`). Context token budget violations emit `console.warn` when the compression cascade fires. The deterministic fallback prevents user-facing failures on Claude API unavailability — athletes see computed coaching rather than an error state when Claude is down.

**Production fix:** External log aggregation via Vercel Log Drains, Sentry for error tracking and stack trace capture, alerting on elevated fallback rate (greater than 10% of coaching turns triggering deterministic fallback), and model cost dashboards with anomaly detection on per-user spend.

---

The pressure points above cluster into two categories. Product-layer gaps — authentication, memory isolation, health-advice boundary enforcement in the streaming path — require feature work but not architectural rework, because the schema is correctly scoped and the intelligence layer is already separated from transport. Operational-layer gaps — shared external cache, CI-enforced regression tests, observability pipelines, background job infrastructure — are standard production infrastructure independent of whether the coaching intelligence approach is correct. The hardening applied during this build (safety classifier, memory management, cost controls, regression test suite, context caching, structured logging) demonstrates the pattern: the architecture absorbs production hardening incrementally without structural rework.

---

## What I Would Build Next

The current slice proves the intelligence layer works: six deterministic engines compute a complete coaching state over a structured training block, Claude explains and responds over that pre-computed state, and every numeric output is testable against a seeded dataset. The next work falls into three phases. Phase 1 turns the vertical slice into a real-user service by wiring ingestion, authentication, and data isolation. Phase 2 deepens the intelligence model with recovery and adaptation signals that ACWR alone cannot capture. Phase 3 delivers coaching proactively and safely at scale through plan generation, brief delivery, and the operational infrastructure a production coaching service requires.

---

### 1. Real-User Ingestion: Strava OAuth and Activity Sync Pipeline

**What to build:** Strava OAuth flow, paginated activity import with rate-limit handling and exponential backoff, idempotent upsert on `stravaActivityId`, duplicate detection, partial-import recovery from last-synced activity, and visible sync status in the UI.

**Why users need it:** The deterministic seeded dataset proves the intelligence layer works. Real athletes need their own training history in the system before Pacer can coach them on their specific training block, not on a generic demo arc.

**Why it comes after the current slice:** The architecture already separates ingestion from intelligence — Strava writes into the same Prisma tables the seeded data uses, with no changes to any coaching engine. The ingestion work is plumbing on top of a correctly designed schema, not intelligence redesign.

**Technical complexity added:** Strava API rate limits (non-upload requests are capped at 100 per 15 minutes per user), background job infrastructure for long-running historical imports, webhook handling for new-activity notifications, and stream-level HR and GPS ingestion for the workout classifier.

---

### 2. Multi-Athlete Authentication and Data Isolation

**What to build:** Iron Session middleware, OAuth session management, replacing `findFirst()` with athlete-scoped `findUnique({ where: { id: session.athleteId } })` across all route handlers, per-user settings, and cross-user data isolation tests.

**Why users need it:** A coaching product with more than one user requires guaranteed data separation. The current single-athlete demo is a deliberate scope decision — the schema is already correctly structured for multi-tenancy, but the route layer does not enforce it without authentication middleware.

**Why it comes after ingestion:** Authentication is additive on a correctly scoped schema — every entity is already `athleteId`-keyed, and the intelligence layer requires no changes. Auth comes after ingestion is proven because the first real user will likely authenticate via Strava OAuth, making both concerns naturally sequential.

**Technical complexity added:** Session management, token refresh handling, per-user privacy controls, and regression tests for cross-user data leaks. Not architecturally complex but operationally required before any public launch.

---

### 3. Normalized Signal Layer for Recovery and Schedule Integrations

**What to build:** An `AthleteSignal` abstraction that normalizes inputs from multiple authorized sources — Strava, Garmin Connect, Apple HealthKit, calendar data — into a consistent schema before they reach the intelligence engines.

**Why users need it:** Without a normalized layer, each new data source adds provider-specific conditionals throughout the coaching engines. A runner using Garmin and a runner using Apple Watch would require different code paths to reach the same coaching logic — the abstraction makes subsequent integrations additive rather than disruptive.

**Why it comes after auth and ingestion:** The abstraction only makes sense once real multi-source data is flowing through authenticated user sessions. Building it against the seeded dataset would be premature — there is nothing to normalize until real provider diversity exists.

**Technical complexity added:** A signal normalization layer between ingestion and intelligence, provider-specific adapters, and confidence scoring for signals that are unavailable or low-quality. This is the architectural investment that makes every subsequent integration a single adapter, not a cross-cutting change.

---

### 4. Physiological Drift and Adaptation Detection

**What to build:** A drift detection engine that compares heart rate at a given pace — and pace at a given heart rate — across comparable workouts over time. Detect whether aerobic efficiency is improving (same pace, lower HR over successive weeks), stable, or declining. Surface this as a seventh intelligence dimension alongside ACWR and phase detection.

**Why users need it:** CTL, ATL, and ACWR track training load. Drift detection tracks whether that load is producing adaptation. An athlete whose easy-run pace improves 15 seconds per kilometer at the same heart rate over 8 weeks is getting fitter in a way no current signal captures. It is one of the most actionable signals you can give an endurance athlete — Strava already collects all the required data — and it turns Pacer from load management into adaptation tracking. This was the seventh intelligence dimension on the original design list and was cut because six dimensions built with depth was a better submission than seven built shallowly.

**Why it comes after ingestion and recovery:** Drift detection requires a sufficient history of comparable workouts at similar effort levels. The 12-week seeded block can demonstrate the concept, but meaningful drift signals require real longitudinal data across months. Recovery signals from HRV and sleep also help distinguish genuine fitness improvement from effort-level variability in the comparison dataset.

**Technical complexity added:** Workout comparability logic — matching similar-effort sessions across weeks by effort zone and terrain — regression or EMA-based drift calculation, and a new intelligence engine integrated into the context builder. This is the highest-complexity next intelligence dimension and the one most likely to differentiate Pacer at the product level.

---

### 5. Recovery-Aware Coaching via HRV and Sleep Integration

**What to build:** Integration of HRV, resting heart rate, sleep quality, and subjective fatigue via Garmin Connect OAuth, Apple HealthKit, or Oura's authorized API. Feed these signals into the ACWR workload-risk interpretation and the weekly brief prescription, distinguishing "load is high because training is progressing" from "load is high and the athlete is also recovering poorly."

**Why users need it:** ACWR detects load spikes but cannot distinguish recovery state. A runner with ACWR 1.3 who slept eight hours and has good HRV needs different coaching than a runner with ACWR 1.3 who slept four hours and has suppressed HRV. The current ACWR signal is a principled approximation that is honest about what it measures — recovery-aware coaching is the highest-value intelligence extension because it improves the accuracy of the existing risk signal without requiring new workout tracking. It was cut because it requires three separate API integrations, each with their own OAuth flows and data models, before any intelligence improvement is visible.

**Why it comes after the normalized signal layer:** Recovery signals from Garmin, Apple Health, and Oura arrive in different formats and cadences. The normalized AthleteSignal abstraction (item 3) is the prerequisite that lets all three feed the same coaching model without provider-specific conditionals throughout the intelligence engines.

**Technical complexity added:** Provider OAuth flows, daily recovery data ingestion and aggregation (HRV is a morning measurement, sleep data arrives with a lag), cross-signal correlation logic between training load and recovery indicators, and UI for displaying recovery context alongside the ACWR zone bar.

---

### 6. Guardrailed Training-Plan Generation

**What to build:** Constrained plan generation that produces a periodized week-by-week schedule respecting progressive overload limits, mandatory recovery weeks, workout-type distribution ratios, race-date taper constraints, ACWR gates that block load increases when workload risk is elevated, and user schedule constraints (available days per week, time per session, equipment access).

**Why users need it:** The current coach advises on an existing plan. Many athletes do not have a structured plan — they need one built for them, not just commentary on what they already did. Plan generation closes the gap between reactive coaching (what did last week mean?) and proactive coaching (what should I do for the next 12 weeks?). The current weekly brief — what you did last week and what to do this week — is a deliberate scoping of this space that avoids the complexity while proving the underlying signal quality is good enough to support it.

**Why it comes after recovery-aware coaching:** Plan generation quality depends on accurate fitness, fatigue, and recovery signals. A plan generated without recovery context might prescribe a hard workout on a day the athlete is deeply fatigued. Recovery awareness is the prerequisite for safe prescription generation. Plan generation also carries meaningful coaching liability — every prescribed workout needs appropriate uncertainty framing and professional consultation guidance — which requires the product trust layer (memory controls, health-advice boundary enforcement) to be solid first.

**Technical complexity added:** Progression logic, constraint satisfaction for user schedule and equipment, ACWR simulation to predict future workload risk from a proposed plan, and careful product framing around coaching liability. This is a distinct product layer above the current intelligence stack.

---

### 7. Weekly Brief Delivery

**What to build:** Email delivery, push notification, or calendar integration for the weekly brief. Include unsubscribe controls, delivery timing preferences, and a settings UI for notification channel selection.

**Why users need it:** The weekly brief is already generated deterministically server-side without a Claude call. Most athletes who would benefit from it will not open the app unprompted every Monday. Proactive delivery converts a pull interaction into a push interaction without changing the content layer.

**Why it comes after auth:** Delivery requires per-user preferences and notification opt-in, which require authenticated sessions. The brief content itself is already production-ready — this is a delivery pipeline question, not a content question.

**Technical complexity added:** Email provider integration (SendGrid or Resend), push notification infrastructure, scheduled job triggering every Monday morning, preference storage, and unsubscribe handling. The brief generation code requires no changes.

---

### 8. Coach Memory Controls and Production Trust

This work is partially implemented. The current build includes a memory management API (`GET /api/coach/memories`, `DELETE /api/coach/memories`, `DELETE /api/coach/memories/[id]`, `PATCH /api/coach/memories/[id]`), a `/coach/memories` management page where athletes can view, edit, and delete individual memories or clear all memories at once, and a 25-memory per-athlete retention limit with oldest-first eviction enforced via `enforceMemoryRetentionPolicy` after each extraction turn.

**What remains:** Per-user memory isolation enforced after multi-user auth is implemented (currently all reviewer sessions share the same athlete's memory pool), privacy disclosure in the settings UI explaining what is stored and how it is used, GDPR data export including memory records, and application-layer encryption for sensitive coaching context such as injury history and schedule constraints.

**Why this matters:** Coaching memory stores personal context — training preferences, injury history, schedule constraints. Users need to know what the coach remembers and be able to correct or remove it. Trust in a coaching product depends on transparency about persistent personalization, not just on the quality of the coaching itself.

**Technical complexity added:** Memory audit trail, encryption at rest for sensitive fields, GDPR export pipeline, and multi-user memory isolation after authentication is implemented.

---

### 9. Observability, Cost Controls, and Sync Health

**What to build:** Structured logging pipeline to an external aggregator (Vercel Log Drains), error tracking (Sentry), model latency and cost dashboards, fallback-rate monitoring with alerting when the deterministic-response rate exceeds 10%, per-user daily message quotas enforced in the database, ingestion failure alerts, and sync health status visible to the user when activity import stalls.

**Why users need it:** The current implementation emits structured JSON console events at key lifecycle points (cache hit/miss, safety classification failures, cost estimates), and the deterministic fallback prevents user-facing failures when Claude is unavailable. What is missing is the aggregation and alerting layer: if Claude API latency degrades or costs spike, engineering needs signals before users file complaints. Users also need visibility when their data sync is stalled rather than receiving coaching based on stale activity data.

**Why it comes after the service has real users:** Observability tooling without traffic to observe provides no signal. The current validation scripts, deterministic fallback, and structured console events are the appropriate substitute for the single-user demo environment.

**Technical complexity added:** Log aggregation configuration, Sentry SDK integration, cost accounting per user and per model call, alerting rules, and a sync health status model in the database that the UI can query.

---

Each phase above builds on the proof established by the current slice — that deterministic computation over a structured training block produces more specific and actionable coaching than per-activity commentary — and extends it toward a service that can coach real athletes on their real training history with the reliability, privacy, and operational visibility a production product requires.

---

## Live URL

https://lumalabs-eng-take-home-e066572123aa-two.vercel.app
