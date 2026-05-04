# Pacer
> AI-powered training coaching, rebuilt from Strava's Athlete Intelligence

Pacer turns a runner's activity history into a persistent coaching relationship — surfacing training phase, injury-risk signals, race trajectory, weekly coaching briefs, and workout execution feedback that Strava's current product does not provide. It solves the problem that Strava Athlete Intelligence is a describer (it tells you what happened after a run) but not a coach (it does not tell you what to do next or whether you are on track for your race goal). No Strava account is required: the app ships with a deterministic 12-week generated training dataset seeded into Supabase that exercises all six intelligence dimensions.

---

## What Was Built

| Dimension | What it does | Status |
|---|---|---|
| Periodization-Aware Intelligence | Detects training phase (BASE/BUILD/PEAK/TAPER/RECOVERY) from load patterns and anchors all coaching to the goal race | ✅ Shipped |
| Conversational Coaching | Streaming AI coach with persistent memory, conversation history, and deterministic fallback | ✅ Shipped |
| ACWR Injury-Risk Forecasting | Gabbett ratio spike detection with proactive caution/high-risk warnings | ✅ Shipped |
| Race Prediction | Riegel formula with TSB fatigue adjustment and confidence intervals | ✅ Shipped |
| Weekly Coaching Brief | Deterministic Monday brief from computed signals — no AI call required | ✅ Shipped |
| Workout Type Classification | Rule-based classifier with execution evaluation vs. intended workout | ✅ Shipped |

---

## Tech Stack

| Layer | Technology | Note |
|---|---|---|
| Framework | Next.js 16 App Router | Server components + streaming SSE |
| Language | TypeScript 6 (strict) | |
| Styling | Tailwind CSS v4 + shadcn/ui | Dark-first design |
| Database | Supabase (Postgres) | Free tier, US West |
| ORM | Prisma v6 | Intentionally pinned — see note below |
| AI Model | Claude claude-sonnet-4-6 | Streaming + memory extraction |
| Validation | Zod v3 | safeParse throughout |
| Toasts | Sonner | |
| Deployment | Vercel | |

---

## Quick Start — Generated Data Path (No Strava Required)

### 1. Clone and install

```bash
git clone https://github.com/contactvishwav/pacer.git
cd pacer
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in these values in `.env`:

- `ANTHROPIC_API_KEY` — from console.anthropic.com or provided by Luma
- `DATABASE_URL` — Supabase transaction pooler (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — Supabase direct connection (port 5432)

All other keys in `.env.example` (OpenAI, ElevenLabs, Google Cloud, AWS) are not used by Pacer.

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

The seed creates one demo athlete — **Alex Chen**, targeting the SF Half Marathon (2026-08-02) with a 1:55:00 goal — and populates a deterministic 12-week training block: 54 activities, weekly summaries, workout classifications, HR zone data, and one seeded coaching memory. The seed is idempotent — safe to run multiple times.

> You may see a deprecation warning about `package.json#prisma.seed`. This is expected — Prisma is pinned to v6, and the warning is a forward-notice from late v6 builds about v7's config format change. It does not affect seed behavior.

### 4. (Optional) Export TCX activity files

```bash
npm run export:tcx
```

Exports all 54 activities as Garmin TCX v2 files to `generated-training-data/tcx/` for optional Strava upload. Not required to evaluate any intelligence dimension.

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Prisma v6 Note

Pacer intentionally pins Prisma to v6 (`prisma@6`, `@prisma/client@6`). Prisma v7 changes datasource configuration, requires driver adapters, changes the generated client import path, and removes `package.json#prisma.seed` in favor of `prisma.config.ts` — four simultaneous breaking changes not worth absorbing in a time-boxed build when v6 provides a stable, well-tested Supabase + Vercel path.

Later Prisma v6 versions may print a deprecation warning about `prisma.config.ts` — this is expected and safe. Do not upgrade Prisma to v7.

---

## The Demo Flow

Walk through these pages in order to see all six intelligence dimensions:

1. **Dashboard** (`/dashboard`) — all six dimensions at a glance: training phase, ACWR risk signal, race prediction, weekly focus, and suggested coach questions
2. **Activities** (`/activities`) — paginated list; find the **March 8** entry with the red **Too Hard** badge (page 2) — that is the zone-mismatch run seeded with HR 157 against a Zone 2 ceiling of 145
3. **Activity Detail** — click March 8 to see the Zone 2 warning callout, coaching intelligence panel, and the Ask Coach CTA that prefills the question in coach chat
4. **Coach** (`/coach`) — ask *"How is my training going?"* and watch the streaming response with full training context; if no API key is configured, a deterministic fallback response streams instead
5. **Race Goal** (`/race-goal`) — Riegel-based half-marathon projection with the confidence interval bar, TSB adjustment note, and gap-to-goal analysis
6. **Weekly Brief** (`/weekly-brief`) — the five-section deterministic Monday coaching brief, generated without a Claude call; the Ask Coach button prefills the key signal as a question

---

## Key Demo Data Points

| Signal | Value |
|---|---|
| ACWR spike | Week 8 ACWR = 1.337 (caution category) |
| Zone-mismatch run | March 8 easy run, HR 157 vs Zone 2 ceiling of 145 → `TOO_HARD` |
| Race prediction | ~1:53 projected vs 1:55 goal (1:41 ahead of pace) |
| Training arc | BASE→BUILD→PEAK→RECOVERY→BUILD→TAPER over 12 weeks |
| Coach memory | Persistent across sessions via Claude-powered extraction |

---

## Validation Suite

Run these after seeding (`npx prisma db seed`). All 9 scripts must pass.

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

> `validate:tcx` requires TCX files to be present. Run `npm run export:tcx` first if `generated-training-data/tcx/` is empty.

---

## Smoke Tests

See [docs/SMOKE_TESTS.md](docs/SMOKE_TESTS.md) for curl commands for every API route.

---

## Deploying to Vercel

1. `vercel --prod`
2. Set env vars in the Vercel dashboard (same as `.env`): `ANTHROPIC_API_KEY`, `DATABASE_URL`, `DIRECT_URL`
3. `npx prisma migrate deploy` (against production DB)
4. `npx prisma db seed` (against production DB)
5. Update `NEXT_PUBLIC_APP_URL` in Vercel env to your Vercel deployment URL

---

## Architecture Notes

- All business logic lives in `src/lib/intelligence` — route handlers are thin wrappers that authenticate, extract parameters, call one function, and return the result
- `buildAthleteIntelligenceContext()` is the single integration point for all six intelligence engines — training load (ATL/CTL/TSB), ACWR, race prediction, periodization phase, weekly brief, and workout classifications computed once per request
- `buildCoachContext()` assembles a compact <2,000-token context for Claude — pre-computed signals, bounded 8-turn conversation history, and a memory summary for older context; raw GPS streams are never sent to the model
- Prisma v6 is intentionally pinned (see above)
- Coach streaming uses `export const runtime = 'nodejs'` and `export const maxDuration = 60` on Vercel
- Deterministic fallback fires when `ANTHROPIC_API_KEY` is absent (`!apiKey || apiKey.trim() === ''`) or when Claude returns a 401 (`Anthropic.AuthenticationError` detected via `instanceof` in the catch block); both paths prepend `__FALLBACK__\n` so the frontend can mark the message accordingly

---

## See Also

- [APPROACH.md](APPROACH.md) — full product and technical reasoning: why Strava's architecture is insufficient, sports-science basis for each dimension, Prisma v6 decision, and what breaks first under production pressure
- [docs/FEATURE_AUDIT.md](docs/FEATURE_AUDIT.md) — end-to-end verification of all six dimensions against the seeded dataset
- [docs/SMOKE_TESTS.md](docs/SMOKE_TESTS.md) — curl commands for every API endpoint
- [AI_USAGE.md](AI_USAGE.md) — transparent account of how AI tools were used during the build
