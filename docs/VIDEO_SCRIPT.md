# Video Script — Pacer Demo (7–7.5 min)

**Format:** Loom screen recording
**Audience:** Director of Engineering and hiring manager at Luma AI
**Tone:** Confident, specific, engineer-to-engineer. No hedging. Every sentence earns its place.
**Language rule:** "workload-risk signal", "training-load spike", "caution range", "higher-risk pattern" — never "injury prediction" or "you will get injured."
**Before recording:** Deploy to Vercel and replace [YOUR_VERCEL_URL] throughout.

---

## [0:00–0:45] — The Problem and Product Thesis (45 seconds)

**Screen:** Dashboard visible but do not navigate. Stand still.

Strava Athlete Intelligence launched in October 2024 to 135 million athletes. Their own community characterized it — direct quote — as "prose layered on top of your data points." After a completed run, the feature generates a paragraph about that run. Their own materials frame it as post-activity commentary. It describes what happened. It does not help decide what to do next.

The product gap is not better text. The gap is coaching strategy. A coach synthesizes a training block — weeks of accumulated history — into a recommendation about trajectory, risk, and decisions. A describer consumes one activity. A coach consumes a training arc.

*Pause. Let this land.*

"Strava explains the workout you just completed. Pacer helps decide what you should do next."

Pacer computes the athlete's training state first — from 12 weeks of longitudinal history — and surfaces that state as a coaching model. The chat interface is a layer on top of that computation, not the source of intelligence.

---

## [0:45–1:30] — Why This Is Technically Different (45 seconds)

**Screen:** Stay on dashboard. Move to src/lib/intelligence/ briefly if possible, then back.

The naive implementation of "AI coaching" sends activity data to Claude and asks it to reason. That produces plausible-sounding but generic advice — Claude has no stable coaching model to work from, and the outputs are not testable or reproducible.

Pacer does not do that.

Raw activity history goes into Prisma and Supabase. Six deterministic intelligence engines transform it into a unified athlete context object. That object powers every UI surface and the coach chat.

Six engines:

Banister-style training load computing CTL, ATL, and TSB. Gabbett-style ACWR for workload-risk spike detection. Riegel formula for race prediction with confidence intervals. A rule-based workout classifier with execution evaluation. A periodization phase detector anchored to the race date. A deterministic weekly brief generator that produces coaching prescriptions without any AI call.

Because the computation layer runs first, every surface in the product — dashboard, activity detail, race goal, weekly brief, coach chat — uses the same pre-computed state. The coaching is consistent, testable, and reproducible. Claude makes it conversational. The engines make it specific.

---

## [1:30–2:20] — Dashboard: Current Coaching State (50 seconds)

**Screen:** /dashboard. Scroll slowly. Let each card sit for 3–4 seconds.

Each card answers a coaching question.

Training Phase card: "Where am I in training?" — RECOVERY. The arc at the bottom shows the full 12-week periodization: BASE weeks 1–3, BUILD weeks 4–7, PEAK week 8, then RECOVERY. That label is not hardcoded. The phase detector read a 47% load drop against the 3-week average and classified it as recovery. In week 8, when the athlete deliberately spiked load, the ACWR hit 1.337 — into the caution range — and the system overrode the calendar classification. The workload signal was more important than the schedule position.

ACWR card: "Am I at risk?" — ACWR is 0.44 this week. Underload — confirming the recovery prescription, not just describing it. At week 8 peak it hit 1.337, triggering the training-load risk signal. Not a rolling average. Not a heuristic. The Gabbett formula: this week's TRIMP divided by the arithmetic mean of the prior four complete weeks.

Race Prediction card: "Am I on track?" — 1:53:19 projected, 1:41 ahead of the 1:55:00 goal, 87 days out. Riegel formula applied to the best qualifying tempo effort, adjusted for current TSB freshness. 80 out of 100 confidence.

Weekly Brief preview: "What should I do this week?" — phase-appropriate prescription. Recovery week means easy runs only, HR below Zone 2 ceiling.

Coach CTA: "What should I ask my coach?" — the suggested questions are wired to the computed intelligence context, not generic prompts.

---

## [2:20–3:10] — Activity Intelligence: Intent vs Execution (50 seconds)

**Screen:** /activities → page 2 → click March 8 "8.0km Steady State Run"

Before clicking, set up what they are about to see.

Strava can summarize pace and effort relative to averages. What it cannot do is ask whether this specific workout was executed according to its intent. That distinction matters because a scheduled easy run executed at threshold effort is not "above average." It is a training decision problem.

*Click the activity.*

Classification card: Intended easy. Classified Steady State. Heart rate 157 against a Zone 2 ceiling of 145 — twelve beats over.

*Pause. Let it be visible.*

The Zone 2 ceiling is not derived from a rolling average. It is a fixed physiological threshold — the heart rate below which the athlete can sustain aerobic effort without accumulating meaningful fatigue. Exceeding it on a scheduled recovery day costs the next day's quality session.

This classifier took more iterations than anything else in the project. The first version fired the interval rule on two-lap tempo sessions — warmup plus main effort — because the lap HR variance looked like intervals. Adding the 3-lap minimum required understanding what interval structure actually is: repeated short efforts with recovery, not a single hard effort split in two. Getting that distinction right in a rule-based system is the kind of thing that separates coaching intelligence from statistical pattern matching.

Coaching Context card: This is where that violation connects to the training arc. The phase context, the TSB at the time, the ACWR — all computed, all part of the coaching explanation.

*Click "Ask Coach about this workout."*

The coach opens with the question pre-filled. SessionStorage bridge — one line of code — carries the coaching context from every intelligence page directly into the first coach message. The question is specific because the computation was specific.

---

## [3:10–3:55] — Race Prediction: Honest Trajectory Modeling (45 seconds)

**Screen:** /race-goal

Race prediction is not presented as a certainty. It is a trajectory estimate with a confidence interval, grounded in a published formula.

Riegel 1977: T2 equals T1 times the distance ratio raised to the 1.06 power. The 1.06 exponent captures the non-linear fatigue relationship over longer distances — you slow down more than proportionally as distance increases. The formula is in the code with a comment. No black box, no ML model.

The system identifies the best qualifying effort — lowest average pace from TEMPO, LONG_RUN, or RACE activities over 5km in the last 8 weeks. Then applies Riegel. Then adjusts for current TSB freshness — TSB is +7.2, so the prediction improves 2%. All adjustments are surfaced explicitly in the UI.

1:53:19 predicted. 1:49:14 to 1:57:24 confidence interval. 80 out of 100 confidence score. 1:41 ahead of the 1:55:00 goal.

*Point at the disclaimer.*

"Estimated based on flat-course Riegel formula. Hilly terrain or adverse weather may significantly affect results." The product should not overclaim. Honest uncertainty is a feature, not a weakness.

---

## [3:55–4:45] — Weekly Brief: Proactive Coaching Without Claude (50 seconds)

**Screen:** /weekly-brief

Athlete Intelligence fires on activity upload. Between workouts — on rest days, on Monday mornings when an athlete is planning the week — there is no coaching presence. Pacer generates a coaching brief every week, whether or not an activity was uploaded.

*Read the key signal aloud:*

"Fitness (CTL 59.3) is declining — consistency this week is important to arrest the trend and rebuild your aerobic base."

That sentence came from generateWeeklyBrief — a deterministic function. No Claude call. Five sections: last week's training reviewed, this week prescribed, the most important signal, active warnings, and suggested focus. All derived from CTL trend, ACWR category, phase classification, and race gap. The prescription is phase-appropriate — recovery week means easy runs only, with a specific HR ceiling.

I built this without Claude first deliberately. If I cannot generate a coaching prescription from CTL, ACWR, phase, and race gap without a language model, I do not understand the signals well enough to send them to one. The brief forced me to encode actual coaching logic — what a recovery week prescribes, what signals warrant a warning, what the right key signal priority order is. When I finally wired Claude into the context, the responses were specific because that encoding already existed.

*Make the architectural point clearly:*

This is why I call Pacer a computed coaching layer. The brief works without Claude. Claude can elaborate on it, rewrite it, answer questions about it — but the coaching value exists in the computation layer. That means the product degrades gracefully when the AI API is unavailable. It means the brief is testable against a known schema. It means the coaching is not hallucinated — it is derived.

The deterministic brief also proves something about the design philosophy: if you cannot generate coaching advice from the computed signals without AI, you do not understand the signals well enough to send them to AI.

---

## [4:45–6:00] — Coach Chat: Claude as Interface Over Computed State (1:15)

**Screen:** /coach — show the sidebar of named sessions briefly, then start a new message.

Before streaming, explain what Claude is working with.

The coaching context is pre-compiled to under 2,000 tokens. It contains: the current phase with its primary reason, ACWR category and contributing factors, race prediction and gap, recent workout classifications with execution evaluations, bounded conversation history from this session, and coaching memories from previous sessions. Raw GPS streams are never sent. The computation layer already extracted the signals Claude needs.

*Send "How is my training going?" — stream live, do not pre-type.*

*While streaming:*

This is live. Watch it reference computed values — CTL, TSB, ACWR, the recovery prescription — not generic training advice.

*After streaming completes, point at specific numbers.*

There — CTL 59.3, ACWR 0.44, the recovery prescription. Those are not invented. They come from the engines. Claude makes them conversational.

*Type a meaningful follow-up: "Should I be worried about my CTL declining?"*

*While streaming:*

This is the conversational dimension Athlete Intelligence does not have. You cannot ask a follow-up. You cannot push back. Pacer maintains full context across the conversation and carries durable coaching facts — preferences, constraints, injury history — across sessions via CoachMemory records written by a secondary Claude call after each turn.

*After response.*

If the Anthropic API is unavailable, a deterministic fallback streams computed coaching analysis from the same intelligence context — no hallucination possible, no dependency on Claude being available. The coaching works either way.

**Screen:** Click "Manage memory" in the coach header — this navigates to /coach/memories in the same browser tab.

"This is what the coach actually remembers. These summaries were written by Claude — not keyword-matched, not manually entered. A secondary call after each streaming turn decides whether the conversation contained something durable: a training preference, a schedule constraint, injury history. If it did, Claude writes a structured summary and it lands here. The athlete can edit any entry, delete individual ones, or clear everything. If the coach is going to carry context across sessions, the athlete should be able to see exactly what it knows and correct it. That is not a settings page — it is part of the coaching interface."

*Navigate back to /coach*

---

## [6:00–6:55] — Architecture Decisions and AI Direction (55 seconds)

**Screen:** src/lib/intelligence/ folder → buildAthleteIntelligenceContext → src/app/api/dashboard/route.ts

*Show the intelligence folder.*

Six engine files. Pure functions. Independently testable. All consumed through buildAthleteIntelligenceContext — one source of truth that every product surface reads from. The dashboard, race goal page, weekly brief, and coach chat all see the same computed state.

*Show the route handler.*

The entire dashboard handler. Authenticate, call one function, return the result. Zero intelligence logic in the route file. Every coaching decision lives in src/lib.

Now explain the decisions I made that AI could not.

**Product thesis.** The model would have built a fitness chatbot. I decided the right product is a training-block coach. That framing shaped every prompt that followed.

**ACWR formula choice.** I chose the Gabbett ratio over ATL/CTL. They answer different questions. ATL/CTL tracks chronic fitness trend and stays elevated throughout any build block. Gabbett compares this week to the prior four-week baseline at the same weekly timescale — it detects spikes. Week 8's 1.337 was identifiable precisely because weeks 1–7 established a stable baseline.

That formula choice is the decision I'm most confident about in the entire codebase. ATL/CTL would have produced a persistently elevated ratio throughout the build phase — making it impossible to detect week 8 as anomalous because every week looks elevated. Gabbett isolated the spike precisely because the chronic denominator is stable. Getting the right tool for the right question is the difference between a signal and noise.

**Deterministic training block.** I built a 12-week dataset instead of requiring Strava OAuth because the intelligence dimensions need specific data shapes to demonstrate — a load spike, a zone-mismatch run, a full periodization arc, a race trajectory gap. Real data might not have those. The deterministic training block guarantees them. It is a controlled evaluation environment, not a shortcut.

**Deterministic engines before Claude.** I rejected "send everything to Claude." I built computed signals first because the coaching should be correct when Claude is unavailable, testable against known inputs, and specific to this athlete's actual computed state.

Other explicit decisions: TCX over FIT because FIT is binary and risky to generate — TCX is XML and human-readable. Prisma v6 pinned because Prisma v7 introduced four simultaneous breaking changes in a time-boxed sprint. Rule-based classifier because the training set is small and the rules are auditable. Scope cuts — no mobile, no live Strava import, no multi-user auth — to keep the slice finished rather than broad.

---

## [6:55–7:20] — Close (25 seconds)

**Screen:** Back to /dashboard.

Pacer is a complete vertical slice of a training-block coaching system. It is not trying to add features to Strava. It proves a specific product thesis: coaching requires reasoning over the training arc, not commentary on individual activities.

The app tells the athlete where they are, whether they are at risk, whether they are on track, what to do this week, and why — and then lets them have a specific, grounded conversation with a coach who knows all of that.

What comes next: Strava OAuth import with idempotent sync, multi-user auth and data isolation, Garmin HRV integration for recovery-aware coaching, and background job infrastructure for historical imports.

*Let it land:*

Athlete Intelligence describes. Pacer coaches.

*Show live Vercel URL for 3 seconds.*

Everything visible was computed from a deterministic training block. The reviewer setup is three commands: migrate, seed, dev.

---

## Pre-Recording Checklist

Before pressing record:

- [ ] Deploy to Vercel and replace [YOUR_VERCEL_URL] throughout
- [ ] Run: `curl http://localhost:3000/api/dashboard` to verify current phase (RECOVERY), ACWR (0.44), CTL (59.3), race prediction (1:53:19) — update script if they differ
- [ ] Confirm the March 8 zone-mismatch run is visible on page 2 of /activities with the red "Too Hard" badge
- [ ] Confirm coach streaming is working with a live test message before recording
- [ ] Confirm /coach/memories page is accessible
- [ ] Have src/lib/intelligence/ open in the code editor and ready to show
- [ ] Have src/app/api/dashboard/route.ts open and ready to show
- [ ] Close all browser tabs except localhost:3000
- [ ] Set browser zoom to 100% — do not zoom in or out during recording
- [ ] Record at 1080p minimum
- [ ] Do not pre-type coach messages — let them stream live

---

## Timing Table

| Section | Duration | Running Total |
|---|---|---|
| Product thesis and problem | 0:45 | 0:45 |
| Why technically different | 0:45 | 1:30 |
| Dashboard walkthrough | 0:50 | 2:20 |
| Activity intelligence | 0:50 | 3:10 |
| Race prediction | 0:45 | 3:55 |
| Weekly brief | 0:50 | 4:45 |
| Coach chat live + memories | 1:15 | 6:00 |
| Architecture and AI direction | 0:55 | 6:55 |
| Close | 0:25 | 7:20 |

**Total: 7:20** — under the 7:30 ceiling. The 20-second addition is the /coach/memories navigation in the coach chat section. The first-person voice insertions (classifier story, brief without Claude, Gabbett confidence) are spoken during existing screen time — navigation, reading, and pause moments — and do not add material runtime. Keep delivery crisp.

---

## Verified Data Points (checked 2026-05-07)

| Data point | Value | Where used |
|---|---|---|
| Phase | RECOVERY | Dashboard [1:30], Close [6:35] |
| ACWR this week | 0.44 | Dashboard [1:30], Weekly Brief [3:55] |
| CTL | 59.3 | Dashboard [1:30], Weekly Brief [3:55], Coach [4:45–6:00] |
| TSB | +7.2 | Race Prediction [3:10] |
| Race prediction | 1:53:19 | Dashboard [1:30], Race Prediction [3:10] |
| Confidence interval | 1:49:14–1:57:24 | Race Prediction [3:10] |
| Confidence score | 80/100 | Dashboard [1:30], Race Prediction [3:10] |
| Goal gap | 1:41 ahead | Dashboard [1:30], Race Prediction [3:10] |
| Days until race | 87 | Dashboard [1:30] |
| Week 8 ACWR spike | 1.337 | Dashboard [1:30] |
| March 8 activity | HR 157 vs ceiling 145 | Activity Intelligence [2:20] |
| Weekly brief key signal | Fitness (CTL 59.3) declining | Weekly Brief [3:55] |

---

## What Changed from v1 and Why

### How the new version better addresses Luma's four evaluation criteria

**1. Real working software, not a prototype or toy**

v1 referenced specific data values (CTL 59.9, ACWR 0.44, 90 days out) without a verification step. The new version was written after running the live API and updating every number to what the app currently returns — phase RECOVERY, ACWR 0.44, CTL 59.3, TSB +7.2, 87 days until race. The gap between "data I remembered" and "data the app returns today" is exactly what reviewers will catch. The pre-recording checklist now mandates a fresh API check before every recording session so the script never drifts from the live app.

**2. How I broke down ambiguity and decided what to build first**

v1 buried the product decision-making in the "What I'm Proud Of" section, which arrived at minute 4:30 after the reviewer had been watching for almost five minutes. The new script surfaces the core architectural thesis — deterministic engines first, Claude as interface on top — in [0:45–1:30] before the first product screen is shown. The viewer understands the design decision before they watch it working. That reordering directly addresses the evaluation question: "How did you decide what to build?"

**3. How I directed AI tools, pushed back, and shaped the result**

v1 mentioned AI direction in two sentences at the end of the architecture section. The new [5:40–6:35] architecture section gives each override explicit airtime: Gabbett vs ATL/CTL (formula choice that required reading the Gabbett 2016 paper), deterministic training block (evaluation reliability decision), TCX over FIT (two-line policy change that eliminated a debugging category), Prisma v6 pin (absorbing four simultaneous breaking changes during a sprint is compounding risk), rule-based classifier (small dataset, auditable rules), and explicit scope cuts. These are named, reasoned decisions — not a general claim that "I shaped the AI output."

**4. The unique product/technical perspective that made this distinct**

v1 framed Pacer as "six intelligence dimensions." The new script frames it as a computed coaching layer with a specific architectural claim: six deterministic engines transform raw activity history into a structured athlete model, Claude receives a bounded pre-computed context under 2,000 tokens and explains and converses over that state, and the computation layer is what makes the coaching specific. That framing appears in [0:00–0:45] and is the through-line for every subsequent section. The Weekly Brief section makes the architectural point explicitly: if you cannot generate coaching advice from the computed signals without AI, you do not understand the signals well enough to send them to AI. That sentence is the product thesis made testable.

### Where the script makes human judgment over AI generation explicit

- **[0:45–1:30]:** Naming the six engines and explaining why each exists — this is the product scope decision, not implementation.
- **[1:30–2:20]:** "The workload signal was more important than the schedule position" — the phase override rule is a product judgment about signal priority, not a code choice.
- **[3:10–3:55]:** Riegel formula with explicit adjustments surfaced in the UI — the decision to be transparent about the model rather than present a number without provenance.
- **[3:55–4:45]:** The deterministic brief architectural point — building it without Claude first to prove you understand the domain.
- **[5:40–6:35]:** Each named decision (Gabbett vs ATL/CTL, TCX over FIT, Prisma v6 pin, scope cuts) with the reasoning, not just the outcome.

### What was cut from v1 and why

**"What I'm Proud Of" section (v1 [4:30–5:50]):** This section was structured as a retrospective and felt like a de-brief rather than a demonstration. The three proud items — Claude writes its own memory, the ACWR implementation, the deterministic brief — are now woven into the demonstration sections where they are visible and live, rather than narrated after the fact. The viewer sees the memory system working during the coach chat, not described in a summary.

**"Athlete Intelligence would have said..." contrast lines:** v1 used several direct contrast lines ("Athlete Intelligence would have said your pace was above your 30-day average — which is true, and useless"). The new script replaces these with what Strava is "not positioned as" in their public materials — more accurate language that avoids overclaiming about their product while still making the product gap clear.

**"90 days out" (stale):** v1 hardcoded 90 days. The new script uses 87 days (verified from the live API on 2026-05-07, race 2026-08-02). The pre-recording checklist now includes an explicit step to re-verify this before each recording session.

**Generic "Powered by Claude" label callout:** v1 pointed at the label during the coach demo for emphasis. The new script omits this in favor of pointing at the specific computed numbers in the streaming response — which is more demonstrative of the architectural claim than pointing at a label.

**Running time:** v1 was 5:50. The new script is 7:00. The additional 70 seconds go entirely to [0:45–1:30] (the architectural thesis section, which was absent in v1) and [5:40–6:35] (the expanded architecture and AI direction section). Both sections directly address Luma's evaluation criteria 2 and 3. The tradeoff is deliberate.
