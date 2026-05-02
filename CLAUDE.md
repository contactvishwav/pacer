# CLAUDE.md — Pacer

## Before every task

Read `AGENT_GUIDELINES.md` and `AGENT_GUIDELINES_SUMMARY.md` before starting any task in this project. These files are the authoritative source of product, architecture, and quality rules. Do not skip this step.

## Route handler discipline

Keep route handlers thin. Route files must not contain business logic, intelligence calculations, or database query composition. Delegate to `src/lib`.

## After each working section

1. Run the relevant type-check, lint, or test command for what was just built.
2. Inspect the diff — confirm it matches the intended scope and contains no unintended changes.
3. Write a short summary of what changed and what risks or open questions remain.
4. Commit before moving to the next section.

Do not call a section complete until it has been run or there is an explicit documented reason why it cannot be run locally.

## Strava

Do not implement Strava integration until the full core product is working from seeded data. Strava is optional. The reviewer must be able to evaluate every shipped dimension without Strava credentials.

## Prisma

Prisma is pinned to v6. Do not upgrade to Prisma v7 for any reason during this project.

- Use `package.json#prisma.seed`; deprecation warnings from late Prisma v6 builds are acceptable
- Always seed explicitly: `npx prisma db seed`
- Never rely on `migrate dev` or `migrate reset` to seed
- Datasource must use `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")`

## Intelligence context

All features draw from a unified context:

```ts
buildAthleteIntelligenceContext(athleteId)
buildCoachContext(athleteId, activityId?)
```

Do not recompute signals inside React components or individual route handlers. Never duplicate intelligence logic.

## Claude API routes

```ts
export const runtime = 'nodejs'
export const maxDuration = 60
```

- Model: `ANTHROPIC_MODEL` env var if set, otherwise `claude-sonnet-4-6`
- Send compact computed signals — never raw per-second activity streams
- Bound conversation history to recent turns; summarize older context
- Core weekly brief and training signals must work deterministically without Claude

## Language rules

- Injury-risk copy: use "risk signal", "training-load spike", "caution range", "higher-risk pattern" — no medical claims
- Workout classifier: rule-based, returns `label`, `confidence`, `explanation`, `execution_evaluation`
- Race prediction: Riegel formula base (`T2 = T1 × (D2/D1)^1.06`) with transparent adjustments surfaced in the UI

## Frontend

Every page must have loading, empty, and error states. Dark-first premium fitness/AI aesthetic. The dashboard must answer: where am I in training, am I at risk, am I on track for my race, what should I do this week, what should I ask the coach.
