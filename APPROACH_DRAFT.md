# APPROACH_DRAFT.md — Pacer

> This is a working draft, written before implementation, to lock in the product thinking. It will be refined into APPROACH.md after the build is complete and the deployed URL is known.

---

## What I built and why

Strava's Athlete Intelligence is a post-activity feature. After you finish a run, it tells you how the run went — pace consistency, effort level, a trend sentence or two. That's useful, but it's fundamentally read-only and backward-looking. It describes what happened; it doesn't help you train better.

Pacer inverts this. The same activity data becomes the input to a persistent coaching relationship. The app knows what phase of training you're in, how your workload ratio has been trending, whether your race goal is still on track, and whether you executed last week's workouts as intended. It can tell you what to do next, answer your questions with full context, and flag problems before they become injuries.

The specific improvement: Strava Athlete Intelligence is a one-way briefing. Pacer is a two-way conversation with a coach who has your whole training history in mind.

I picked this problem because the gap is clear and the product instinct is strong. Runners who use Strava are already generating the data; they're just not getting anything useful back from it beyond ride-by-ride commentary. A conversational coach that reasons over training history is the obvious next layer, and AI makes it buildable by a single developer in a day.

---

## Why this is a finished slice, not a prototype

A prototype would demonstrate the idea — show that you can call Claude with activity data and get coaching-sounding text back. That's not interesting; anyone can do that in an afternoon.

A finished vertical slice is different. Each shipped dimension needs to be:

- **Correct**: the ACWR formula is the actual Banister formula, not a made-up ratio. The Riegel exponent is 1.06, not something that looked plausible. Periodization phases reflect how coaches actually periodize.
- **Connected to real data**: the training block is a realistic 12-week half-marathon arc, not fabricated constants. The intelligence engines compute from the seeded database, not hardcoded values.
- **Testable and explainable**: the workout classifier returns `label`, `confidence`, `explanation`, and `execution_evaluation`. Race prediction surfaces its adjustments. The coaching brief is generated deterministically before Claude touches it.
- **Finished in the UI**: loading states, empty states, error states, a dashboard that answers the five training questions a runner actually has every week.

The slice is narrow — one demo athlete, one training goal, no multi-user, no historical import. But within that slice, everything works. That's the distinction.

---

## Why generated data is the primary path

If the demo required a real Strava account with actual training history, every reviewer would get a different experience. A reviewer who doesn't run, or who runs but doesn't use Strava, or who uses Strava but trained lightly last month, would see a degraded or empty product. The intelligence dimensions require a specific shape of training data to exercise: a load spike for ACWR, varied workout types for classification, long runs for race prediction, a complete periodization arc for phase detection.

Generated data solves all of this. The data is:

- **Reproducible**: the same seed runs produce the same 84 activities every time, so the reviewer sees exactly what was designed
- **Shaped to exercise every dimension**: the training block is deliberately constructed to hit interesting states across all six intelligence features
- **Independent of third-party APIs**: the reviewer doesn't need Strava credentials, OAuth consent, or their own activity history

Strava integration is designed as an additive layer on top of this. The app works identically whether data arrived through the seed script or through the Strava API. The intelligence engines don't know the difference.

---

## How the deterministic training block works

The population system generates a realistic 12-week half-marathon preparation block for a single demo athlete. The block follows the standard four-phase periodization structure:

**Weeks 1–3: Base phase**
Low intensity, moderate volume. Easy aerobic runs at conversational pace (zone 2 HR), one weekly stride session, long runs building from 10 km to 13 km. The goal is aerobic foundation and injury resilience before adding load.

**Weeks 4–7: Build phase**
Increasing volume and first structured intensity. Tempo runs at threshold pace (~lactate threshold, roughly 85–90% max HR), progression runs that start easy and finish at tempo, long runs building to 16–18 km. Week 7 contains a deliberate load spike — the athlete ran an extra workout on what was meant to be a rest day, pushing the weekly load ~40% above the chronic baseline. ACWR reaches ~1.45, which is the "caution range" where the injury-risk signal activates.

**Weeks 8–10: Peak phase**
Highest load weeks. Threshold intervals (4×1 km at 10 km pace), a long run at goal half-marathon pace, the longest long run of the cycle (21 km at easy effort). This is the peak training stimulus before taper.

**Weeks 11–12: Taper phase**
Volume drops ~30% week 11, ~50% week 12. Intensity stays moderate — one quality session per week to maintain sharpness. Long run shortens to 14 km, then 10 km. The taper should be visible in the training phase detector.

**Two deliberate imperfections** are embedded to make the data feel real and to exercise the execution evaluation:

1. **The load spike in week 7**: described above. Tests ACWR and injury-risk signal.
2. **An easy run in week 4 executed too hard**: what was scheduled as a zone 2 recovery run was run at tempo effort (avg HR 164 instead of 138, avg pace 5:05/km instead of 6:15/km). The workout classifier should detect this as a mismatch between the intended type (Easy) and the execution pattern (Threshold), and the execution evaluation should flag it.

Each generated activity includes: timestamp, distance (meters), duration (seconds), average pace, average heart rate, max heart rate, average cadence, GPS trace (a simple out-and-back route with realistic coordinate progression), lap splits, and an intended workout type tag used internally to evaluate execution.

---

## How TCX export fits

TCX (Training Center XML) is Garmin's open activity format. It is plain-text XML, supports heart rate, cadence, GPS coordinates, timestamps, and lap splits, and is accepted by Strava for manual upload.

The generated activities can each be serialized to a valid `.tcx` file. This serves two purposes:

1. **Strava upload path**: if a reviewer or developer wants to see the generated activities in their own Strava account, they can upload the TCX files manually. This is the optional Strava compatibility layer — the app doesn't require it, but it's available.
2. **Proof of data fidelity**: a valid TCX that Strava accepts is evidence that the generated data is realistic enough to pass format validation. A `.tcx` that Strava rejects would indicate the data is too synthetic.

FIT is the binary format Garmin devices produce natively. It is not used here because it is binary, requires a third-party library to generate, and is not human-readable. TCX provides everything needed and is inspectable without tooling.

---

## Why Strava is optional

Requiring Strava would introduce three dependencies the reviewer cannot easily satisfy:

1. A Strava account with meaningful training history
2. OAuth authorization of the app
3. Enough recent activity data to exercise the intelligence dimensions

Even a reviewer who runs might not have had a structured training block in the last 12 weeks. The coaching intelligence was designed to reason over periodized training, not casual activity. On thin data, every dimension degrades.

Strava is architecturally deferred, not permanently excluded. When it is implemented, the approach is:
- Store tokens server-side only; Iron Session holds `athleteId`, nothing else
- Validate every API response with Zod `safeParse`
- Use idempotent upserts so syncing the same activity twice is safe
- Upload generated TCX activities sequentially and poll for upload status
- Support a dry-run mode that previews what would be synced without writing

The core product does not touch any of this. Strava becomes an alternative data ingestion path for the same intelligence engines.

---

## Why Prisma is pinned to v6

Prisma v7 introduced four breaking changes that are non-trivial to absorb in a time-boxed build:

1. **Datasource configuration**: v7 changes how the `datasource db` block works and requires driver adapters for some connection modes. The v6 pattern — `url` for the pooled connection, `directUrl` for the direct CLI connection — is clean and well-documented for Supabase.

2. **Client imports**: v7 changes the generated client import path and initialization pattern. Any existing v6 client code needs mechanical updates.

3. **Environment loading**: v7 changes how and when `DATABASE_URL` is resolved, particularly in serverless environments.

4. **Seed behavior**: v7 removes `package.json#prisma.seed` in favor of `prisma.config.ts`. This is a config migration on top of everything else.

None of these are insurmountable, but absorbing all four in a single take-home build introduces unnecessary risk. Prisma v6.19 (the version installed) is stable, production-capable, and has a clear Supabase + Vercel integration path.

The `package.json#prisma.seed` deprecation warning that late v6 builds emit is acceptable. It is a warning, not an error, and it is caused by Prisma v7 moving the config format — not by anything broken in the v6 behavior.

---

## The six intelligence dimensions

Strava Athlete Intelligence describes individual activities. Pacer reasons over a training block.

**1. Periodization-aware training phase detection**

Strava knows you ran today. Pacer knows you are in week 9 of a 12-week build, currently in the peak phase, and three weeks from taper. Phase detection uses volume trend (is weekly mileage going up, holding, or coming down?), intensity distribution (what fraction of weekly runs were quality sessions?), and week-over-week loading pattern to classify the current week as Base, Build, Peak, or Taper. This context frames everything else — an ACWR spike means something different in peak week than in taper week.

**2. Bidirectional conversational coaching with persistent memory**

Strava commentary is read-only. Pacer supports a persistent coaching conversation. The coach has full intelligence context (phase, ACWR, race trajectory, recent workout execution) loaded before every message. The context is compact — pre-computed signals, not raw GPS streams — so Claude can reason about your training without token waste. Conversation history is bounded to recent turns; older context is summarized. The fallback (if Claude is unavailable) returns a deterministic coaching message from the pre-computed signals alone, so the feature degrades gracefully.

**3. ACWR-based injury-risk forecasting**

The Acute:Chronic Workload Ratio compares your 7-day training load to your 28-day chronic load. An ACWR between 0.8 and 1.3 is generally considered the "sweet spot" — enough acute load to stimulate adaptation without over-reaching. Above ~1.3 to 1.5, the workload spike signal activates. Pacer surfaces this as a risk signal, not a medical assessment: "Your 7-day load is 43% above your 28-day baseline. This is a training-load spike. Consider whether this week's plan needs to be adjusted." Strava does not compute ACWR and does not flag load spikes.

**4. Race prediction with confidence intervals and gap analysis**

The base formula is the Riegel endurance formula: T2 = T1 × (D2 / D1)^1.06. This is applied to the athlete's recent long run and tempo performances to project a half-marathon finish time. Three transparent adjustments are layered on top: a fatigue adjustment (ACWR above 1.2 widens the confidence interval and shifts the prediction pessimistically), a specificity adjustment (how many recent runs were at or near goal pace), and a data quality adjustment (fewer qualifying runs means a wider interval). All adjustments are surfaced in the UI with their reasoning. The gap analysis shows how far the projected time is from the goal, and what pace improvement is needed. Strava does not project race times.

**5. Weekly coaching brief**

A structured weekly summary produced deterministically from computed signals: current phase, ACWR status, last week's key workout and how it was executed, priority for next week, and whether the race goal is on track. Claude can rewrite this in natural language, but the core brief is generated from the intelligence context without any AI call. This means it is testable, reproducible, and available even if the Claude API is down. Strava produces per-activity commentary; it does not synthesize weekly training status.

**6. Workout type classification with execution evaluation**

A rule-based classifier that identifies the workout type from pace, heart rate, distance, and HR-to-pace ratio: Easy, Recovery, Steady State, Tempo, Threshold, Interval, Long Run. The classifier returns a label, a confidence score, an explanation of what signals drove the classification, and an execution evaluation — an assessment of whether the athlete ran the workout as intended. The execution evaluation is the key addition: it can flag that an "easy" run was executed at threshold effort, or that a scheduled tempo was run at recovery pace. This is actionable in a way that "effort level: moderate" is not.

---

## Backend architecture

### The rule: business logic never lives in route handlers or React components

Route handlers are thin. They authenticate, extract parameters, call one function from `src/lib`, and return the result. No database queries in routes, no computation, no conditional logic beyond simple guards.

React components fetch from API routes. They do not import from `src/lib` directly. They do not compute signals. They render what the API returns.

All business logic lives in `src/lib`:

| Concern | Location |
|---|---|
| Intelligence engines | `src/lib/intelligence` |
| Demo data generation | `src/lib/demo` |
| Coaching context and prompt building | `src/lib/coach` |
| Database access (Prisma client, query helpers) | `src/lib/db` |
| Zod schemas for all API shapes | `src/lib/schemas` |
| Strava integration (optional, later) | `src/lib/strava` |

### The unified intelligence context

The central abstraction is `buildAthleteIntelligenceContext(athleteId)`. Every page in the app needs some version of the same signals: training phase, ACWR, race prediction, recent workout types. Computing these independently per-route would produce duplicated logic, inconsistent results, and N redundant database roundtrips per page load.

The context builder computes everything once:

```
buildAthleteIntelligenceContext(athleteId) →
  {
    athlete: { id, name, raceGoal, targetDate }
    phase: { current, weekNumber, totalWeeks, rationale }
    acwr: { acute, chronic, ratio, signal, label }
    racePrediction: { projectedTime, confidenceInterval, adjustments, gapToGoal }
    weeklyBrief: { phaseNote, keyWorkoutNote, priorityNote, riskNote, trajectoryNote }
    recentWorkouts: [ { date, type, label, confidence, executionEvaluation, ... } ]
  }
```

`buildCoachContext(athleteId, activityId?)` extends this with:

```
{
  ...athleteIntelligenceContext,
  conversationHistory: [ ...recentTurns ],
  memorySummary: "...",   // compressed older context
  activityDetail: { ... } // only when activityId is provided
  suggestedQuestions: [ ... ]
}
```

The coach chat route calls `buildCoachContext`, serializes the result into a compact system prompt (never raw GPS data), and streams Claude's response. The conversation history is bounded to the last 10–12 turns; anything older is summarized into `memorySummary`.

This architecture means every page and every AI call draws from the same computed state. If the ACWR calculation changes, it changes once, in one place, and all consumers update automatically.

---

## Testing and commit discipline

The intelligence engines are the most logic-dense part of the build and the most likely place for subtle bugs. Each engine gets a validation script or unit test before the checkpoint is called complete:

- **ACWR**: given a known set of activity loads, assert the computed ratio and risk label
- **Riegel**: given a 10 km time of 48:00, assert the half-marathon projection is ~1:44–1:46 before adjustments
- **Periodization detector**: given week-by-week mileage arrays matching each phase shape, assert correct phase labels
- **Workout classifier**: given pace/HR pairs for each workout type, assert correct labels and execution evaluations
- **Seed determinism**: `npx prisma db seed` run twice produces identical row counts and identical field values for the first activity

Commits follow the checkpoint structure from WORKFLOW.md: one commit per logical section, only after checks pass, with a descriptive message that explains what changed and what it enables. No checkpoint is called done without having been run.

---

## What is intentionally cut

**Mobile app**: The web app is responsive, but there is no React Native or native app. The intelligence and coaching work equally well on mobile web. A native app would add significant build complexity for no intelligence gain.

**Multi-user and auth**: One demo athlete, hardcoded in the seed. The architecture is designed around `athleteId` so multi-user is a future extension, but the current build has no authentication system and no per-user data isolation.

**HRV and sleep data**: Heart Rate Variability and sleep quality are valuable training signals. Strava doesn't provide them. Incorporating them would require Garmin Connect, Apple Health, or Oura API integration — each a separate integration project. The ACWR signal is a reasonable proxy for recovery status without requiring these sources.

**Training plan generation**: The coach can advise on the current plan, but it does not generate a new 12-week plan from scratch. Plan generation requires specifying progression logic, workout type ratios, and recovery constraints — effectively building a training calculator. That is a separate product feature.

**Social features**: No feed, no segment comparison, no club coaching. Pacer is about individual training optimization. Social mechanics are orthogonal to the core coaching value.

**Real-time / live activity**: No live GPS tracking or in-run coaching. All intelligence runs post-activity on completed data.

**Historical Strava import**: A production product would import years of Strava history to build a longer chronic load baseline and better race prediction models. The demo uses 12 weeks of generated history, which is enough to exercise all six dimensions but not enough for multi-year trend analysis.

---

## What would come next with more time

**Real Strava OAuth for personal accounts**: The architecture already separates data ingestion from intelligence, so wiring up a real OAuth flow would populate the same tables the intelligence engines read from. The generated data path remains as a demo/fallback.

**Multi-athlete with proper auth**: The athleteId abstraction makes this mostly additive — add auth middleware, per-user session management, and data isolation at the database layer.

**Longitudinal trend analysis**: With more than 12 weeks of history, it becomes possible to detect whether an athlete is on a long-term fitness trajectory (improving, plateauing, declining) and adjust coaching posture accordingly.

**HRV and sleep correlation**: Adding a recovery data source and correlating it with ACWR and training response would significantly improve the injury-risk signal. The risk module is designed to accept additional signals.

**Training plan generation**: Given a race goal, target date, and current fitness level, generate a structured training plan. This requires building a progression calculator and a workout scheduling engine — a separate feature layer above the current intelligence stack.

**Notification system**: Weekly brief pushed to email or push notification. The brief is already generated deterministically on the server; delivery is a pipeline question.

**Richer race prediction**: The Riegel formula is a strong baseline, but a model trained on personal PBs across distances would produce better confidence intervals. With more personal history, calibrate the exponent individually rather than using the population average of 1.06.
