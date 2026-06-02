# Pacer — Interview Guide

This is the most important question of the entire interview prep. Let me give you the complete answer — not just what to say, but how to frame your thinking, what order to present it in, and how to handle every direction the interviewer might take it.

---

## The Core Mental Model Before You Say Anything

The interviewer is not asking "did you build a thing." They are asking three deeper questions simultaneously:

**1. Do you understand what you built deeply enough to defend every decision?**
**2. Do you know where it breaks and why you accepted those tradeoffs?**
**3. Can you extend it when requirements change without rewriting it?**

Every answer you give should implicitly demonstrate all three. The way to do this is to never just describe — always describe, justify, and acknowledge the tradeoff.

---

## How to Open the Conversation

Do not wait for them to ask a specific question. Open proactively with the framing statement. This sets the narrative before any question is asked and shows you have a thesis, not just an implementation.

**Say this:**

"Before we dive into specifics, let me give you the one-sentence thesis of what Pacer actually is, because it changes how every other decision reads.

Pacer is not a Claude wrapper. It's a computed coaching intelligence layer that uses Claude as a language interface. Every number Claude speaks — CTL, ACWR, race prediction, training phase — is pre-computed by deterministic TypeScript engines before Claude sees any data. Claude receives a bounded pre-computed context under 2,000 tokens and explains it conversationally.

That architectural choice drives everything else. Want me to walk through the system from that foundation?"

---

## Walking Through the Design

If they say "yes walk me through it," use this structure. Do not recite every detail — hit the decision points and tradeoffs. The interviewer will probe wherever they find interesting.

---

### Opening Layer — The Intelligence Stack

"The system has six deterministic intelligence engines that run before Claude is involved at all.

Training load uses the Banister PMC model — exponential moving averages with 7-day ATL and 42-day CTL constants — to compute fitness, fatigue, and form. Injury risk uses Gabbett's ACWR formula — current week's training load divided by the mean of the prior four weeks — with validated thresholds at 1.3 for caution and 1.5 for high risk. I chose Gabbett specifically over the PMC ratio because Gabbett's formula was validated against actual injury outcomes in the 2016 BJSM paper, and the thresholds come directly from that research. Using the PMC ratio would mean claiming Gabbett's validated thresholds without using Gabbett's formula — that's not defensible.

The workout classifier is a rule chain — RECOVERY, INTERVAL, TEMPO, LONG_RUN, EASY in priority order. First match wins. Rule-based because the feature space is low-dimensional and domain knowledge maps directly to physiological definitions. A 3-lap minimum for INTERVAL came from a real bug — two-lap tempo sessions were triggering the HR stddev threshold incorrectly. That fix took accuracy from 83.3% to 85.2%.

Phase detection is another rule chain with physiological priority override — RECOVERY fires when TSB drops below -15 or weekly load drops below 60% of the three-week average, regardless of where the calendar says the athlete should be in training.

Race prediction uses Riegel's formula with the 1.06 exponent, with TSB adjustments of plus or minus two percent for fatigue and freshness states.

The weekly brief is a pure deterministic function — no Claude, no database, no API calls. It's the only output that works completely without an API key, which was intentional."

**Pause here.** Let them ask. Do not volunteer everything at once.

---

### If They Ask Why Deterministic Engines Instead of Asking Claude

"Three reasons: accuracy, cost, and auditability.

Accuracy — LLMs do not reliably perform iterative arithmetic over large datasets. CTL is a day-by-day exponential moving average over 84 days of training data. If I sent raw activities to Claude and asked it to compute CTL, it would produce a plausible-sounding number that's wrong. That's worse than a correct number being explained imperfectly.

Cost — 54 activities worth of GPS streams would be hundreds of thousands of tokens per request. The pre-computed context is 1,500 to 2,000 tokens. The cost difference is roughly 200x per request.

Auditability — every number Claude references traces to a specific computation which traces to specific database rows. When an athlete disputes coaching advice — and they will — you can show them exactly where the ACWR of 1.337 came from."

---

### If They Ask About the Coaching Pipeline

"When an athlete sends a message, five sequential guards run before the stream opens: auth, conversation validation, per-conversation message count, body validation with Zod, and context building.

The context building is where the intelligence layer meets the coaching layer. `buildCoachContext` reads the pre-computed intelligence from a three-layer cache — in-memory Map at ten seconds, Redis at sixty seconds, Supabase as source of truth — then runs two parallel queries for conversation history and coach memories, assembles everything into a bounded object, checks the token budget, and compresses if needed.

The user message is persisted before the stream opens. That's write-ahead — if the stream fails, the user's message exists in the database with status PENDING. Without this, a stream failure leaves no record of what the athlete asked, which breaks conversation continuity and future context building.

The stream wraps the Anthropic SDK's async iterator in a Web Streams ReadableStream. Every text delta chunk goes immediately to the browser and simultaneously accumulates in `fullResponse`. After the stream completes, safety classification runs, both messages are persisted with status COMPLETE, and memory extraction fires fire-and-forget.

The fire-and-forget decision is deliberate. Memory extraction adds 800 to 2,000 milliseconds. The athlete already has their response. Making them wait for background extraction would make every coaching turn ten to fifteen percent slower for no visible benefit on that turn."

---

### If They Ask About the Memory System

"The current implementation has a hard cap of five memories per athlete total. That's an architectural flaw I'd fix in production, not a deliberate design choice.

The production memory system has three components.

First — semantic retrieval replaces recency-based loading. Right now the system loads the three most recently created memories regardless of what the athlete is asking about. If the athlete mentioned knee pain six months ago and asks about it today, that memory isn't loaded. The fix is embeddings — generate a vector for the user's message, run cosine similarity against all stored memory embeddings via pgvector, and load the most relevant ones using a ranking function that weights semantic similarity at fifty percent, importance at thirty percent, a flat critical override of plus 0.5 for medical history regardless of similarity, recency at ten percent, and access frequency at twenty percent. The total scores range from 0.0 to 1.60.

Second — the tier system manages memory volume over time. Tier one is active memories from the last ninety days — the semantic search candidates. Tier two is archived older memories that have been incorporated into the consolidated profile. The consolidated profile is one record per athlete, a 250-word synthesis of all older memories, always loaded verbatim. The tier system means semantic search runs against a bounded set of recent memories, not against two years of accumulated records.

Third — importance scoring at extraction time determines what survives long-term. Medical history rates 0.9 to 1.0 — it is never evicted. Minor preferences rate 0.2 to 0.3 — they're pruned first. The five-memory hard cap is replaced by quality-based redundancy detection using cosine similarity at 0.92 threshold."

---

### If They Ask About the Caching Architecture

"Three layers.

The in-memory Map at the module level with a ten-second TTL. Zero milliseconds latency, but instance-local — in Vercel's serverless model, each function instance has its own Map. Under concurrent load, multiple instances each recompute the same athlete's context independently. The Map's value is preventing redundant Redis calls within short bursts on the same warm instance.

Redis with a sixty-second TTL. One to five milliseconds latency, shared across all instances. This is the production fix for the multi-instance problem. Instance A computes Alex's context and writes to Redis. Instance B's next request reads from Redis — no recomputation. I didn't implement Redis in the demo because the demo has one athlete and low traffic. The cache interface is abstracted behind `getCachedContext` and `setCachedContext` — swapping in Redis is approximately twenty lines in context-cache.ts.

Supabase as the source of truth. Always correct, never expires. Six DB queries and six engine computations. Two hundred to four hundred milliseconds on a warm instance, four to eight seconds on a cold start.

Cache invalidation in production is event-driven, not TTL-only. When a new activity is imported — `redis.del('context:athleteId')`. When a memory is updated — same. The TTL is a safety net, not the primary invalidation mechanism."

---

### If They Ask About Edge Cases

This is where the session gets interesting. Here are the most likely ones and exactly how to answer each.

**"What happens when the Anthropic API is unavailable?"**

"Two separate paths depending on why.

Missing API key — caught before any API call. The system builds the deterministic coaching response from the pre-computed context: phase, injury risk if elevated, race trajectory, this week's prescription. It streams this word-by-word at twenty milliseconds per word. The `__FALLBACK__` sentinel prepended to the stream tells the frontend to render a 'Computed analysis' badge instead of 'Powered by Claude.' Zero API calls wasted.

401 authentication error — caught in the stream catch block using `instanceof Anthropic.AuthenticationError`, not string matching. Same deterministic fallback path. Only 401 gets the sentinel — a 429 or 500 is transient and should be communicated differently. The sentinel means 'this system deliberately ran in deterministic mode,' not 'the API failed.' Those are semantically different states and the frontend needs to distinguish them.

In production, 429 and 529 get exponential backoff — one second, two seconds, four seconds, then fallback on the third failure."

**"What if the safety classifier flags a response that's already been streamed?"**

"That's the fundamental limitation of post-stream classification — the athlete has already read the content by the time the flag fires. The disclaimer gets appended but the harm is done.

The production fix is chunk-based streaming interception. Buffer Claude's output to sentence boundaries — roughly two hundred characters — run Layer 1 pattern detection on each chunk, and only forward safe chunks to the browser. When chunk two fails, the browser has seen chunk one — safe content — then immediately sees the safety disclaimer. The flagged content never renders.

The 200-character buffer is calibrated to have enough context for accurate classification while keeping the amount of content that could reach users before a flag minimal. Too small and you're evaluating incomplete sentences. Too large and you're back to post-stream behavior."

**"What happens if memory extraction fails silently for every session?"**

"In the current implementation, nothing detects it. The user experiences a coach that asks the same questions session after session because no memories are ever written. There's no monitoring, no alerting, no way to know this is happening without inspecting the CoachMemory table directly.

In production, every extraction outcome — success, malformed response, pre-filter rejection, API failure — gets a structured log event. The alert threshold is if extraction failures exceed ten percent of extraction attempts over any one-hour window. Sustained failure means the extraction prompt or Claude Haiku behavior has changed and needs investigation."

**"What happens when a conversation exhausts at fifty messages?"**

"In the current implementation, the coaching context built over those fifty messages is partially lost. At most five extracted memory facts survive. The conversational thread — what was prescribed, what the athlete committed to, what was diagnosed — is gone.

The production fix fires at message forty-five, not fifty. At fifty the route returns 429 and nothing else can happen. At forty-five the conversation still has room. A fire-and-forget call generates two records: a detailed two-hundred-word ConversationSummary with an embedding for semantic retrieval, and a brief four-sentence CoachMemory CONVERSATION_SUMMARY that's always loaded into the next session for immediate continuity. The athlete starts a new conversation and the coach immediately says 'last time we covered your tempo plateau and added a midweek threshold session.' The fifty-message limit becomes an administrative boundary, not a knowledge cliff."

---

### If They Ask How the System Evolves

This is the product-focused evolution question. The answer demonstrates architectural foresight.

**"How would you add real athletes with Strava data?"**

"The schema is already designed for it. `StravaConnection` model is scaffolded. Every Activity record has a `stravaActivityId` field for deduplication. The intelligence engines take `athleteId` as a parameter and read from Prisma tables — they don't care how the data arrived.

What's needed is the ingestion pipeline: Strava OAuth flow, token storage with AES-256-GCM encryption — right now the tokens are plaintext which is a production blocker — webhook handler for new activities, activity ingestion that computes TRIMP from the HR stream, and cache invalidation after ingestion. Then replace `findFirst()` with `findUnique({ where: { id: session.athleteId } })` in all seven route handlers. The intelligence layer doesn't change at all."

**"How would you support multiple athletes and coaches?"**

"The schema is multi-tenant-ready because every model is scoped by `athleteId`. All DB queries already have `WHERE athleteId = X` in their filters. Multi-tenancy at the query level requires no schema changes.

The auth layer needs work — replace the `findFirst()` stub with Iron Session, add role-based access control for the coach-athlete relationship model. A coach accessing athlete data would need a `CoachAthleteRelationship` model with permissions. But the intelligence engines, caching, memory system, and coaching pipeline are all already athlete-scoped and work unchanged."

**"How would you add personalized training plans?"**

"This is the honest answer: carefully and with liability awareness. Prescribing specific workouts to athletes whose physiology you cannot fully know creates liability exposure that the current advisory framing avoids. 'Easy runs only this week' is advisory. 'Run 12km Tuesday at 5:30/km' is prescriptive and carries liability if the athlete gets injured following it.

The architecture can support it — a `TrainingPlan` model and `PlannedWorkout` model, plan generation via Claude from the deterministic intelligence context, plan vs actual comparison using the execution evaluation system. But the product decision about liability framing is as important as the technical implementation."

**"How would you scale to ten thousand athletes?"**

"The intelligence layer scales horizontally without changes — each athlete's computation is independent. The bottleneck is database query load and Redis capacity.

At ten thousand daily active athletes each loading the dashboard once — ten thousand requests hitting Supabase if no caching. With Redis caching at sixty seconds, most requests hit Redis instead of Supabase. The Redis key space is manageable — ten thousand keys at approximately one hundred kilobytes each is one gigabyte of Redis memory, well within Upstash's capacity.

The coaching pipeline has a harder scaling challenge — each coaching turn requires an Anthropic API call. At fifty messages per day per pro user, ten thousand users is five hundred thousand API calls per day. Rate limiting at the per-user level using the `AthleteQuota` model and Redis INCR prevents any single user from consuming disproportionate capacity. The subscription tier system creates economic incentives that naturally limit usage to sustainable levels."

---

## How to Handle Questions You're Uncertain About

The interviewer will ask something that goes beyond what you've prepared. The correct response is never to fabricate confidence.

**Say this structure:**

"I didn't build that specific piece, but here's how I'd reason through it from first principles — [give your reasoning]. The tradeoff I'd be thinking about is [tradeoff]. I'd want to validate [assumption] before committing to that approach."

This demonstrates exactly what they're actually evaluating — decision-making process and tradeoff reasoning — not encyclopedic recall.

---

## The Three Things You Must Convey No Matter What

No matter how the conversation goes, make sure these three come through:

**1. You built a system with a coherent architecture thesis, not a collection of features.**

"Pacer is a computed intelligence layer. Claude explains the signals — it doesn't produce them."

**2. You know exactly where the current implementation falls short and why you accepted each gap.**

"The five-memory hard cap is an architectural flaw I'd fix. The in-memory cache is instance-local and provides no benefit under concurrent load. The safety classifier runs post-stream — the production fix is chunk-based interception."

**3. The architecture was designed for extensibility, not the demo.**

"Every model is athleteId-scoped. The intelligence engines take athleteId as a parameter. Adding Strava, adding auth, adding more athletes — none of these require touching the intelligence layer. The plumbing changes, the intelligence doesn't."

---

## One Final Framing Point

If the interview ever feels like it's going sideways — a question you can't fully answer, a tradeoff you didn't anticipate — redirect to the decision-making framing:

"The most important decision in the whole system was the choice to compute all coaching signals deterministically before Claude sees any data. Everything else — the caching architecture, the memory system, the safety classifier — those are all in service of making that intelligence layer fast, accurate, and reliable. That choice is why the system is testable without an API key, why every number is auditable, and why the coaching quality doesn't degrade during Anthropic outages."

That statement is always true, always relevant, and always demonstrates architectural thinking.

---

## Quick Reference — If You Go Blank

| They ask about | Lead with |
|---|---|
| What is Pacer? | "Computed intelligence layer. Claude explains — doesn't produce." |
| Why not ask Claude to compute? | "Accuracy, cost, auditability. 200x token difference." |
| Memory system | "Five-memory cap is a flaw. Production fix: semantic retrieval, tiers, importance scoring." |
| Caching | "Three layers. Map 10s, Redis 60s, Supabase source of truth. Invalidation is event-driven." |
| API unavailable | "Two paths. Missing key → deterministic fallback. 401 → same. 429/500 → exponential backoff." |
| Safety classifier | "Post-stream is the gap. Production fix: chunk interception at 200-char sentence boundaries." |
| Conversation exhaustion | "45-message summary fires before 50-message hard limit. ConversationSummary + CoachMemory bridge." |
| Strava integration | "Schema scaffolded. Intelligence layer unchanged. Plumbing work only." |
| Multi-tenant | "Already athleteId-scoped. Auth layer is the only addition." |
| Scale to 10k users | "Intelligence scales horizontally. Redis absorbs dashboard load. Quota system controls API spend." |
