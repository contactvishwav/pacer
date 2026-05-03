# WORKFLOW.md — Pacer development workflow

## Core loop

Every working session follows this five-step loop. Do not skip steps.

### 1. Prompt a bounded task

Scope the task to a single coherent unit — one lib module, one route, one page, one schema. Do not ask for "the whole intelligence layer" in one prompt. Smaller scopes produce reviewable diffs and clean commits.

Include in the prompt:
- Which checkpoint this task belongs to (see §Checkpoints)
- Which files should be touched
- What the expected output or behavior is
- Any constraints from `AGENT_GUIDELINES.md` that apply

### 2. Inspect generated changes

Before running anything, read the diff.

- Does it match the intended scope?
- Does it contain any business logic in route handlers or React components?
- Does it touch Prisma config in a way that could signal a v7 migration?
- Does it introduce hardcoded values instead of computing from seeded data?
- Does it add Strava code before core is working?

If the diff has unintended changes, revert or surgically remove them before proceeding.

### 3. Run relevant checks

Run the checks appropriate to what was just built. Do not claim a section is done without running them.

| What was built | Checks to run |
|---|---|
| Prisma schema | `npx prisma validate`, `npx prisma generate` |
| Seed / population | `npx prisma db seed`, verify row counts |
| `src/lib` module | `npx tsc --noEmit`, unit test if present |
| API route | `npx tsc --noEmit`, curl or integration test |
| React page | `npx tsc --noEmit`, visual check in browser |
| Full section | `npm run build` or `npm run type-check` |

If a check fails, fix it before committing. Do not move to the next checkpoint with a broken build.

### 4. Fix failures

Fix the root cause — do not suppress errors, skip hooks, or add `// @ts-ignore` to pass a check. If a failure reveals a design issue rather than a typo, escalate to a prompt that addresses the design.

### 5. Commit the section

Write a commit message that describes the checkpoint and the concrete change. Example:

```
feat(intelligence): add ACWR calculation and injury-risk signal

Computes acute and chronic workload from seeded activities.
Returns risk signal, ACWR ratio, and cautious copy for UI.
```

Stage only the files belonging to this checkpoint. Do not batch unrelated changes.

### Switch tools only after a clean commit

If switching from Claude Code to Cursor (or vice versa), do so only after a clean commit with passing checks. Never hand off a broken or partially complete state.

---

## Checkpoints

Work in this order. Each checkpoint has a defined commit boundary.

### CP-01 — Foundation

**Scope:** repo init, Next.js + TypeScript config, Tailwind, ESLint, path aliases, environment variable setup, `.env.example`

**Done when:** `npm run dev` starts, `npx tsc --noEmit` passes, no lint errors

**Commit:** `chore(foundation): init Next.js project with TypeScript and Tailwind`

---

### CP-02 — Prisma schema

**Scope:** `prisma/schema.prisma` with all models (Athlete, Activity, Lap, Stream, CoachMessage, WeeklyBrief); Prisma v6 datasource block; initial migration

**Done when:** `npx prisma validate` passes, `npx prisma generate` succeeds, migration applied to dev database

**Commit:** `feat(schema): add Prisma v6 schema and initial migration`

---

### CP-03 — Population system

**Scope:** `src/lib/demo` — deterministic 12-week half-marathon training block generator; outputs canonical activity objects that can be seeded or exported as TCX

**Done when:** `npx prisma db seed` populates the database; row counts verified; at least one TCX file can be generated and is valid XML

**Commit:** `feat(demo): add deterministic training block generator and seed`

---

### CP-04 — Zod schemas

**Scope:** `src/lib/schemas` — Zod types for all API request/response shapes, activity objects, intelligence context, and coach messages

**Done when:** `npx tsc --noEmit` passes; schemas imported cleanly by at least one lib module

**Commit:** `feat(schemas): add Zod schemas for API contracts and intelligence context`

---

### CP-05 — Intelligence engines

**Scope:** `src/lib/intelligence` — all six engines: periodization detection, ACWR, race prediction (Riegel), workout classification, weekly brief builder, `buildAthleteIntelligenceContext`

**Done when:** each engine has a unit test or validation script; `npx tsc --noEmit` passes; ACWR, Riegel, and weekly brief produce correct deterministic output from seeded data

**Commit:** `feat(intelligence): add six intelligence engines and unified context builder`

---

### CP-06 — API routes

**Scope:** API routes for dashboard context, activity detail, weekly brief, race prediction, and workout classification; thin handlers delegating to `src/lib`

**Done when:** each route returns correct JSON from seeded data; `npx tsc --noEmit` passes; curl or integration tests verified

**Commit:** `feat(api): add dashboard, activity, brief, race, and classifier routes`

---

### CP-07 — Coaching API

**Scope:** `src/lib/coach`, `buildCoachContext`, streaming coach chat route; bounded history; deterministic fallback if Claude API unavailable; `export const runtime = 'nodejs'`, `maxDuration = 60`

**Done when:** coach chat returns a response from seeded context; streaming works end-to-end; fallback tested by temporarily removing API key

**Commit:** `feat(coach): add coaching context builder and streaming chat route`

---

### CP-08 — Frontend shell

**Scope:** app layout, navigation, global styles (dark-first), font, shared components (skeleton, error boundary, empty state)

**Done when:** shell renders at `/`; nav links to all major pages; loading/empty/error components render correctly in isolation

**Commit:** `feat(shell): add app layout, navigation, and shared UI primitives`

---

### CP-09 — Dashboard page

**Scope:** `/` or `/dashboard` — training phase, ACWR risk card, race prediction card, weekly focus card, coach prompt suggestions; answers the five training questions

**Done when:** page renders from seeded data; all five questions answered; loading, empty, and error states verified in browser

**Commit:** `feat(dashboard): add dashboard page with training phase, risk, and race cards`

---

### CP-10 — Activity Intelligence page

**Scope:** `/activity/[id]` — workout classification, execution evaluation, per-activity coaching insight

**Done when:** page renders correct data for a seeded activity; classification label and explanation visible; loading/empty/error states present

**Commit:** `feat(activity): add activity intelligence page with classification and insight`

---

### CP-11 — Weekly Brief page

**Scope:** `/brief` — deterministic brief rendered from computed signals; optional AI rewrite via coach

**Done when:** brief renders without Claude API; AI rewrite button works when API key present; loading/empty/error states present

**Commit:** `feat(brief): add weekly coaching brief page with deterministic and AI paths`

---

### CP-12 — Race Goal page

**Scope:** `/race` — Riegel prediction, confidence interval, gap analysis, transparent adjustment breakdown

**Done when:** prediction renders from seeded data; adjustments surfaced; loading/empty/error states present

**Commit:** `feat(race): add race goal page with Riegel prediction and gap analysis`

---

### CP-13 — Coach Chat page

**Scope:** `/coach` — streaming conversation, persistent message history, bounded context, memory summary for older turns

**Done when:** multi-turn conversation works; history persists across page reload; streaming renders progressively; fallback message shown if Claude API unavailable

**Commit:** `feat(coach-ui): add coach chat page with streaming and persistent history`

---

### CP-14 — Polish

**Scope:** visual polish across all pages, responsiveness, accessibility baseline, copy review (no medical claims, cautious injury language throughout)

**Done when:** all pages pass visual review; no raw error objects exposed; injury-risk copy audited

**Commit:** `polish: visual review, responsiveness, and copy audit`

---

### CP-15 — Docs and deployment

**Scope:** `README.md`, `APPROACH.md`, `AI_USAGE.md`, `docs/VIDEO_SCRIPT.md`, `docs/FEATURE_AUDIT.md`, `FINAL_CHECKLIST.md`; Vercel deploy config; smoke test on deployed URL

**Done when:** all six doc files present; app deploys and loads from seeded data on Vercel; final checklist signed off

**Commit:** `docs: add final documentation and deployment config`

---

## Quick reference: what not to do at any checkpoint

- Do not skip running checks before committing
- Do not move to the next checkpoint with a failing type-check or broken seed
- Do not add Strava code before CP-15 is reached and core is verified
- Do not upgrade Prisma to v7
- Do not put business logic in route handlers or React components
- Do not hardcode values that should come from seeded data
- Do not make medical claims in any UI copy

---

## Running the Full Validation Suite

Run these after seeding the database (`npx prisma db seed`) and after any significant change to intelligence engines, the seed, or TCX export.

```bash
npm run validate:seed
npm run validate:training-load
npm run validate:classifier
npm run validate:injury-risk
npm run validate:periodization
npm run validate:race-prediction
npm run validate:weekly-brief
npm run validate:context
npm run validate:tcx
```

All 9 scripts should pass before submission.

The `validate:tcx` script requires TCX files to be present. Run `npm run export:tcx` first if the `generated-training-data/tcx/` directory is empty or missing.
