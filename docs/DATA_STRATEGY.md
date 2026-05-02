# DATA_STRATEGY.md — Pacer

## Why generated data, not real Strava data

The primary data path is a deterministic 12-week half-marathon training block seeded into the database. Real Strava data is not required and not the default.

**The problem with real data:** A reviewer without a structured recent training block would see empty states, degraded predictions, and untriggered signals across all six intelligence dimensions. The ACWR spike requires a specific week of overreach. Race prediction requires tempo performances. Phase detection requires a full periodization arc. These states cannot be guaranteed with real data.

**The generated block guarantees:** every intelligence dimension is exercised in a specific, inspectable way. The reviewer sees the full product, not a degraded experience.

---

## Why the block is deterministic

`generateDemoPlan()` uses mulberry32, a seeded PRNG (seed = 42), for all jitter in pace, heart rate, cadence, and elevation. The reference date is fixed at `2026-05-02T00:00:00Z` — never `new Date()`.

This means:
- Running `npx prisma db seed` three times produces byte-identical rows
- The `seedHash` in `GeneratedDatasetMetadata` is derived from `athlete-email:race-date:goal-time:version`. Bumping `DEMO_VERSION` forces a re-seed; unchanged version skips (idempotent)
- Reviewers can re-run the seed at any point without corrupting their local state
- The validate-seed script can be run on any environment and will always pass

---

## Why the imperfections are intentional

Two anomalies are embedded in the data to make the intelligence dimensions exercisable and to make the data feel like a real athlete's training history.

### 1. Zone-mismatch easy run (week 4, Sunday)

An easy run scheduled as Zone 2 aerobic work was executed at moderate aerobic effort (Zone 3). `avgHeartRate = 157 bpm` against an easy HR ceiling of 145 bpm — 12 bpm over.

The workout classifier detects this and labels the activity `STEADY_STATE` instead of `EASY`. The `executionEvaluation` field explains the mismatch. `intendedWorkoutType` remains `EASY` so the gap is visible.

**Why this matters:** It tests the execution evaluation path — the most distinctive feature of Pacer's workout classifier versus Strava's activity commentary.

### 2. Training-load spike (week 8)

Week 8 contains six runs instead of the standard five. The sixth run (Sunday, 10 km easy) is an unplanned "extra run on a rest day." Combined with the peak-week long run (22 km), this pushes weekly training load to ~800 TRIMP units.

The ACWR computation uses the Gabbett method with a strict 4-prior-week minimum:
- Weeks 1–4: ACWR = 1.0 (neutral — chronic baseline not yet stable)
- Weeks 5–7: ACWR 1.13–1.28 (build-phase elevation, within normal range)
- **Week 8: ACWR = 1.337** — the only week exceeding 1.3
- Week 9: ACWR = 0.447 (recovery week, freshness building)

The 4-week minimum is standard Gabbett methodology. Without it, weeks 2–4 produce artificially high ACWR due to a shallow chronic denominator, creating false spike signals before the deliberate spike even occurs.

**Why this matters:** It exercises the ACWR injury-risk signal at a specific, predictable moment. The reviewer can see the spike, the warning, and the recovery arc all in the dashboard.

---

## How to run the full data pipeline

```bash
# 1. Apply migrations (only needed once per environment)
npx prisma migrate deploy

# 2. Seed the database (idempotent — safe to run multiple times)
npx prisma db seed

# 3. Validate all seeded records against Zod schemas
npm run validate:seed

# 4. Export TCX files (independent of seeding — reads from DB)
npm run export:tcx
```

`validate:seed` reports PASS/FAIL per schema and exits with code 1 on any failure. Run it after any change to `generate-training-plan.ts` or the Prisma schema to catch regressions.

`export:tcx` can be re-run independently at any time — it reads activity records from the database, generates GPS-tagged Garmin TCX v2 XML, validates each file with fast-xml-parser, and writes to `generated-training-data/tcx/`.

---

## Dataset summary (v1.1.0)

| Dimension | Coverage |
|---|---|
| Total activities | 54 across 12 weeks |
| Workout types | EASY (26), LONG_RUN (11), TEMPO (7), INTERVAL (6), RECOVERY (2), THRESHOLD (1), STEADY_STATE (1) |
| Periodization phases | BASE → BUILD → PEAK → RECOVERY → BUILD → TAPER |
| Peak ACWR (week 8) | 1.337 — only week exceeding 1.3 |
| Peak long run | 22 km (week 8) |
| CTL range | 8.2 → 64.5 |
| Zone-mismatch activity | Week 4 Sunday: intended EASY, executed STEADY_STATE (HR 157 vs 145 ceiling) |
| Goal race | SF Half Marathon, 2026-08-02, goal 1:55:00 |
| Tempo/threshold from | Week 4 onward (8 sessions total) — sufficient for Riegel prediction |
