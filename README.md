# Pacer
> AI-powered training coaching, rebuilt from Strava's Athlete Intelligence

Pacer turns a runner's activity history into a persistent coaching relationship — surfacing training phase, injury-risk signals, race trajectory, weekly coaching briefs, and workout execution feedback that Strava's current product does not provide. It solves the problem that Strava Athlete Intelligence is a describer (it tells you what happened after a run) but not a coach (it does not tell you what to do next or whether you are on track for your race goal). The demo runs entirely from a deterministic 12-week generated training dataset seeded into the database — no Strava account, no external activity history, and no real running data are required to evaluate any of the six intelligence dimensions.

---

## What Was Built

| Dimension | What it does | Status |
|---|---|---|
| Periodization-Aware Phase Detection | Classifies the current training week as BASE, BUILD, PEAK, TAPER, or RECOVERY using calendar position, load trajectory, and injury-risk signals | ✅ Shipped |
| Conversational Coaching with Persistent Memory | Streaming Claude-powered coach chat with full intelligence context, bounded conversation history, durable memory extraction, and deterministic fallback when API key is absent | ✅ Shipped |
| ACWR Injury-Risk Forecasting | Gabbett acute:chronic workload ratio with caution/high-risk thresholds, contributing factors, and recommended action — no medical claims | ✅ Shipped |
| Race Prediction with Confidence Intervals | Riegel formula (`T2 = T1 × (D2/D1)^1.06`) applied to best qualifying effort, with TSB fatigue/freshness adjustment, confidence band, and gap-to-goal analysis | ✅ Shipped |
| Weekly Coaching Brief | Five-section deterministic brief (last week review, prescription, key signal, warnings, focus) generated entirely from computed signals — no Claude call required | ✅ Shipped |
| Workout Type Classification | Rule-based classifier (EASY → RACE) with execution evaluation (`TOO_HARD`, `WELL_EXECUTED`, `MATCHED_INTENT`) and follow-up question routing to coach | ✅ Shipped |

---

## Tech Stack

| Layer | Technology | Note |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components + streaming API routes |
| Language | TypeScript (strict) | No `any`, no `@ts-ignore` |
| Styling | Tailwind CSS v4 + shadcn/ui | Dark-first premium fitness aesthetic |
| Database | Supabase Postgres | Pooled connection (runtime) + direct connection (migrations) |
| ORM | Prisma v6 | Pinned — v7 introduces four simultaneous breaking changes incompatible with this setup |
| AI Model | Anthropic Claude (`claude-sonnet-4-6`) | Overridable via `ANTHROPIC_MODEL` env var |
| Deployment | Vercel | Edge-compatible pages + Node.js runtime for Claude streaming |

---

## Quick Start (Default: Generated Data Path)

**Prerequisites:** Node.js 18+, a Supabase project (free tier works), an Anthropic API key.

### 1. Clone the repo

```bash
git clone https://github.com/contactvishwav/pacer.git
cd pacer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env`. The file already contains `ANTHROPIC_API_KEY` as a placeholder — replace the value. Add `DATABASE_URL` and `DIRECT_URL` (these are not in `.env.example`):

```env
# Replace the placeholder value (already in .env.example)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Add these two lines — get them from Supabase → Settings → Database → Connection string
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:password@aws-0-us-west-2.pooler.supabase.com:5432/postgres

# Optional — only needed if testing Strava OAuth (not required for any intelligence dimension)
# STRAVA_CLIENT_ID=your_strava_client_id
# STRAVA_CLIENT_SECRET=your_strava_client_secret
```

> **`DATABASE_URL`** is the **transaction pooler** (port 6543), used at runtime.
> **`DIRECT_URL`** is the **direct connection** (port 5432), used by Prisma CLI for migrations.
> Both are available in your Supabase project under **Settings → Database → Connection string**.

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

> Use `migrate deploy` (not `migrate dev`) for reviewer and production setup. `migrate dev` is for interactive development only and will prompt for confirmation.

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Seed the database with generated training data

```bash
npx prisma db seed
```

This creates one demo athlete — **Alex Chen**, targeting the SF Half Marathon (2026-08-02) with a 1:55:00 goal — and populates a deterministic 12-week training block: 54 activities, weekly training summaries, workout classifications, HR zone data, and one seeded coaching memory. The seed is idempotent; running it multiple times is safe.

> You may see a deprecation warning about `package.json#prisma.seed`. This is expected — Prisma is pinned to v6, and the warning is a forward-notice from late v6 builds about v7's config format change. It does not affect seed behavior.

### 7. (Optional) Export TCX files

```bash
npm run export:tcx
```

Exports all 54 activities as Garmin TCX v2 files to `generated-training-data/tcx/`. These can be uploaded to Strava manually if you want to see the generated data in a real Strava account. Not required to evaluate any intelligence dimension.

### 8. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## The Demo Flow

Walk through these pages in order to see all six intelligence dimensions:

1. **Dashboard** (`/dashboard`) — Training phase card, ACWR injury-risk signal card, race prediction card, weekly focus card, and five suggested coach questions. Answers all five coaching questions a runner needs every week.
2. **Activities** (`/activities`) — Find the week 4 run with the amber **TOO HARD** badge. That is the zone-mismatch run seeded with HR 157 against a Zone 2 ceiling of 145.
3. **Activity Detail** — Click that activity to see the classification card, execution evaluation, zone warning callout, and the Ask Coach CTA that prefills the question in coach chat.
4. **Coach** (`/coach`) — Ask *"How is my training going?"* and watch the streaming response with full training context. If no API key is configured, a deterministic fallback response streams instead.
5. **Race Goal** (`/race-goal`) — Riegel-based half-marathon projection with the confidence interval bar, TSB adjustment note, gap-to-goal analysis, and the `whatNeedsToHappen` coach prompt.
6. **Weekly Brief** (`/weekly-brief`) — The five-section deterministic coaching brief. Generated without a Claude call; the Ask Coach button prefills the key signal as a question.

---

## Key Demo Data Points

| Signal | Value | Where to find it |
|---|---|---|
| Week 8 ACWR | 1.337 → caution category | Dashboard → Training-Load Risk Signal card |
| Week 4 zone-mismatch run | HR 157 vs Zone 2 ceiling 145 → `TOO_HARD` | Activities list → week 4 easy run |
| Race prediction | ~1:53:19 projected vs 1:55:00 goal | Race Goal page |
| Gap to goal | ~1:41 ahead of goal pace | Race Goal page → gap analysis |
| Confidence score | 80 / 100 | Race Goal page → confidence score bar |
| Training phase | Depends on current date — race is 2026-08-02 | Dashboard → Phase card |

---

## Running the Validation Suite

Run these after seeding the database (`npx prisma db seed`). All 9 scripts must pass.

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

> `validate:tcx` requires TCX files to be present. Run `npm run export:tcx` first if `generated-training-data/tcx/` is empty or missing.

---

## Deploying to Vercel

**1. Deploy**

```bash
vercel --prod
```

**2. Set environment variables** in the Vercel dashboard under **Settings → Environment Variables**. Add the same values as your local `.env`: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `DIRECT_URL`.

**3. Run migrations against the production database**

```bash
npx prisma migrate deploy
```

Run this with your production `DATABASE_URL` and `DIRECT_URL` set in your shell (or use the Vercel CLI env pull).

**4. Seed the production database**

```bash
npx prisma db seed
```

The seed is idempotent — safe to re-run if needed.

---

## Architecture Notes

**Thin route handlers.** Every API route in `src/app/api` is a pass-through: authenticate, extract parameters, call one function from `src/lib`, return the result. All business logic — ACWR, Riegel race prediction, Banister PMC, periodization detection, weekly brief generation, workout classification — lives in `src/lib/intelligence`. Route files contain no database queries, no computation, and no conditional logic beyond null guards.

**Unified intelligence context.** `buildAthleteIntelligenceContext(athleteId)` is the single integration point that powers every page. It computes training load (ATL, CTL, TSB via Banister PMC with τ=7/42), injury risk (Gabbett ACWR), race prediction (Riegel + TSB adjustments), periodization phase, weekly brief, and recent workout classifications in one call. `buildCoachContext(athleteId, activityId?)` extends this with bounded conversation history (last 8 turns) and a memory summary for older context. Every page fetches from its API route; no page imports from `src/lib` directly or recomputes signals.

**Prisma v6 pinned intentionally.** Prisma v7 changes datasource configuration, requires driver adapters, changes generated client import paths, and moves seed config from `package.json` to `prisma.config.ts` — four simultaneous breaking changes not worth absorbing in a time-boxed build when v6 provides a stable, well-tested Supabase + Vercel path.

**Deterministic fallback when `ANTHROPIC_API_KEY` is missing.** The coach chat route checks for the API key before attempting a Claude call. If absent, it streams a response from `buildDeterministicCoachingResponse()` — a rule-based coaching reply derived from the pre-computed intelligence context, with no AI call. The frontend detects the `__FALLBACK__\n` sentinel and marks the message accordingly. Every other intelligence dimension (dashboard, activities, brief, race goal) is fully deterministic and requires no API key at all.

---

## Approach

See [APPROACH.md](APPROACH.md) for the full product and technical reasoning: why Strava's architecture is insufficient, the sports-science basis for each intelligence dimension, the generated dataset design, the Prisma v6 decision, and an honest assessment of what breaks first under production pressure.
