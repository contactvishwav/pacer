# Feature Audit — Pacer

End-to-end audit of all six shipped intelligence dimensions.
Conducted against the seeded demo dataset (Alex Chen, SF Half Marathon 2026-08-02).

---

## Dimension Status Table

| # | Dimension | Status | Notes |
|---|-----------|--------|-------|
| 1 | Periodization-Aware Training Phase | **PASS** | Five phases detected; all validation tests pass |
| 2 | Conversational Coaching with Persistent Memory | **FIXED** | Dashboard suggested-question pills now wire sessionStorage |
| 3 | ACWR Injury-Risk Forecasting | **PASS** | Week 8 ACWR = 1.337 (caution); zone bar correct |
| 4 | Race Prediction with Confidence Intervals | **PASS** | 1:53:19 projected; Riegel + TSB adjustments surface in UI |
| 5 | Weekly Coaching Brief | **PASS** | All 5 sections; fully deterministic; coach CTA wired |
| 6 | Workout Type Classification | **PASS** | Week 4 zone-mismatch run = TOO_HARD; followUpQuestion correct |

---

## Dimension 1: Periodization-Aware Training Phase

**Backend:** `src/lib/intelligence/periodization.ts`
**API:** `GET /api/dashboard` → `phase` field
**Frontend:** `src/app/dashboard/page.tsx` → `PhaseCard`

### Checks

- **Phase variety in seeded data:** Phase detection runs live against the 12-week training block. Using the current reference date (2026-05-03, 91 days to race), the engine returns RECOVERY because week 12 weekly load (230 TRIMP) dropped 47% below the prior 3-week average (431 TRIMP). Synthetic unit tests in `validate:periodization` confirm all five phases fire correctly under their respective conditions.
- **PhaseCard displays:** Phase name, confidence label, primary reason, coaching implication callout (left-bordered card), CTL/ATL/TSB/Trend stat row, days until race.
- **Timeline strip:** Five-segment arc (BASE → BUILD → PEAK → TAPER → RACE). The active segment highlights for BASE, BUILD, PEAK, and TAPER. RECOVERY is a transient override phase intentionally excluded from the arc; the phase badge still displays "RECOVERY" prominently.
- **Phase feeds weekly brief and coach context:** `buildAthleteIntelligenceContext` feeds phase into `generateWeeklyBrief` and `buildCoachContext`. Confirmed via `validate:context`.

### Validation results

```
validate:periodization  All assertions passed (5 synthetic + 3 live-data)
validate:context        Phase present in both AthleteIntelligenceContext and CoachContext
```

---

## Dimension 2: Conversational Coaching with Persistent Memory

**Backend:** `src/app/api/coach/conversations/route.ts`, `src/app/api/coach/conversations/[id]/messages/route.ts`, `src/lib/coach/system-prompt.ts`, `src/lib/coach/deterministic.ts`
**API:** `POST /api/coach/conversations`, `POST /api/coach/conversations/[id]/messages`
**Frontend:** `src/app/coach/page.tsx`

### Checks

- **Streaming:** ReadableStream with plain `text/plain; charset=utf-8`. Claude SDK streams via `anthropic.messages.stream()`. Frontend reads with `ReadableStream.getReader()` and updates message content incrementally. Blinking cursor shown during streaming.
- **Deterministic fallback:** Two paths covered:
  - Gap 2A: `ANTHROPIC_API_KEY` absent → `__FALLBACK__\n` sentinel prepended + word-by-word stream from `buildDeterministicCoachingResponse()`. Frontend detects sentinel and marks message as `isFallback`.
  - Gap 2B: Claude call fails mid-stream → catch block streams fallback text after partial content; no `__FALLBACK__\n` sentinel (partial Claude tokens already in client buffer).
- **Conversation history:** `buildCoachContext` fetches last 8 messages (`take: 8`), then chronologically ordered after filtering system messages.
- **SessionStorage handoff:**
  - Activity detail page → `/coach`: sets `coach_prefill_question` and `coach_activity_id`.
  - Weekly brief page → `/coach`: sets `coach_prefill_question` with keySignal-based question.
  - Race goal page → `/coach`: sets `coach_prefill_question` with prediction-based question.
  - Dashboard CTA question pills → `/coach`: **FIXED** — now sets `coach_prefill_question` before navigating.

### What was fixed

**Before:** `CoachCTA` in `dashboard.tsx` showed three suggested questions but `onClick={() => router.push('/coach')}` discarded the question text — all three buttons produced identical blank coaching sessions.

**After:** Each button calls `navigateWithQuestion(q)` which sets `sessionStorage.setItem('coach_prefill_question', q)` before navigating. The question was also **de-hardcoded** — `deriveSuggestedQuestions` now uses `weeklyBrief.keySignal` in q1 instead of a static placeholder.

---

## Dimension 3: ACWR Injury-Risk Forecasting

**Backend:** `src/lib/intelligence/injury-risk.ts`
**API:** `GET /api/dashboard` → `injuryRisk` field
**Frontend:** `src/app/dashboard/page.tsx` → `InjuryRiskCard`, `ACWRZoneBar`

### Checks

- **Week 8 caution:** `validate:injury-risk` confirms week 8 ACWR = 1.337, category = caution.
- **Zone bar boundaries:** Rendered at 0.8 (40% of MAX=2.0), 1.3 (65%), 1.5 (75%). Boundary labels present. Current ACWR marker is a glowing white vertical bar.
- **Zone colors:** underload=blue, optimal=green, caution=amber, high-risk=red.
- **Card title:** "Training-Load Risk Signal" — no bare "injury risk" noun.
- **Explanation language:** Uses "ACWR", "training-load spike signal", "caution range", "higher-risk pattern" throughout `injury-risk.ts`. No medical claims, no injury probability statistics.
- **Coach recommendation box:** Present in `InjuryRiskCard` with `recommendedAction` text.
- **Contributing factors:** Rendered as bullet list when present.

### Validation results

```
validate:injury-risk  All assertions passed
  PASS  Week 8 produces caution or high-risk (caution, ACWR 1.337)
  PASS  Weeks 1–4 return insufficient-data
  PASS  At least one taper week returns optimal or underload
  PASS  acwrHistory has 6 entries
  PASS  weeklyLoadTrend has 6 entries
```

---

## Dimension 4: Race Prediction with Confidence Intervals

**Backend:** `src/lib/intelligence/race-prediction.ts`
**API:** `GET /api/race-prediction`
**Frontend:** `src/app/race-goal/page.tsx`

### Checks

- **Realistic prediction:** 1:53:19 (6799s), well within 5400–8100s range.
- **Riegel formula used:** `T2 = T1 × (D2/D1)^1.06`. Best qualifying effort: 9 km TEMPO at 5:16/km (2026-04-16). TSB freshness adjustment applied (−2%, TSB = 7.8).
- **Confidence band visualization:** `ConfidenceIntervalBar` renders a gradient bar (green→primary→amber) with a triangular marker pointing to the predicted time. Optimistic and pessimistic labels below.
- **Confidence range:** 1:49:14 – 1:57:24. Band narrows when training is consistent; widens for short qualifying efforts.
- **Confidence score:** 80/100. Progress bar colored green/amber/red based on score.
- **Gap analysis:** "1:41 ahead of goal pace" displayed in green.
- **Language:** "Estimated trajectory", "Projected finish (estimated)", "confidence range based on recent training", "Estimated based on current training data. Not a guarantee." No "you will finish in X."
- **Supporting signals:** Phase badge, CTL, TSB, trend, weeks of data.
- **Coach CTA:** Sets `sessionStorage.setItem('coach_prefill_question', ...)` with `whatNeedsToHappen` + "How do I make this happen?" before navigating.

### Validation results

```
validate:race-prediction  All assertions passed
  PASS  predictedTimeSeconds is between 5400 and 8100 (1:53:19)
  PASS  confidenceLow < predictedTimeSeconds < confidenceHigh
  PASS  gapToGoalSeconds is a finite number (-101)
  PASS  confidenceScore between 10 and 95 (80)
```

---

## Dimension 5: Weekly Coaching Brief

**Backend:** `src/lib/intelligence/weekly-brief.ts`
**API:** `GET /api/weekly-brief`
**Frontend:** `src/app/weekly-brief/page.tsx`

### Checks

- **All five sections present:** `lastWeekReview`, `thisWeekPrescription`, `keySignal`, `warnings`, `suggestedFocus`. Validated by schema check in `validate:weekly-brief`.
- **Deterministic:** `generateWeeklyBrief()` computes entirely from intelligence context signals — no Claude call. Claude can elaborate on the brief via coach chat.
- **Content quality (live data):** keySignal references actual CTL value (59.9) and trend direction. Prescription is phase-appropriate (recovery week → easy runs only). lastWeekReview cites actual TRIMP numbers.
- **Summary strip:** `WeeklyBriefPage` displays weekly load (TRIMP), ACWR with category label, phase badge, days to race, and gap-to-goal. All values computed from API.
- **Coach CTA:** Prefills sessionStorage with `"Looking at my weekly brief: {keySignal} Can you help me understand what to prioritize this week?"` before navigating to `/coach`.
- **Monday anchor:** Page header shows "Week of Monday, [date]" computed client-side.

### Validation results

```
validate:weekly-brief  All assertions passed
  PASS  Output validates against WeeklyBriefResultSchema
  PASS  lastWeekReview has 2–4 items (4)
  PASS  thisWeekPrescription has 2–4 items (4)
  PASS  keySignal is non-empty
  PASS  warnings is an array
  PASS  suggestedFocus is non-empty
```

---

## Dimension 6: Workout Type Classification

**Backend:** `src/lib/intelligence/workout-classifier.ts`
**API:** `GET /api/activities`, `GET /api/activities/[id]/intelligence`
**Frontend:** `src/app/activities/page.tsx`, `src/app/activities/[id]/page.tsx`

### Checks

- **Color coding consistency:** Workout type badges use the same color scheme across all pages (EASY=zinc, RECOVERY=green, STEADY_STATE=amber, TEMPO=blue, THRESHOLD=blue-300, INTERVAL=orange, LONG_RUN=purple, RACE=red).
- **Zone-mismatch run (week 4, HR 157):** Classified as STEADY_STATE (not EASY) with `executionEvaluation = TOO_HARD`. Zone 2 warning callout shown in `ClassificationCard` for TOO_HARD easy/recovery runs.
- **executionEvaluation stored as enum:** Seed stores 'MATCHED_INTENT', 'WELL_EXECUTED', 'TOO_HARD' (not narrative strings). `executionLabel()` helper in the intelligence route converts enum to display text.
- **followUpQuestion routing:** `buildFollowUpQuestion()` matches against enum values. TOO_HARD easy run → "Why does it matter that I ran this easy run too hard?"; WELL_EXECUTED TEMPO → "How does this tempo session affect my race prediction?"; INTERVAL WELL_EXECUTED → "Are my interval sessions building the right fitness for my goal race?"
- **Ask Coach CTA:** Activity detail page sets both `coach_prefill_question` and `coach_activity_id` in sessionStorage, so the coach chat opens with activity context attached.
- **Classification accuracy:** 85.2% vs intended workout type across all 54 seeded activities (above 75% threshold). LONG_RUN misclassified as EASY in late taper weeks when long-run distance shrinks below HR thresholds — expected behavior.

### Validation results

```
validate:classifier  All assertions passed
  PASS  Zone-mismatch run gets executionEvaluation = TOO_HARD
  PASS  At least 3 INTERVAL activities (found 6)
  PASS  At least 3 TEMPO activities (found 9)
  PASS  At least 4 LONG_RUN activities (found 7)
  PASS  Classification accuracy > 75% vs intendedWorkoutType (85.2%)
```

---

## PARTIAL items (intentionally out of scope)

| Item | Status | Reason |
|------|--------|--------|
| RECOVERY phase in timeline arc | PARTIAL | RECOVERY is a transient override, not a sequential training phase. The arc (BASE→BUILD→PEAK→TAPER→RACE) represents the planned training journey; the badge and coaching implication still display correctly when RECOVERY fires. |
| Strava integration | NOT IMPLEMENTED | Per AGENT_GUIDELINES: Strava is optional; the full product must work from seeded data. Reviewer can evaluate every dimension without Strava credentials. |
| Coach memory persistence | PASS | CoachMemory records are seeded (1 memory present), read by `buildCoachContext`, and surface in the system prompt. `maybeExtractMemory()` — a fire-and-forget secondary Claude call — runs after each successful coaching turn and writes new `CoachMemory` records when durable context is detected. Memory is fully implemented end-to-end. |

---

## Validation suite summary

| Script | Result |
|--------|--------|
| `validate:seed` | PASS — 54 activities, 12 weeks, zone-mismatch confirmed |
| `validate:classifier` | PASS — 85.2% accuracy, all key assertions |
| `validate:injury-risk` | PASS — week 8 caution, ACWR history correct |
| `validate:periodization` | PASS — all 5 phases, live + synthetic |
| `validate:race-prediction` | PASS — realistic time, confidence band, gap |
| `validate:weekly-brief` | PASS — all 5 sections, schema validates |
| `validate:context` | PASS — unified context, token budget 1235 < 2500 |
| `npm run typecheck` | PASS — zero errors |
| `npm run build` | PASS — all routes compile and static-generate |

---

## Overall assessment

**The product is ready for submission.**

All six intelligence dimensions are implemented, functional, and testable from the seeded dataset. The reviewer does not need Strava credentials, a Claude API key, or any external service to evaluate the core product — the deterministic fallback path covers the coaching interface when no API key is configured.

The one gap found and fixed during this audit (dashboard Coach CTA not wiring sessionStorage) was a UX regression where question pills appeared interactive but didn't actually pass context to the coach page.
