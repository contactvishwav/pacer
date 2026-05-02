# AGENT_GUIDELINES.md — Pacer

## Product framing

Pacer is not a prototype, toy, or shallow MVP. It is a finished vertical slice of an AI running coach. The slice is narrow but complete, polished, and reviewer-ready.

**Product goal:** Pacer improves on Strava Athlete Intelligence by turning one-way activity commentary into proactive, conversational training coaching.

---

## Shipped dimensions (six, non-negotiable)

1. Periodization-aware training phase detection
2. Bidirectional conversational coaching with persistent memory
3. ACWR-based injury-risk forecasting
4. Race prediction with confidence intervals and gap analysis
5. Weekly coaching brief
6. Workout type classification

All six must be present, functional, and testable in the submitted build.

---

## Data strategy

The primary data path is a **deterministic generated training block**, not hardcoded UI values.

Build a population system that generates a realistic 12-week half-marathon training history for one demo athlete. The canonical generated activity objects must support:

1. Direct Prisma/Supabase seeding
2. TCX file export
3. Optional Strava upload later (see §Optional Strava)

The app must work from the seeded database path. **Strava must not be required for the reviewer to evaluate the product.**

---

## TCX policy

If generating activity files, use `.tcx`, not `.fit`.

- TCX is XML/plain text
- Supports HR, cadence, GPS, timestamps, and laps
- Accepted by Strava
- FIT is binary and unnecessary for this project

Never generate `.fit` files.

---

## Prisma version decision

Pacer intentionally pins Prisma to **v6** using `prisma@6` and `@prisma/client@6`. Do not upgrade to Prisma v7 during this project.

**Reason:** Prisma v7 changes datasource configuration, requires driver adapters, changes generated client imports, changes environment loading, and removes automatic generate/seed behavior. For this time-boxed product slice, Prisma v6 gives a simpler, stable Supabase + Vercel path.

Use Prisma v6 datasource style:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Seed behavior

Use `package.json#prisma.seed` with Prisma v6. Later Prisma v6 versions may warn that `package.json#prisma` is deprecated because Prisma v7 moves configuration to `prisma.config.ts`. That warning is acceptable — Prisma is intentionally pinned to v6.

Always run seed explicitly:

```bash
npx prisma db seed
```

Do not rely on automatic seeding from `migrate dev` or `migrate reset`.

---

## Architecture

### Route handlers

Keep route handlers thin. No business logic in route files.

### Business logic locations

| Concern | Location |
|---|---|
| Intelligence & analysis | `src/lib/intelligence` |
| Demo data generation | `src/lib/demo` |
| Coaching logic | `src/lib/coach` |
| Database access | `src/lib/db` |
| Zod schemas | `src/lib/schemas` |
| Strava integration (optional) | `src/lib/strava` |

### Intelligence context

Use a unified intelligence context object:

```ts
buildAthleteIntelligenceContext(athleteId)
buildCoachContext(athleteId, activityId?)
```

This context powers: Dashboard, Activity Intelligence, Weekly Brief, Race Goal, and Coach Chat.

Do not duplicate intelligence logic in React components.

---

## Claude streaming

For Claude API routes:

```ts
export const runtime = 'nodejs'
export const maxDuration = 60
```

- Use `ANTHROPIC_MODEL` env var if set; otherwise default to `claude-sonnet-4-6`
- Do not send raw per-second streams to Claude — send compact computed signals
- Bound conversation history to recent turns; use memory/summary for older context

---

## Feature-specific rules

### Injury-risk language

Use cautious language throughout:

- "risk signal"
- "training-load spike"
- "caution range"
- "higher-risk pattern"

Do not make medical claims.

### Workout classification

Use transparent rule-based classification for the shipped slice. Return:

- `label`
- `confidence`
- `explanation`
- `execution_evaluation`

### Race prediction

Use a transparent heuristic, not fake ML. Base formula:

```
T2 = T1 × (D2 / D1)^1.06   (Riegel formula)
```

Apply transparent adjustments for fatigue, specificity, and data quality. Surface the adjustments in the UI.

### Weekly brief

Generate a deterministic brief from computed signals first. Claude can explain or rewrite it later, but the core brief must not require AI to produce.

---

## Frontend quality

Every shipped page must have loading, empty, and error states.

Use a dark-first premium fitness/AI aesthetic.

The dashboard must answer these five questions:

1. Where am I in training?
2. Am I at risk?
3. Am I on track for my race?
4. What should I do this week?
5. What should I ask the coach?

---

## Testing

Every major section must include automated tests, validation scripts, smoke tests, or documented manual checks.

Do not call a section complete unless it has been run or has a clear reason why it cannot be run locally.

---

## Git discipline

After each coherent working section: run relevant checks, inspect the diff, and commit. Do not let multiple unrelated changes accumulate in a single commit.

---

## Optional Strava integration

Strava is optional. If implemented:

- Store tokens server-side, not in cookies
- Iron Session stores `athleteId` only
- Use `getValidStravaToken()` for all token access
- Validate all Strava API responses with Zod `safeParse`
- Use idempotent upserts when syncing activities
- Do not re-import streams if already present in the database
- If uploading generated activities, upload TCX sequentially and poll upload status
- Support dry-run mode

---

## Final documentation checklist

The submitted build must include:

- `README.md`
- `APPROACH.md`
- `AI_USAGE.md`
- `docs/VIDEO_SCRIPT.md`
- `docs/FEATURE_AUDIT.md`
- `FINAL_CHECKLIST.md`

---

## What not to do

- Do not hardcode UI values — compute them from seeded data
- Do not require Strava for the reviewer flow
- Do not put business logic in React components
- Do not use `.fit` files
- Do not upgrade Prisma to v7
- Do not send raw activity streams to Claude
- Do not make medical claims in injury-risk copy
- Do not call a section done without running it
