# Pacer — Production Architecture Reference

## How to Use This Document

This document is interview preparation material for the Take-Home Case Review. It is written for the person who built Pacer and needs to discuss the system with a senior engineering interviewer for 45 minutes without notes. Every section follows the same structure: what the current implementation does, what the production version looks like, why the change is made, and what tradeoffs remain. Do not skim — read each section until you can explain it to someone who has not seen the code, using exact numbers, concrete examples, and the reasoning behind each decision. The goal is not just to know what the production version does, but to know *why it does it that way* and what you would give up by doing it differently.

---

## Part 1: Memory System

### 1.1 Why the Current Memory System Is Insufficient for Production

The current `CoachMemory` implementation in `prisma/schema.prisma` and `src/app/api/coach/conversations/[id]/messages/route.ts` has four specific structural flaws that prevent it from working at production scale. These are not edge cases or minor gaps — they are fundamental design deficiencies that will silently corrupt the coaching experience for real athletes.

---

**Problem 1 — Hard cap of 5 memories per conversation, preventing extraction from longer sessions**

The extraction guard in `maybeExtractMemory()` reads:

```ts
const existingMemoriesForConversation = await prisma.coachMemory.count({
  where: { conversationId },
})
if (existingMemoriesForConversation >= 5) return
```

This is a per-conversation cap — the extraction function gives up once 5 memories have been extracted from a single conversation. Walk through the exact sequence with Alex Chen having a long coaching session:

- **Turn 1:** "I prefer morning runs, usually before 7am." → extraction fires (count=0 < 5) → memory created → count becomes 1. Memory: *"Athlete: prefers morning runs before 7am."*
- **Turn 2:** "My left knee has given me trouble during high-mileage weeks." → extraction fires (count=1 < 5) → memory created → count becomes 2. Memory: *"Athlete: history of left knee pain during high-mileage weeks."*
- **Turn 3:** "I'm vegetarian so recovery nutrition is something I have to plan carefully." → extraction fires (count=2 < 5) → memory created → count becomes 3. Memory: *"Athlete: vegetarian, needs to plan recovery nutrition carefully."*
- **Turn 4:** "I work from home on Tuesdays and Fridays so those are my long-run days." → extraction fires (count=3 < 5) → memory created → count becomes 4. Memory: *"Athlete: long run days are Tuesdays and Fridays (works from home)."*
- **Turn 5:** "I've done two marathons before, both in 4:02." → extraction fires (count=4 < 5) → memory created → count becomes 5. Memory: *"Athlete: completed two marathons, both approximately 4:02."*
- **Turn 6:** "I was diagnosed with low ferritin last year and it derailed my last training block." → extraction fires → count check: count = 5 → `>= 5` → **returns immediately** → memory silently lost.

The information about low ferritin history — one of the highest-consequence coaching facts possible — is permanently lost. The coach will give generic advice about fatigue and energy in future sessions, never knowing that low iron was a documented cause of a previous derailed training block. There is no log message, no warning to the user, no indication that extraction was skipped. The athlete has no reason to repeat this information because it has already been stated.

This is a design flaw, not a design choice. The 5-memory limit was set to control costs (each extraction is a Claude API call) but was applied too narrowly — a per-conversation cap means the most information-dense sessions (long conversations with an engaged athlete) are the ones where extraction silently stops working.

The separate `enforceMemoryRetentionPolicy(athleteId)` function (called fire-and-forget after each extraction) handles a per-athlete retention limit of 25 memories with oldest-first eviction. But it never gets the chance to manage the low-ferritin memory because extraction never fires on turn 6.

---

**Problem 2 — Recency-based memory loading instead of relevance-based loading**

The loading query in `buildCoachContext()` inside `src/lib/intelligence/context.ts` reads:

```ts
const [rawMessages, memories] = await Promise.all([
  prisma.coachMessage.findMany({ ... }),
  prisma.coachMemory.findMany({
    where:   { athleteId },
    orderBy: { createdAt: 'desc' },
    take:    3,
  }),
])
```

This loads the **3 most recently created** memories, regardless of whether those memories are relevant to the current conversation. Walk through the concrete failure case:

- **January 10** (6 months ago): Alex mentions knee pain → Memory 2 created: *"Athlete: history of left knee pain that worsens during peak mileage weeks."*
- **February 1**: Alex mentions preferred racing shoes → Memory 3 created.
- **March 15**: Alex mentions morning run preference → Memory 4 created.
- **April 5**: Alex mentions wanting a sub-1:50 half → Memory 5 created.
- **May 10**: Alex mentions fueling strategy → Memory 6 created.
- **May 20**: Alex mentions race-day warmup routine → Memory 7 created.
- **May 26** (today): Alex asks "My knee is hurting on long runs — is this related to my increased mileage?"

The loading query returns **Memory 5, 6, 7** (the three most recently created). Memory 2 — the only record containing the athlete's documented knee pain history — is never loaded. Claude's context includes no knowledge of prior knee issues. The response will be generic: "knee pain during increased mileage is common — try reducing your long run distance." It cannot say: "This is consistent with the pattern you mentioned in January — your knee has historically been vulnerable during high-mileage weeks. Let's revisit what worked last time."

The athlete asked a specific question about a specific body part with documented history in the system. The system failed to retrieve that history because it orders by creation timestamp instead of relevance to the query.

---

**Problem 3 — No redundancy detection, causing duplicate memory accumulation**

The current system has no mechanism to detect when the same fact is being stored multiple times. Walk through the exact accumulation scenario:

- **Session 1 (Jan 10):** Alex mentions "I always prefer to run in the morning." → Claude extracts and stores: *"Athlete: prefers morning runs."* Memory count: 1.
- **Session 2 (Feb 3):** Alex again mentions "I'm a morning person — I run before work." → Claude extracts and stores: *"Athlete: prefers running in the morning before work."* Memory count: 2.
- **Session 3 (Mar 22):** Alex again mentions "Morning is definitely my time — I can't run evenings." → Claude extracts and stores: *"Athlete: runs in the morning, cannot run in evenings."* Memory count: 3.

Three functionally identical memories now occupy three of the 5 extraction slots per conversation and three of the 25 retention slots per athlete. The semantic content is the same: Alex runs in the morning. The exact phrasing differs enough that a simple string comparison would not catch it, but the meaning is identical.

Two compounding harms result. First, the 5-slot cap is reached faster — if Alex mentions morning preference in 3 of the first 5 turns, extraction capacity is exhausted before the higher-value facts (knee history, nutrition constraints, race history) are captured. Second, when the coach context loads 3 memories, all three slots may be consumed by three variations of "prefers morning runs," leaving no room for higher-consequence facts. The context quality degrades rather than improves as the athlete uses the product more.

A production system needs semantic redundancy detection: before storing a new memory, check whether any existing memory expresses the same meaning (measured by embedding cosine similarity above a threshold). If similarity exceeds 0.92, do not create a new record — optionally update the existing one with the most recent phrasing.

---

**Problem 4 — No importance differentiation: all memories are equal**

The current `CoachMemory` schema has no importance field:

```prisma
model CoachMemory {
  id             String   @id @default(cuid())
  athleteId      String
  conversationId String?
  summary        String   @db.Text
  turnRangeStart Int
  turnRangeEnd   Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

Every memory is stored identically and loaded identically. The memory "Athlete: prefers morning runs" and the memory "Athlete: was diagnosed with low ferritin, which caused a hospitalization and derailed the last training block" are stored and retrieved with exactly the same priority. When the coach context loads 3 memories sorted by recency, either of these could be loaded or excluded — and the decision is based entirely on when the fact was captured, not on how much it matters.

This is an architectural flaw because the consequences of forgetting these two facts are radically different. Forgetting morning run preference means the coach asks "what time of day do you run?" — a small friction. Forgetting the ferritin history means the coach prescribes increasing mileage during a period when the athlete has warning signs of the same iron deficiency pattern — a coaching failure that could harm the athlete.

A production importance field (Float, 0.0 to 1.0) enables the ranking function to guarantee that high-importance memories (medical history, hard constraints, documented injury patterns) are always loaded regardless of how recently they were created. The field also enables the tier system (Section 1.4) to protect critical memories from archival.

---

### 1.2 The Production Memory Schema

The production `CoachMemory` schema adds 7 fields to the current 6-field model. Each field is not decorative — it serves a specific purpose in the relevance retrieval pipeline.

```prisma
model CoachMemory {
  id             String   @id @default(cuid())
  athleteId      String
  conversationId String?

  summary        String   @db.Text

  memoryType     MemoryType @default(FACT)
  tier           Int        @default(1)
  importance     Float      @default(0.5)

  embedding      Unsupported("vector(1536)")?

  lastAccessed   DateTime?
  accessCount    Int       @default(0)
  isArchived     Boolean   @default(false)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  athlete        Athlete          @relation(fields: [athleteId], references: [id], onDelete: Cascade)

  @@index([athleteId, memoryType, tier])
  @@index([athleteId, importance])
  @@index([athleteId, lastAccessed])
  @@map("coach_memories")
}

enum MemoryType {
  FACT
  CONSOLIDATED
  CONVERSATION_SUMMARY
}
```

**Field rationale:**

`id`, `athleteId`, `conversationId`: Retained from current schema. `conversationId` remains nullable — `null` means an athlete-level memory that applies across all conversations (for example, a consolidated profile memory or an injury history record that should persist beyond any single session). A non-null `conversationId` means the memory was extracted from a specific conversation and is scoped to it for audit purposes, even though it is loaded globally.

`summary @db.Text`: The `@db.Text` annotation maps to Postgres `TEXT` (unlimited length) rather than `VARCHAR(191)` (Prisma's default String). Memory summaries can range from a single sentence to several paragraphs for CONSOLIDATED type memories. `@db.Text` prevents silent truncation that would corrupt summarized profiles.

`memoryType MemoryType`: Three types with distinct creation paths:
- **FACT**: A single extracted coaching fact from a conversation turn. Created by `maybeExtractMemory()`. Represents discrete athlete information: preferences, constraints, injury history, goals. The primary semantic search candidate.
- **CONSOLIDATED**: A synthesized profile memory created by the consolidation job when a Tier 1 FACT record count exceeds the tier threshold. A CONSOLIDATED memory is always loaded verbatim — it represents the accumulated coaching knowledge about an athlete, organized by topic. One CONSOLIDATED record replaces many FACTs.
- **CONVERSATION_SUMMARY**: A 3-4 sentence bridge summary created when a conversation approaches the 50-message limit. Always loaded into context without semantic search. Bridges the gap between the bounded 8-turn conversation history and what happened earlier in that session.

`tier Int @default(1)`: The lifecycle tier. Tier 1 = active memories, 0-90 days since creation, semantic search candidates. Tier 2 = archived memories, >90 days old, incorporated into a CONSOLIDATED record, kept for audit but never searched. The tier system solves the problem semantic search alone cannot: preventing the search space from growing unboundedly as the athlete accumulates years of coaching history.

`importance Float @default(0.5)`: A 0.0-1.0 score representing how consequential this fact is for coaching decisions. The full scale is documented in Section 1.3. The importance score does two things: it contributes to the ranking function (Section 1.6) so high-importance memories score higher than low-importance ones even when semantic similarity is moderate, and it enables a critical override — any memory with `importance >= 0.9` bypasses the relevance threshold filter entirely and is always loaded.

`embedding Unsupported("vector(1536)")?`: A 1536-dimensional float vector produced by OpenAI's `text-embedding-ada-002` model. The `Unsupported()` wrapper tells Prisma to pass through the type string unchanged to Postgres — Prisma cannot generate migrations for custom types but it does not corrupt them either. The vector is nullable because embeddings are generated asynchronously after memory creation; there is a brief window where a new memory exists but has no embedding yet (the semantic search query uses `IS NOT NULL` to exclude these). `1536` matches the dimensionality of `text-embedding-ada-002`, which is the production choice because it balances quality (high semantic accuracy) with cost (~$0.000001 per embedding — essentially free even at scale).

`lastAccessed DateTime?`: Updated each time this memory is loaded into a coaching context. Enables the access-recency factor in the ranking function (Section 1.6): a memory accessed yesterday is more likely to be relevant today than one accessed 60 days ago. `lastAccessed` is better than `createdAt` for this purpose because a memory created 6 months ago but accessed 3 days ago is demonstrably still relevant.

`accessCount Int @default(0)`: Incremented each time this memory is loaded. Identifies memories that have been consistently relevant across many sessions. A memory with `accessCount = 47` (loaded in nearly every session) is structurally more important than its importance score alone indicates — the athlete keeps triggering its retrieval. Capped in the ranking function at 10 accesses (beyond which additional access counts have diminishing discriminative value).

`isArchived Boolean @default(false)`: Soft delete instead of hard delete, for two reasons. First, GDPR data export requirements — an athlete requesting their data must receive all historical memories, including archived ones. Second, audit trail — if a coaching decision is disputed, the memory that informed it must be recoverable. Hard delete would destroy this record permanently.

**Index rationale:**

`@@index([athleteId, memoryType, tier])`: Covers the primary loading query: all Tier 1 FACT records for an athlete, which is the semantic search candidate pool. Without this index, loading the candidate pool requires a full table scan of all `coach_memories` rows filtered by `athleteId` — acceptable at 50 rows, expensive at 50,000.

`@@index([athleteId, importance])`: Covers the critical memory loading query: `WHERE athleteId = ? AND importance >= 0.9` to ensure high-importance memories are always loaded regardless of relevance. This query runs on every coaching turn.

`@@index([athleteId, lastAccessed])`: Covers the recency fallback: when semantic search produces fewer than K results (low-information sessions where the user's message doesn't have much to search against), fill remaining slots with the most recently accessed memories. Without this index, sorting by `lastAccessed DESC` requires a full athlete-scoped scan.

---

### 1.3 The Importance Scale — Full Explanation

The importance scale is not arbitrary — it is calibrated to the worst-case outcome if a memory is forgotten. The higher the consequence of forgetting, the higher the importance score. The scale enables the critical override (Section 1.6, Factor 3): any memory at `importance >= 0.9` bypasses relevance filtering and is always loaded.

**1.0 — Acute Medical Emergency**
Examples: "Athlete: has a known anaphylactic allergy to NSAIDs — do not recommend ibuprofen or naproxen." / "Athlete: carries an EpiPen for bee sting allergy on all outdoor runs." / "Athlete: was advised by their cardiologist to maintain HR below 155 bpm at all times."
Worst outcome if forgotten: Coach recommends ibuprofen for inflammation — athlete has anaphylactic reaction. Coach designs a race-day warmup with high-intensity spikes — athlete exceeds cardiologist's HR ceiling during a cardiac-risk window.
Position: 1.0 is reserved for facts where forgetting is immediately dangerous, not just coaching-quality degrading. These memories are flagged with `importance = 1.0` by the extraction prompt's explicit guidance and loaded with the critical override regardless of relevance.

**0.95 — Chronic Injury History**
Examples: "Athlete: recurrent left IT band syndrome, historically triggered above 60 km/week." / "Athlete: stress fracture in right second metatarsal, 14 months ago, cleared by sports medicine." / "Athlete: chronic Achilles tendinopathy managed with eccentric loading protocol."
Worst outcome if forgotten: Coach prescribes increasing mileage through a danger zone for an athlete whose documented injury pattern predicts a fracture at that load. Coach skips recommending professional consultation when athlete mentions tendon pain because prior injury context is absent.
Position: 0.95 because these facts are not immediately dangerous (the athlete is currently functioning) but directly affect training prescription. Forgetting them means the coach will give advice that is incorrect for this specific athlete's biomechanical vulnerabilities.

**0.9 — Medical Conditions Affecting Training**
Examples: "Athlete: diagnosed with iron deficiency anemia in January; supplement protocol prescribed by GP." / "Athlete: asthmatic — carries rescue inhaler on all runs above 30 minutes." / "Athlete: low ferritin history — high fatigue in weeks 6-8 of training blocks historically correlates with iron depletion."
Worst outcome if forgotten: Coach interprets persistent fatigue as overtraining (prescribes rest) rather than nutritional deficiency (prescribes dietary intervention and follow-up with GP). Coach misses the pattern that predicts the athlete's training will collapse in weeks 6-8 of every build.
Position: 0.9 because these conditions require the coach to modify its baseline reasoning. They are not immediately dangerous (the athlete is managing the condition) but change what "normal fatigue" means for this individual.

**0.8 — Hard Constraints: Non-Negotiable Schedule and Life Factors**
Examples: "Athlete: cannot run on Sundays — religious observance." / "Athlete: traveling internationally weeks 8-10 of training block, limited to hotel gym." / "Athlete: single parent, available for morning runs only on weekdays before 6:45am school drop-off."
Worst outcome if forgotten: Coach prescribes a long run on Sunday — prescription is structurally impossible to execute. Coach designs a peak training week during the travel block — athlete cannot execute any key sessions and the entire week is wasted. Coach asks "why didn't you do your long run this weekend?" — creating friction around an immovable life constraint.
Position: 0.8 because forgetting these produces coaching prescriptions that cannot be executed, which erodes trust faster than any other coaching failure.

**0.7 — Schedule Constraints: Flexible but Important**
Examples: "Athlete: prefers not to run on Saturdays (social commitments most weekends)." / "Athlete: usually has a team lunch on Tuesdays, making long morning runs difficult." / "Athlete: training partner available Wednesdays and Fridays — prefers to do quality sessions with a partner."
Worst outcome if forgotten: Coach schedules key sessions on constrained days, athlete consistently fails to execute, coach misinterprets as motivation or adherence problem rather than scheduling mismatch.
Position: 0.7 because these are flexible (can be negotiated) rather than hard constraints, but still meaningfully affect training plan viability.

**0.6 — Training Goals and Race-Related Targets**
Examples: "Athlete: targeting sub-1:45 half-marathon by end of year (stretch goal beyond current 1:55 race target)." / "Athlete: wants to complete a 50K trail ultra in 2027 — building toward it alongside the current road racing focus." / "Athlete: interested in age-group qualification for Boston, needs 1:29 half to qualify in age bracket."
Worst outcome if forgotten: Coach gives advice calibrated to the stated race goal (1:55:00) without accounting for the longer-term goal that should inform training decisions. Coach doesn't recognize that tempo work is serving dual purposes.
Position: 0.6 because goals provide context for framing and motivation but the coach can still give technically correct advice without knowing them. The advice is suboptimal rather than wrong.

**0.5 — Training Preferences**
Examples: "Athlete: strongly prefers trail running to road running when options are available." / "Athlete: dislikes treadmills — will run in rain but not on a treadmill." / "Athlete: prefers out-and-back routes to loops — easier to abort if fatigued."
Worst outcome if forgotten: Coach recommends treadmill workouts for bad weather weeks — athlete simply doesn't execute them without explanation. Coach designs loop routes in training prescriptions — athlete finds them demotivating and runs shorter than prescribed.
Position: 0.5 because preference violations cause friction and reduced adherence, but the underlying training value is achievable via different modalities.

**0.4 — Coaching Style Preferences**
Examples: "Athlete: prefers detailed explanations over simple prescriptions — wants to understand the 'why'." / "Athlete: responds poorly to negative framing — better engagement with 'here's what will help' than 'here's what you're doing wrong'." / "Athlete: tends to overinterpret single-session data — benefits from reminder to look at weekly trends."
Worst outcome if forgotten: Coach gives brusque prescriptions to an athlete who needs context — athlete disengages and stops asking coaching questions. Coach uses deficit framing with an athlete who needs positive framing — reduces motivation during difficult training weeks.
Position: 0.4 because coaching style affects relationship quality and engagement, not technical correctness of the coaching advice.

**0.2-0.3 — Minor Contextual Notes**
Examples: "Athlete: mentioned running the Big Sur Marathon as a bucket-list event (no firm plans)." / "Athlete: had a busy work week in March — noted this as context for low training load, not a recurring pattern." / "Athlete: said they enjoy listening to podcasts on easy runs."
Worst outcome if forgotten: The coach misses a minor personalization opportunity. Forgetting is essentially harmless.
Position: 0.2-0.3 because these are contextual notes that improve conversational rapport but do not affect coaching decisions. They should be stored (they represent real things the athlete said) but should never crowd out higher-importance memories in the loading process.

---

### 1.4 The Tier System — Why Semantic Search Alone Is Insufficient

Semantic search against all stored memories sounds complete: embed the user's query, find the most similar memories, load the top K. The problem is at scale.

**The problem semantic search alone cannot solve:**

After 2 years of daily coaching sessions, Alex Chen has 300 stored FACT memories. Some facts from 18 months ago are still true and relevant (the IT band history, the ferritin diagnosis). Other facts from 18 months ago have been superseded (Alex preferred morning runs but now runs at noon; Alex was targeting a 1:55 half but has since run a 1:48). Still other facts from 18 months ago are stale context (busy work week in October 2024, no longer relevant).

If you run semantic search against all 300 records:
1. The search itself is fast (pgvector with IVFFlat is O(lists + probes × cluster_size), not O(n)).
2. But the search *results* include stale facts that score highly on semantic similarity but are no longer true.
3. Example: Alex asks about training load for next week. Semantic search returns a memory from 14 months ago: "Athlete: runs 4 days per week due to work schedule." Alex now runs 6 days per week. The coach uses the wrong baseline.

The tier system solves this by separating the search candidate pool from the historical archive:
- **Tier 1 (active, 0-90 days)**: Semantic search candidates. These are recent enough to be presumed current. Loaded individually by relevance ranking.
- **Tier 2 (archived, >90 days)**: Not searched individually. These facts have been incorporated into the CONSOLIDATED memory record, which synthesizes everything known about the athlete into a coherent profile. The individual facts are kept for audit but never returned by search.
- **CONSOLIDATED** (conceptual "Tier 3"): Always loaded verbatim. One record that synthesizes all Tier 2 facts into an organized athlete profile. Updated by the consolidation job whenever Tier 1 FACT count exceeds the threshold (10 for free users, 50 for pro users).

**How tiers and semantic search work together:**

```
Loading strategy (pseudocode):

// 1. Always load the CONSOLIDATED profile (if it exists)
consolidated = findFirst(athleteId, memoryType=CONSOLIDATED)

// 2. Semantic search against Tier 1 FACTs only
queryEmbedding = embed(userMessage)
tier1Facts = semanticSearch(
  athleteId,
  memoryType=FACT,
  tier=1,
  queryEmbedding,
  K=10,
  minSimilarity=0.35
)

// 3. Always load critical memories (importance >= 0.9, any tier)
criticalMemories = findMany(athleteId, importance >= 0.9, tier=1)
// These bypass the similarity threshold

// 4. Load the most recent CONVERSATION_SUMMARY (if this is a return session)
recentSummary = findFirst(athleteId, memoryType=CONVERSATION_SUMMARY, 
                          orderBy: createdAt desc)

// 5. Merge, deduplicate, rank, select top N
loadedMemories = rank(tier1Facts + criticalMemories) // deduplicated
context.memorySummary = [consolidated, recentSummary, loadedMemories]
```

**Why Tier 2 records are never in the search candidate pool:**

Including Tier 2 records would mean searching 300 records instead of 30-50 Tier 1 records. More importantly, their semantic content is already captured in the CONSOLIDATED memory — searching them individually would just return the same information twice (once from the FACT record and once from the CONSOLIDATED record where the same fact appears). Tier 2 records exist for audit, not retrieval.

---

### 1.5 Embeddings — What They Are and How They Work in Pacer

**What an embedding is from first principles:**

An embedding is a numerical representation of text as a vector of numbers — specifically a list of 1,536 floating-point values for OpenAI's `text-embedding-ada-002` model. The model was trained so that texts with similar semantic meaning produce vectors that are geometrically close together in 1,536-dimensional space.

Two sentences can be measured for similarity using cosine similarity: the cosine of the angle between their vectors. Range is -1 to 1:
- Cosine similarity **0.97**: nearly identical meaning. Example: "Athlete prefers morning runs" and "Athlete likes to run in the morning."
- Cosine similarity **0.82**: related but distinct. Example: "Athlete prefers morning runs" and "Athlete schedules workouts before work."
- Cosine similarity **0.61**: broadly related. Example: "Athlete prefers morning runs" and "Athlete struggles with evening energy levels."
- Cosine similarity **0.35**: weakly related or coincidentally containing overlapping words. Example: "Athlete prefers morning runs" and "Athlete's race is in the morning."
- Cosine similarity **0.12**: effectively unrelated. Example: "Athlete prefers morning runs" and "Athlete has a history of IT band syndrome."

The 0.35 threshold in the Top-P filter (Section 1.7) is chosen because similarities below this value indicate the memory is responding to shared words, not shared meaning. The 0.92 threshold in redundancy detection is chosen because similarities above this indicate the same fact stated differently (with enough confidence to skip storing a duplicate).

**The write path — end to end:**

1. Alex sends a coaching message: "I tend to crash badly in week 7 of training blocks — it's happened in my last three build cycles."
2. `maybeExtractMemory()` pre-filter fires: message length > 60 AND high-signal keyword "tend to" matches → proceed.
3. Secondary Claude call extracts: *"Athlete: consistently experiences significant fatigue crash in week 7 of training blocks — pattern observed across 3 consecutive build cycles."* Importance assigned by Claude: 0.85 (recurring pattern affecting training).
4. **Redundancy check**: Generate query embedding for the extracted text. Run cosine similarity against all existing Tier 1 FACT embeddings for the athlete: `SELECT 1 - (embedding <=> $queryEmbedding) AS similarity FROM coach_memories WHERE athleteId = $id AND tier = 1 AND memoryType = 'FACT' AND importance < 0.90 ORDER BY similarity DESC LIMIT 1`. Best match similarity = 0.41 (below 0.92 threshold) → not a duplicate → proceed.
5. Store memory with embedding: `$executeRaw('INSERT INTO coach_memories (id, athleteId, summary, importance, embedding) VALUES ($1, $2, $3, $4, $5::vector)', [cuid(), athleteId, text, 0.85, JSON.stringify(embedding)])`. The `::vector` cast converts the JSON array to Postgres `vector(1536)` type.

**The read path — end to end:**

1. Alex sends a new message in a later session: "Why do I always feel so exhausted around week 6-7?"
2. OpenAI generates a query embedding for this message: a 1,536-float vector representing "exhaustion at week 6-7 of training."
3. pgvector cosine distance query runs against CoachMemory: `SELECT id, summary, importance, lastAccessed, accessCount, 1 - (embedding <=> $queryEmbedding) AS similarity FROM coach_memories WHERE athleteId = $id AND memoryType = 'FACT' AND tier = 1 AND embedding IS NOT NULL ORDER BY similarity DESC LIMIT 20`. Returns candidate pool.
4. Ranking function (Section 1.6) scores each candidate and selects Top-K.
5. Selected memories loaded into `memorySummary`. The week-7 crash memory scores highest due to semantic similarity.
6. Claude's system prompt now includes: *"Athlete: consistently experiences significant fatigue crash in week 7 of training blocks — pattern observed across 3 consecutive build cycles."* The response can say: "Your week 6-7 exhaustion follows a pattern you've described across multiple training blocks — this is likely accumulated fatigue rather than overtraining. Let's look at what week 5-6 load looked like..."

**Why `Unsupported("vector(1536)")` in Prisma:**

Prisma's schema parser does not know what `vector(1536)` means — it is a custom Postgres type added by the `pgvector` extension, not a native Postgres type that Prisma understands. `Unsupported()` tells Prisma: "pass this type string through to the migration SQL unchanged; do not try to map it to a TypeScript type." This means:

- **Migrations still work**: Prisma generates valid SQL with `embedding vector(1536)` and Postgres creates the column correctly.
- **Standard queries skip the column**: Any `prisma.coachMemory.findMany()` call that does not explicitly request `embedding` will not include it — Prisma simply omits unsupported columns unless specifically selected via `$queryRaw`.
- **Embedding operations use raw SQL**: Write: `$executeRaw('UPDATE coach_memories SET embedding = $1::vector WHERE id = $2', [JSON.stringify(vector), id])`. Read: `$queryRaw('SELECT id, summary, 1-(embedding <=> $1::vector) AS similarity FROM coach_memories WHERE ...')`.
- The only limitation: TypeScript types for the model will not include the `embedding` field — you cannot accidentally pass it to a standard Prisma query.

**Cost at scale:**

OpenAI charges approximately $0.0001 per 1,000 tokens for `text-embedding-ada-002`. A memory summary is typically 20-40 tokens. Cost per embedding: ~$0.000002 to $0.000004. At 1,000 memory extractions per day across the user base: $0.002 to $0.004 per day. Essentially free. The query embedding (one per coaching turn) is the same cost: ~$0.000002 per turn. The embedding system adds negligible cost and the redundancy check it enables avoids wasting memory slots on duplicate facts — a net positive even on pure cost terms.

---

### 1.6 The Ranking Function — Business Logic and Rationale

The ranking function transforms the raw vector similarity scores from pgvector into a final relevance score that reflects coaching value, not just textual proximity. It has five factors with explicit weights and business justifications.

**Complete scoring formula:**

```
finalScore(memory, query) =
  (semanticSimilarity × 0.50)
+ (importance × 0.30)
+ (criticalOverride: +0.50 if importance >= 0.90, else 0)
+ (accessRecency × 0.10)
+ (min(accessCount / 10, 1.0) × 0.20)
```

**Factor 1 — Semantic Similarity (50% weight)**

*What it measures:* How closely the memory's text matches the semantic meaning of the user's current message, measured by cosine similarity between the embeddings.

*Why 50% weight:* Semantic similarity is the core signal — it answers "is this memory relevant to what the athlete is asking right now?" It gets the largest single weight because relevance is the primary criterion. However, 50% (not 100%) leaves room for importance and access frequency to override in specific cases. A memory with 0.35 semantic similarity but importance 0.95 and a critical override should load anyway — giving similarity 100% weight would prevent this.

*Formula contribution:* `cosineSim × 0.50`. Maximum contribution: 0.50 (when similarity is 1.0).

**Factor 2 — Importance (30% maximum weight)**

*How computed:* `importance × 0.30`. A memory with importance 0.95 contributes 0.285. A memory with importance 0.50 contributes 0.15.

*Business justification:* A stress fracture history (importance 0.95) is more relevant to almost any coaching question than a shoe preference (importance 0.40), even if the shoe preference happens to share more words with the current question. Importance ensures that medical and injury-related facts are systematically favored over preference facts.

*Concrete example:* Alex asks "How should I approach my mileage increase this week?" Two memories compete:
- Memory A: "Athlete: prefers Brooks Glycerin for long runs." Semantic similarity: 0.38 (contains "run"). Importance: 0.40. Score: (0.38×0.50) + (0.40×0.30) = 0.19 + 0.12 = 0.31.
- Memory B: "Athlete: stress fracture in right metatarsal, 14 months ago — advised to limit mileage increases to 10% per week for 12 months." Semantic similarity: 0.75 (mileage increase is directly relevant). Importance: 0.95. Score: (0.75×0.50) + (0.95×0.30) = 0.375 + 0.285 = 0.66 (plus critical override: +0.50 → 1.16).

Memory B loads. Memory A does not.

**Factor 3 — Critical Override (flat +0.50 boost for importance >= 0.90)**

*What "critical" means:* Any memory with `importance >= 0.90` — the top three tiers of the importance scale: acute medical (1.0), chronic injury history (0.95), and medical conditions affecting training (0.90).

*Why a flat additive boost instead of a multiplier:* A multiplier (e.g., ×2.0) would still leave a low-similarity critical memory below a high-similarity non-critical memory in some configurations. A flat +0.50 additive boost provides a mathematical guarantee: any critical memory with even minimal semantic similarity (0.1) achieves a final score of at least 0.60, which is above most non-critical memories in the score range 0.0-0.60. This is the mechanism that ensures the ferritin history loads when Alex mentions fatigue — even if the word "ferritin" never appeared in the coaching question.

*Mathematical argument:* Critical memory with semantic similarity 0.1: (0.1×0.50) + (0.95×0.30) + 0.50 = 0.05 + 0.285 + 0.50 = 0.835. Non-critical memory with semantic similarity 0.95: (0.95×0.50) + (0.50×0.30) + 0.00 = 0.475 + 0.15 + 0.00 = 0.625. The critical medical memory loads. The highly relevant shoe preference memory does not.

**Factor 4 — Access Recency (10% maximum weight)**

*The decay function:* `max(0, 1 - daysSinceLastAccess / 30) × 0.10`. Full 0.10 contribution today. Zero contribution after 30 days. Linear decay between.

*Why access recency and not creation recency:* Creation recency answers "when was this fact first captured?" Access recency answers "when was this fact last relevant?" A memory created 6 months ago but accessed 3 days ago is demonstrably still active in the athlete's coaching relationship. A memory created 3 days ago but never accessed since may have been a one-time context that has already been resolved.

*Concrete example:* Memory A created 30 days ago, last accessed 2 days ago: recency contribution = (1 - 2/30) × 0.10 = 0.093. Memory B created 5 days ago, never accessed again: recency contribution = (1 - 5/30) × 0.10 = 0.083. Memory A scores higher on recency despite being older because its access history shows it is still relevant.

**Factor 5 — Access Frequency (maximum contribution 0.20 after 10 accesses)**

*Formula:* `min(accessCount / 10, 1.0) × 0.20`. A memory accessed 5 times contributes 0.10. A memory accessed 10 or more times contributes 0.20 (capped).

*Why cap at 0.2 and at 10 accesses:* Without a cap, a frequently accessed memory could dominate the ranking even when the current session is about something unrelated. The cap ensures frequency provides a meaningful boost without overriding the primary semantic similarity signal. The 10-access cap reflects the law of diminishing returns: the difference between 10 accesses and 50 accesses is not meaningfully discriminative — both indicate "consistently relevant."

*What it identifies:* Memories that have proven consistently relevant across many different coaching sessions. A memory about the athlete's stress fracture history that has been loaded in 15 separate sessions — covering topics from mileage increases to tempo runs to race planning — is structurally more important than its importance score alone suggests. The access frequency bonus captures this.

---

**Complete worked example — 5 memories, 2 queries:**

Alex Chen's memory pool (5 Tier 1 FACT records):

| # | Summary | Importance | AccessCount | DaysSinceAccess |
|---|---------|-----------|-------------|-----------------|
| M1 | "Athlete: prefers Brooks Glycerin for long runs, notices less knee strain than other shoes." | 0.40 | 3 | 12 |
| M2 | "Athlete: left IT band syndrome, historically triggered above 60 km/week." | 0.95 | 14 | 4 |
| M3 | "Athlete: cannot run on Sundays — religious observance, non-negotiable." | 0.80 | 8 | 7 |
| M4 | "Athlete: vegetarian, typically high-carb diet but struggles with protein recovery." | 0.70 | 5 | 21 |
| M5 | "Athlete: prefers shorter easy runs during work travel rather than skipping entirely." | 0.50 | 2 | 45 |

**Query 1: "Should I increase my weekly distance next week?"**

Semantic similarity scores (cosine similarity to query embedding):

| Memory | Sim | Importance | Critical | Recency | Frequency | Total |
|--------|-----|-----------|----------|---------|-----------|-------|
| M1 | 0.42 | 0.40 | 0 | (1-12/30)×0.10=0.06 | (3/10)×0.20=0.06 | (0.42×0.5)+(0.40×0.3)+0+0.06+0.06 = 0.21+0.12+0.12 = **0.45** |
| M2 | 0.71 | 0.95 | +0.50 | (1-4/30)×0.10=0.087 | (10/10)×0.20=0.20 | (0.71×0.5)+(0.95×0.3)+0.50+0.087+0.20 = 0.355+0.285+0.50+0.087+0.20 = **1.43** |
| M3 | 0.18 | 0.80 | 0 | (1-7/30)×0.10=0.077 | (8/10)×0.20=0.16 | (0.18×0.5)+(0.80×0.3)+0+0.077+0.16 = 0.09+0.24+0.237 = **0.57** |
| M4 | 0.28 | 0.70 | 0 | (1-21/30)×0.10=0.03 | (5/10)×0.20=0.10 | (0.28×0.5)+(0.70×0.3)+0+0.03+0.10 = 0.14+0.21+0.13 = **0.48** |
| M5 | 0.15 | 0.50 | 0 | 0 (>30 days) | (2/10)×0.20=0.04 | (0.15×0.5)+(0.50×0.3)+0+0+0.04 = 0.075+0.15+0.04 = **0.27** |

**Ranking for Query 1:** M2 (1.43) → M3 (0.57) → M4 (0.48) → M1 (0.45) → M5 (0.27)

Top 2 loaded: IT band history (M2) and Sunday constraint (M3). The coach knows: increasing distance risks IT band flare above 60 km/week, and any plan must work within a 6-day week.

**Query 2: "What should I eat on race morning?"**

| Memory | Sim | Total (abbreviated) |
|--------|-----|---------------------|
| M1 | 0.28 | ~0.35 |
| M2 | 0.12 | **0.91** (critical override lifts even 0.12 similarity) |
| M3 | 0.09 | ~0.35 |
| M4 | 0.76 | (0.76×0.5)+(0.70×0.3)+0+0.03+0.10 = 0.38+0.21+0.13 = **0.72** |
| M5 | 0.08 | ~0.21 |

**Ranking for Query 2:** M2 (0.91 with critical override) → M4 (0.72) → ...

Even for a nutrition question with no obvious connection to IT band syndrome, M2 loads because of the critical override. The coach knows about the IT band history. The coach knows about the vegetarian protein-recovery challenge. The system works.

---

### 1.7 Top-K and Top-P Filtering

The semantic search does not return a ranked list of all memories and let the caller decide how many to take. It enforces two filters at the query level.

**Top-K filtering (LIMIT clause):**

K=10 for Tier 1 FACT records. The pgvector query includes `LIMIT 10` in the ORDER BY similarity DESC result.

*Why not K=5:* Five candidates may not be enough after Top-P filtering removes low-similarity results. If 4 of the 5 closest memories are below the 0.35 threshold and 1 is above it, you end up with only 1 memory, even though there are 3 other genuinely relevant memories slightly further in similarity space. K=10 provides a buffer.

*Why not K=20:* Diminishing returns — the 11th-20th most similar memories are typically very weakly related to the query. Loading them adds noise to the context. The ranking function scores all K candidates, but the practical effect of K=10 vs K=20 on final context quality is minimal because the last 5-10 candidates rarely make it past the Top-P filter.

**Top-P filtering (minimum similarity threshold):**

`WHERE 1 - (embedding <=> $queryEmbedding) >= 0.35` — memories with cosine similarity below 0.35 are excluded from the candidate pool entirely before the ranking function runs.

*Why 0.35 specifically:* Cosine similarity below 0.35 indicates that the memory and the query are sharing coincidental word overlap (common function words) rather than shared semantic meaning. A memory about "Athlete runs in the morning" and a question about "Race morning nutrition strategy" both contain the word "morning" — their cosine similarity might reach 0.28. That is not relevant retrieval; it is coincidental vocabulary overlap. 0.35 is the practical threshold where genuine semantic relationship begins.

*The critical memory exception:* Memories with `importance >= 0.90` bypass the Top-P filter entirely. The critical override (Section 1.6, Factor 3) ensures they load regardless of similarity score. The WHERE clause reads: `WHERE (1 - (embedding <=> $queryEmbedding) >= 0.35 OR importance >= 0.90)`.

**The production SQL query with both filters:**

```sql
SELECT
  id,
  summary,
  importance,
  "lastAccessed",
  "accessCount",
  1 - (embedding <=> $1::vector) AS similarity
FROM coach_memories
WHERE
  "athleteId" = $2
  AND "memoryType" = 'FACT'
  AND tier = 1
  AND embedding IS NOT NULL
  AND "isArchived" = false
  AND (
    1 - (embedding <=> $1::vector) >= 0.35
    OR importance >= 0.90
  )
ORDER BY similarity DESC
LIMIT 10;
```

After this query returns, the ranking function applies in application code: scores each result, sorts by finalScore, selects the top 3-5 for loading into context.

*Why both filters together:* Top-K alone gives you the best 10 matches regardless of quality — the 10th-best match might be genuinely irrelevant. Top-P alone gives you all memories above 0.35, which could be 50 records if the athlete's memory pool is dense. Together: Top-P ensures every candidate is meaningfully related to the query; Top-K provides a hard upper bound that prevents the ranking function from scoring 50 candidates when only 10 are needed.

---

### 1.8 Conversation Summarization — The Compaction Bridge

**The problem:**

The messages route enforces a hard limit of 50 messages per conversation (`MAX_MESSAGES_PER_CONVERSATION = 50`). When message 50 arrives, the route returns 429 before any processing. But before reaching 50 messages, there is a subtler problem: `buildCoachContext()` only loads the last 8 messages into conversation history. Messages 1-42 of a 50-message conversation are not in the active context.

The current memory extraction system partially bridges this — `maybeExtractMemory()` captures durable facts from each turn. But it is limited to 5 memories per conversation and silently stops after the cap. A 30-message conversation about injury rehabilitation, training goals, schedule constraints, and racing history might generate 12 genuinely distinct facts — but only 5 are captured.

Without summarization, the coaching context at message 40 is: last 8 messages (turns 17-20) + up to 5 extracted memories. Turns 1-16 are completely invisible.

**Why summarization fires at message 45, not 50:**

At 50, the route returns 429 *before* building any context — there is no conversation history or coach context loaded. The summarization trigger cannot fire post-message because there is no opportunity. At 45 (the pre-emptive trigger), there are still 5 messages of buffer. The route can build context, detect `messageCount == 45`, trigger summarization fire-and-forget, and proceed normally with the current coaching turn.

If the trigger fired at 48, there would only be a 2-message buffer — a race condition risk exists where two concurrent messages could each see `messageCount >= 45` and both trigger summarization, creating duplicate summaries. At 45, the buffer is large enough to absorb any race condition.

**The fire-and-forget trigger:**

```ts
if (conversationMessageCount === 45) {
  void summarizeConversation(conversationId, athleteId, anthropic)
}
```

`summarizeConversation()` reads all 45 messages, calls Claude with a summarization prompt targeting 200 words, and writes a `ConversationSummary` record (Section 3.2). The coaching turn for message 45 proceeds normally without waiting for this.

**The difference between ConversationSummary and CoachMemory CONVERSATION_SUMMARY type:**

These are complementary records, not competing ones.

`ConversationSummary` (its own model, Section 3.2) is a detailed 200-word summary of the full conversation — what topics were covered, what conclusions were reached, what was prescribed, what the athlete is working on. It has an embedding for semantic retrieval. It can be found when a future session returns to a related topic. Example: "In the April session, we diagnosed the plateau in Alex's tempo paces as insufficient threshold work. We added a midweek tempo to the schedule. Alex reported the change felt challenging but manageable."

`CoachMemory` with `memoryType = CONVERSATION_SUMMARY` is a 3-4 sentence distillation of the same session, stored in the memory system. It is always loaded into the `memorySummary` field of `CoachContext` without semantic retrieval — it provides immediate continuity when the athlete returns for a new session. Example: "April 15 session: diagnosed tempo plateau, added midweek threshold session, athlete committed to 3 consecutive weeks at higher intensity."

Concretely: when Alex starts a new conversation in May, the coach context loads: (1) the CONSOLIDATED profile (overall athlete knowledge), (2) the CONVERSATION_SUMMARY memory from April (brief session bridge), and (3) semantically retrieved Tier 1 FACT memories relevant to Alex's opening message. If Alex asks about tempo work, the semantic search also finds the `ConversationSummary` record from April with its 200-word detail — the coach can reference specific details from that session.

---

### 1.9 User Memory Management — How the UI Works With Embeddings

The `/coach/memories` page exposes four operations. The embedding system is invisible to the user — they see text, edit text, delete entries. The embedding lifecycle is managed automatically.

**View:**
Standard `prisma.coachMemory.findMany({ where: { athleteId }, orderBy: { importance: 'desc' } })`. No embedding complexity. The frontend displays `summary`, `createdAt`, `importance`, and `memoryType`. The embedding column is not selected (Prisma omits `Unsupported` columns automatically).

**Add manually:**
User types a summary in the UI. On save:
1. Importance defaults to 0.65 (higher than auto-extracted default of 0.5, because manually added facts represent things the athlete explicitly wanted the coach to know — higher-confidence signal).
2. Generate embedding via OpenAI: `openai.embeddings.create({ model: 'text-embedding-ada-002', input: summary })`.
3. Redundancy check: cosine similarity against existing Tier 1 FACT embeddings. If max similarity > 0.92 → show user a "This is similar to an existing memory" warning with the duplicate candidate. User can proceed or cancel.
4. If not redundant: `$executeRaw` INSERT with embedding.
5. Invalidate Redis context cache: `redis.del('context:' + athleteId)`. The next coaching turn will recompute context with the new memory included.

**Edit:**
User modifies the summary text. On save:
1. The old embedding no longer represents the new text — a memory about "prefers morning runs" should not have the same embedding after the user corrects it to "prefers evening runs."
2. Generate new embedding for the updated text via OpenAI.
3. `$executeRaw` UPDATE: set both `summary` and `embedding` in one atomic operation (prevents a window where the text is updated but the old embedding still exists).
4. Invalidate Redis context cache.
The user sees: their text is updated. What happened invisibly: the memory's position in all future semantic searches shifted to match the new meaning.

**Delete single:**
1. `prisma.coachMemory.delete({ where: { id, athleteId } })` — Postgres CASCADE deletes the row and the embedding column with it. No orphaned vectors are possible because the embedding is stored in the row, not in a separate table.
2. Invalidate Redis context cache.

**Clear all:**
1. `prisma.coachMemory.deleteMany({ where: { athleteId } })` — all rows, all embeddings deleted.
2. Invalidate Redis context cache.
3. If a CONSOLIDATED record exists, it is also deleted — clearing all memories should reset the coaching relationship to zero state.

The user experience is identical to managing a list of text notes. The embedding system is an implementation detail that makes the retrieval system work — users never need to understand what an embedding is.

---

### 1.10 Memory and Subscription Tier Relationship

There are two different concepts both called "tier" in this system. Confusing them in an interview is a serious error. Understand them as completely separate dimensions.

**Concept 1: Storage Tier (lifecycle, 1=active / 2=archived)**
A property of individual `CoachMemory` records. Determines whether a memory is in the semantic search candidate pool. Tier 1 = searchable, recent, actively relevant. Tier 2 = archived, incorporated into CONSOLIDATED, kept for audit. This tier is automatic — it advances when the record crosses the 90-day threshold.

**Concept 2: Subscription Tier (billing, free/pro/team)**
A property of the `AthleteQuota` record. Determines what features the athlete has access to and what limits apply. Nothing to do with individual memories.

**How they interact:**

The subscription tier determines how many Tier 1 FACT memories can accumulate before the consolidation job runs and moves them to Tier 2:

| Subscription | Max Tier 1 FACTs before consolidation | Daily message limit | Memory limit (total) |
|---|---|---|---|
| Free | 10 records | 10 messages/day | 25 total memories |
| Pro | 50 records | 50 messages/day | 300 total memories |
| Team | 200 records | Unlimited | 1,000 total memories |

A free user who has 10 Tier 1 FACT memories triggers consolidation: a background job synthesizes those 10 facts into one CONSOLIDATED memory, moves the 10 FACT records to Tier 2, and the athlete now has 1 Tier 1 CONSOLIDATED + 0 Tier 1 FACTs. The next FACT extraction starts filling slots again. This means free users get a coaching experience where the memory synthesizes more aggressively into a compact profile — fewer individual facts, more consolidated knowledge.

A pro user with 50 Tier 1 FACTs has a richer, more granular coaching memory — each individual fact is still searchable before consolidation. This produces more precise semantic retrieval at the cost of more storage.

**Cost math justifying the pro tier limit:**

- Tier 1 FACT storage: ~$0.000002 per embedding, negligible.
- Semantic search per coaching turn: pgvector cosine distance query, ~5ms against 50 records. Acceptable.
- Daily message limit (50): at $0.003 per turn (input + output tokens), max daily cost per pro user = $0.15. Annual: $54.75. Pro subscription should be priced above $8/month to be sustainable.
- Free tier (10 messages/day): max daily cost = $0.03. Annual: $10.95. Free users can be subsidized by pro revenue at a 5:1 ratio.
- Team tier (unlimited messages): sold at enterprise pricing, not self-serve — cost is recoverable through contract pricing.

---

## Part 2: Caching Architecture

### 2.1 Current Implementation — What Exists and Its Fundamental Limitation

**What the module-level Map is:**

In Node.js, a "module-level" variable is declared at the top level of a module file — outside any function. It is initialized once when the module is first loaded and persists in memory for the lifetime of the Node.js process. The cache in `src/lib/intelligence/context-cache.ts` is:

```ts
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30_000
```

This Map lives in the memory of a single Node.js process. Every request that reaches this process instance will benefit from the cache. The cache entry contains:

```ts
interface CacheEntry {
  context:    AthleteIntelligenceContext  // the full computed output of all 6 engines
  computedAt: number                      // Date.now() at time of computation
  athleteId:  string
}
```

**How TTL works:**

When `getCachedContext()` is called, it checks `Date.now() - entry.computedAt > 30_000`. If the entry is older than 30 seconds, it is deleted from the Map and null is returned — triggering recomputation. There is no background eviction job; eviction happens lazily on the next cache check after TTL expiry.

**Why 30 seconds:**

Training data (CTL, ATL, ACWR, phase) does not change between API calls in the demo environment. The 30-second TTL was chosen to: (1) cover the typical user session's rapid navigation across multiple pages (dashboard → activities → coach → weekly brief) without recomputing, and (2) align with the CDN `s-maxage=30` header so both caches expire at approximately the same time.

**What the Map contains for Alex Chen (mock data):**

```
Map {
  "cmopb72l0000abc123xyz" → {
    computedAt: 1748908200000,  // Date.now() when computed
    athleteId: "cmopb72l0000abc123xyz",
    context: {
      athlete: { id: "cmopb72l0000abc123xyz", name: "Alex Chen", maxHeartRate: 185 },
      trainingLoad: { ctl: 59.9, atl: 38.2, tsb: 21.7, acwr: 0.639, trend: "DECLINING" },
      injuryRisk: { category: "OPTIMAL", acwr: 0.44, explanation: "..." },
      phase: { phase: "BUILD", confidence: "HIGH", daysUntilRace: 68 },
      racePrediction: { predictedTimeFormatted: "1:53:19", gapToGoalFormatted: "1:41 ahead" },
      // ... all other fields
    }
  }
}
```

**The multi-instance problem (the fundamental limitation):**

Vercel's serverless architecture spins up separate Node.js process instances for each function invocation under concurrent load. With 1,000 concurrent users, Vercel might run 50 separate instances of the `buildAthleteIntelligenceContext` function simultaneously.

```
[Instance A]              [Instance B]              [Instance C]
Map: {                    Map: {                    Map: {
  "alex...": cached         (empty)                   (empty)
}                         }                         }

Request from Alex → A     Request from Alex → B     Request from Alex → C
→ cache HIT               → cache MISS              → cache MISS
→ returns in 25ms         → computes (300ms)        → computes (300ms)
→ no DB queries           → 6 DB queries            → 6 DB queries
```

Instance B and Instance C have never seen Alex's context because they are different processes with different memory spaces. Alex's Map entry on Instance A cannot be seen by Instance B. The cache provides zero benefit under concurrent load.

**Why this is worse than it sounds:**

The demo works because traffic is low — typically only one warm instance exists. The reviewer navigates through the app, always hitting the same warm container, and the cache appears to work. Under real traffic with 100+ concurrent users, the cache miss rate approaches 100% because requests are distributed across many instances.

---

### 2.2 Production Caching — Redis as Shared Cache

**What Redis is from first principles:**

Redis is an in-memory key-value store that runs as a separate service — not as part of any individual application server. Every Vercel function instance connects to Redis over the network (1-5ms latency). When Instance A writes a key to Redis, Instance B can read that key immediately. The cache is shared across all instances by definition.

**What Redis contains for Alex Chen (mock data):**

```
KEY:   context:cmopb72l0000abc123xyz
VALUE: {
  "athlete": { "id": "cmopb72l0000abc123xyz", "name": "Alex Chen", "maxHeartRate": 185 },
  "trainingLoad": { "ctl": 59.9, "atl": 38.2, "tsb": 21.7, "acwr": 0.639, "trend": "DECLINING" },
  "injuryRisk": { "category": "OPTIMAL", "acwr": 0.44, "explanation": "Training load is within optimal range (ACWR 0.44)." },
  "phase": { "phase": "BUILD", "confidence": "HIGH", "daysUntilRace": 68, "coachingImplication": "Add a quality session this week." },
  "racePrediction": { "predictedTimeFormatted": "1:53:19", "confidenceLowFormatted": "1:49:14", "confidenceHighFormatted": "1:57:24", "gapToGoalFormatted": "1:41 ahead", "confidenceScore": 80 },
  "weeklyBrief": { "keySignal": "CTL 59.9 is declining — consistency this week matters.", "thisWeekPrescription": ["Easy run Monday 8km", "Tempo Tuesday 5km at threshold HR"], "warnings": [] },
  "recentActivities": [ ... ],
  "weeklySummaries": [ ... ],
  "coachMemories": [ ... ]
}
TTL:   47 seconds remaining
```

**What Supabase contains simultaneously (mock data — raw tables):**

```
athletes table:
  id: "cmopb72l0000abc123xyz"  name: "Alex Chen"  maxHeartRate: 185  restingHeartRate: 52

activities table (last 5 rows, out of 54):
  id: "act_001"  startedAt: "2026-05-24"  distanceMeters: 8200  trainingLoad: 42.3  workoutType: EASY
  id: "act_002"  startedAt: "2026-05-22"  distanceMeters: 5000  trainingLoad: 31.1  workoutType: TEMPO
  ...

weekly_training_summaries table (last 2 rows):
  weekStartDate: "2026-05-18"  totalLoad: 187.2  ctl: 61.2  atl: 44.1  tsb: 17.1  acwr: 0.72
  weekStartDate: "2026-05-25"  totalLoad: 38.2   ctl: 59.9  atl: 38.2  tsb: 21.7  acwr: 0.44
```

**The fundamental principle:**

Supabase is the source of truth — permanent, durable, ACID-compliant. Redis is the performance layer — fast, temporary, derived. Every value in Redis can be rebuilt exactly from Supabase by running the 6 intelligence engines again. If Redis is wiped, the system falls back to computing from Supabase. No data is lost. Redis losing data means a performance cost (one full recomputation per athlete), not a correctness cost.

---

### 2.3 The Three-Layer Cache Architecture

```
Request → [L1: In-Memory Map, 0ms, 10s TTL]
             ↓ (miss)
          [L2: Redis, 1-5ms, 60s TTL]
             ↓ (miss)
          [L3: Supabase, 20-100ms, source of truth]
             → 6 DB queries + 6 intelligence engines
             → write to Redis
             → write to L1 Map
```

**Layer 1 — In-Memory Map (L1, 10-second TTL):**
- Latency: 0ms (memory access)
- Instance-local — not shared across Vercel instances
- Purpose: prevents redundant Redis calls within a single warm instance. When a dashboard tab and a coach tab both open simultaneously, both calls hit the same Vercel instance (common for a single user session) — L1 serves the second call without a Redis round trip.
- TTL shortened to 10 seconds (from current 30 seconds) because the L2 Redis cache now provides the cross-instance consistency guarantee. L1 is just a hot-path optimization, not the primary cache.

**Layer 2 — Redis (L2, 60-second TTL):**
- Latency: 1-5ms (network to Redis, typically Upstash or Vercel KV in same region)
- Shared across all Vercel instances
- Purpose: the production fix for the multi-instance problem. Every instance reads from and writes to the same Redis instance. A cache hit on any instance benefits all subsequent requests regardless of which instance they land on.
- TTL extended to 60 seconds (from the current 30-second TTL on the CDN header) because the shared cache is more reliable — it can be explicitly invalidated when data changes, so holding the value longer is safe.

**Layer 3 — Supabase (source of truth):**
- Latency: 20-100ms per query, 5+ queries + engine computation = 110-310ms total cold path
- Always accurate — never stale
- Expensive: 6 database round trips + CPU for all intelligence engines
- Only accessed when L1 and L2 both miss

**Lookup sequence (pseudocode):**

```ts
async function getAthleteContext(athleteId: string): Promise<Context> {
  // L1: in-memory Map
  const l1 = l1Cache.get(athleteId)
  if (l1 && Date.now() - l1.computedAt < 10_000) {
    return l1.context
  }

  // L2: Redis
  const l2 = await redis.get(`context:${athleteId}`)
  if (l2) {
    const parsed = JSON.parse(l2)
    l1Cache.set(athleteId, { context: parsed, computedAt: Date.now() })
    return parsed
  }

  // L3: compute from Supabase
  const context = await computeFromSupabase(athleteId)
  await redis.set(`context:${athleteId}`, JSON.stringify(context), { ex: 60 })
  l1Cache.set(athleteId, { context, computedAt: Date.now() })
  await updateContextCacheMetadata(athleteId, { lastComputedAt: new Date() })
  return context
}
```

**Cache invalidation triggers:**

*Trigger 1 — New activity imported from Strava:*
1. Write Activity row to Supabase.
2. Update or create WeeklyTrainingSummary for the current week in Supabase.
3. `await redis.del('context:' + athleteId)` — L2 invalidated.
4. `l1Cache.delete(athleteId)` — L1 invalidated.
5. `await updateContextCacheMetadata(athleteId, { lastInvalidatedAt: new Date(), invalidationReason: 'new_activity' })`.
Result: the next coaching turn or dashboard load recomputes from the fresh Supabase data. The athlete immediately sees their new activity reflected in ACWR, CTL, and weekly brief.

*Trigger 2 — Memory updated or deleted:*
1. Update `CoachMemory` in Supabase.
2. Regenerate embedding via OpenAI (if summary text changed).
3. `await redis.del('context:' + athleteId)` — the cached context includes `coachMemories` which is now stale.
Result: next coaching turn loads the updated memory.

**Why full invalidation + recomputation instead of targeted Redis patching:**

Patching specific fields in Redis (e.g., `redis.json.set('context:alex', '$.coachMemories[0].summary', newSummary)`) risks consistency errors. If the cache entry's `coachMemories` array has a different structure than expected (from a schema change, a code deployment, or a race condition), the patch applies to the wrong structure silently. Full invalidation + recomputation is safer: it reads from Supabase (ground truth), runs all engines, produces a correct result. The extra 100-300ms on one request is the correct tradeoff versus silent cache corruption.

---

### 2.4 CDN Cache Headers — s-maxage and stale-while-revalidate

**What a CDN is from first principles:**

A CDN (Content Delivery Network) is a network of servers placed geographically close to end users. When a request arrives at `lumalabs-eng-take-home-e066572123aa-two.vercel.app`, it first hits the nearest Vercel CDN edge node — in San Francisco if the user is in California, in Frankfurt if they are in Germany. The CDN edge checks whether it has a cached copy of the response. If it does, it returns the cached copy immediately. The origin server (the Vercel serverless function running your code) is never reached.

**The s-maxage=30 timeline with a concrete example:**

- **T=0 (8:00:00 AM):** First request arrives at CDN edge. No cached copy exists. CDN forwards request to Vercel origin. Origin runs `buildAthleteIntelligenceContext`: 6 DB queries, 5 engines = 200ms. Returns dashboard JSON. CDN caches the response, sets expiry at T=30.

- **T=8 (8:00:08 AM):** Second request arrives at CDN edge. Cache entry exists, age = 8 seconds, max-age = 30 seconds → cache is fresh. CDN returns cached copy immediately. **Origin function never executes. No DB queries. No JavaScript runs on Vercel.**

- **T=25 (8:00:25 AM):** Third request. Cache age = 25 seconds, still fresh. CDN returns cached copy. No origin execution.

- **T=35 (8:00:35 AM):** Fourth request. Cache age = 35 seconds, s-maxage = 30 → **stale**. stale-while-revalidate = 60 → still within the 60-second revalidation window (35 - 30 = 5 seconds of stale, less than 60). CDN does two things simultaneously: (1) **immediately returns the stale copy** to the user (no wait), (2) sends a background request to the origin to refresh the cache.

- **T=37 (8:00:37 AM):** Background revalidation completes. CDN now has a fresh copy. Any subsequent request within the next 30 seconds returns the new fresh copy.

- **T=100 (8:01:40 AM):** Cache age = 100 seconds. s-maxage = 30, stale-while-revalidate = 60. Total staleness window = 30 + 60 = 90 seconds. Age 100 > 90 → **stale-while-revalidate window expired**. CDN must fetch fresh copy synchronously before returning to the user. User waits.

**Why "the function never even executes" for CDN hits:**

The CDN operates at the HTTP protocol level. When a CDN hit occurs, the response is returned from edge infrastructure — there is no Lambda function invoked, no Next.js runtime started, no Prisma query executed, no JavaScript parsed. The function file (`route.ts`) is not loaded. The only CPU cost is the CDN edge returning cached bytes over HTTP.

**Why 90 seconds of staleness is acceptable for coaching data:**

CTL and ATL are exponential moving averages with 42-day and 7-day time constants respectively. A CTL value of 59.9 changes by approximately `59.9 × (1 - e^(-1/42)) × 0` = exactly 0 over 90 seconds (no new training load in 90 seconds of viewing a dashboard). The coaching phase (BUILD vs TAPER) is determined by days until race — which changes by 0 over 90 seconds. The race prediction is computed from the best qualifying effort in the last 8 weeks — which doesn't change in 90 seconds.

For stock prices (change in milliseconds), 90-second staleness would cause real financial harm — a user sees a price, makes a trade, the actual price is $5 different. For coaching data, 90-second staleness is undetectable: the coaching advice for BUILD phase is the same at T=0 and T=90.

**Routes with CDN cache headers vs without:**

With `s-maxage=30, stale-while-revalidate=60`:
- `GET /api/dashboard` — training phase, ACWR, race prediction: stable across 90 seconds
- `GET /api/race-prediction` — Riegel calculation: stable across 90 seconds
- `GET /api/weekly-brief` — deterministic function output: stable across days, not just seconds

Without CDN cache headers:
- `POST /api/coach/conversations/[id]/messages` — POST requests are not CDN-cached by definition (POST is a write). Also user-specific streaming content.
- `GET /api/activities?page=2` — paginated user navigation; page content is user-specific and request-specific.
- `GET /api/activity/[id]` — specific activity detail; not frequently accessed enough to benefit from CDN caching.

---

### 2.5 IP Rate Limiting — The First Line of Defense

**What an IP address is and why it matters:**

Every device that connects to the internet has an IP address — a numerical identifier assigned by their ISP. When a request arrives at Vercel, the IP address of the requester is available in the request headers. IP rate limiting uses this address to track and limit how many requests a single source can make in a time window.

**Three attack scenarios IP rate limiting prevents:**

*Scenario 1 — Credential stuffing:* An attacker has a list of 100,000 email/password combinations from a data breach. They write a script that tries each combination against `/api/auth/login` at 1,000 requests per second. IP rate limiting detects: this IP has made 100 requests in the last minute → block the next request with 429.

*Scenario 2 — Pre-auth API abuse:* Even before authentication, public API routes can be probed to extract information or cause server load. A bad actor repeatedly calls `/api/dashboard` to cause expensive Supabase queries. IP rate limiting fires before any authentication check — the attacker's IP is blocked before any DB query is executed.

*Scenario 3 — DDoS (Distributed Denial of Service):* A botnet floods the service with requests from thousands of IPs. Per-IP rate limiting reduces the blast radius — each individual IP is rate-limited, requiring a much larger botnet to sustain the attack. Combined with Vercel's DDoS protection at the CDN layer, this provides defense-in-depth.

**What IP rate limiting looks like in Redis (mock data):**

During normal use:
```
KEY:   ratelimit:ip:203.0.113.42:minute:1748908200
VALUE: 12
TTL:   48 seconds
```
Alex is making 12 requests per minute — well below the 100/minute threshold.

During an attack:
```
KEY:   ratelimit:ip:198.51.100.99:minute:1748908200
VALUE: 143
TTL:   12 seconds
```
The attacker has made 143 requests in this minute window — exceeds 100 threshold → 429 returned immediately.

**Implementation — atomic Redis incr:**

```ts
async function checkIPRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:ip:${ip}:minute:${Math.floor(Date.now() / 60000)}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 60) // set TTL on first request in window
  }
  return count <= 100 // true = allowed, false = blocked
}
```

The `INCR` command is atomic — it increments and returns the new value in one operation. There is no race condition where two concurrent requests both see count=99 and both pass. The first request increments to 100 (passes), the second to 101 (blocked).

**Why 100 requests per minute:**

A typical user navigating Pacer makes 5-10 requests per minute (dashboard load, activities list, coach message, weekly brief). 100/minute is 10× the typical user's traffic pattern. Any legitimate use case is accommodated; automated scripting at scale is blocked. Lower thresholds (20/minute) would produce false positives on power users with multiple tabs open. Higher thresholds (500/minute) would not stop meaningful attacks.

**Why IP rate limiting runs before auth, before any database query:**

Cost of a blocked request with IP rate limiting: one Redis `INCR` call = ~1ms. Cost of a blocked request without IP rate limiting: Prisma query to validate session, Supabase query to look up athlete, possibly building coach context = 100-300ms per request. At 1,000 attacker requests per second, the difference is: 1,000ms of Redis vs 100,000-300,000ms of Supabase load. IP rate limiting at the edge absorbs the attack before it reaches the database layer.

---

### 2.6 Daily Message Quotas — Redis and Supabase Hybrid

**The problem with Supabase only:**

Every coaching message would trigger: `SELECT COUNT(*) FROM coach_messages WHERE athleteId = $1 AND createdAt >= today_start`. At 50,000 DAU each sending 10 messages/day = 500,000 COUNT queries against the `coach_messages` table daily. COUNT queries with date filters on large tables are expensive — as the `coach_messages` table grows to millions of rows, each COUNT query takes longer. This approach works for 100 users; it does not work for 100,000 users.

**The problem with Redis only:**

Redis data is in-memory. If the Redis instance restarts (planned maintenance, unexpected failure), all quota data disappears. Alex has sent 23 messages today → Redis crashes → Redis restarts with empty state → Alex can send unlimited messages for the rest of the day. This is a correctness problem, not just a performance problem.

**What both systems contain for Alex Chen (mock data):**

Supabase `athlete_quotas` table (source of truth):
```
id:                  "quota_abc123"
athleteId:           "cmopb72l0000abc123xyz"
subscriptionTier:    "PRO"
dailyMessageCount:   23
lastMessageDate:     "2026-05-26"
totalInputTokens:    482300
totalOutputTokens:   89200
resetAt:             "2026-05-26T23:59:59Z"
```

Redis (fast path):
```
KEY:   quota:daily:cmopb72l0000abc123xyz:20260526
VALUE: 23
TTL:   14h 23m (until midnight UTC)
```

**What happens when Alex sends message 24:**

1. `redis.get('quota:daily:cmopb72l0000abc123xyz:20260526')` → returns `"23"` → parseInt = 23.
2. 23 < 50 (Pro daily limit) → proceed.
3. `[Full coaching pipeline runs: context build, system prompt, Claude stream, safety check]`
4. Post-stream (async): `redis.incr('quota:daily:cmopb72l0000abc123xyz:20260526')` → Redis becomes 24.
5. `prisma.athleteQuota.update({ where: { athleteId }, data: { dailyMessageCount: 24, totalInputTokens: { increment: inputTokens }, totalOutputTokens: { increment: outputTokens } } })` — Supabase update (async, fire-and-forget, does not block response).

**What happens at midnight:**

The Redis key `quota:daily:cmopb72l0000abc123xyz:20260526` expires (TTL = time until midnight). Alex sends the first message of May 27:
1. `redis.get('quota:daily:cmopb72l0000abc123xyz:20260527')` → returns null (new day key, never set).
2. Redis miss → fall back to Supabase: `prisma.athleteQuota.findUnique({ where: { athleteId } })`.
3. Check if `lastMessageDate === today` → no (it's a new day). Reset: `dailyMessageCount = 0, lastMessageDate = today`.
4. Set Redis: `redis.set('quota:daily:...20260527', 0, { ex: secondsUntilMidnight })`.
5. Proceed with message 1 of the new day.

**What happens if Redis crashes mid-day:**

1. Redis crashes. All quota keys disappear.
2. Alex sends message 25. Redis GET → null (miss).
3. Fall back to Supabase: `dailyMessageCount = 24` (still accurate — Supabase was updated after message 24).
4. 24 < 50 → proceed. Set Redis: `redis.set(key, 24, ...)`. Redis is repopulated from ground truth.
5. No correctness problem. Alex is never double-counted or given excess quota. Performance cost: one extra Supabase lookup on Redis miss. The system is self-healing.

---

### 2.7 ContextCacheMetadata — Observability for the Cache Layer

**Why this model exists:**

Without persistent cache observability, you cannot answer operational questions: "Which athletes have a high cache miss rate?" (indicates cold starts or excessive cache invalidation), "What is the average cold recomputation time?" (helps set SLA for cache miss latency), "How often is the cache being invalidated for each athlete?" (identifies athletes who are syncing frequently vs. inactive), "Are cache misses clustering at certain times?" (might indicate Vercel cold-start patterns).

The in-memory Map emits `intelligence_context_cache_hit` and `intelligence_context_cache_miss` console logs (visible in Vercel function logs), but these are instance-local and ephemeral — you cannot query them to answer "what was the cache hit rate for the last 7 days?"

**All fields with rationale:**

```prisma
model ContextCacheMetadata {
  id              String    @id @default(cuid())
  athleteId       String    @unique  // one record per athlete
  lastComputedAt  DateTime?          // when was the context last computed from Supabase?
  lastCacheHitAt  DateTime?          // when was the context last served from cache?
  cacheHitCount   Int       @default(0)  // total cache hits (L1 + L2) for this athlete
  cacheMissCount  Int       @default(0)  // total cache misses (fell through to Supabase)
  avgComputeMs    Float?               // rolling average of full recomputation latency
  lastInvalidatedAt DateTime?          // when was the cache last explicitly invalidated?
  invalidationReason String?           // "new_activity" | "memory_updated" | "manual"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

`lastComputedAt`: Set every time the full Supabase computation runs. Allows detecting athletes whose context has not been recomputed in a long time (possible staleness if invalidation is broken).

`lastCacheHitAt`: Set on every cache hit. The ratio `cacheHitCount / (cacheHitCount + cacheMissCount)` is the hit rate. A hit rate below 80% for a frequently active athlete indicates the cache is not working effectively.

`avgComputeMs`: Updated using an exponential moving average: `newAvg = oldAvg × 0.9 + latestMs × 0.1`. Tracks whether cold-path latency is increasing over time (e.g., as the activity table grows and Prisma queries take longer).

`lastInvalidatedAt` + `invalidationReason`: Allows querying "how many athletes had their cache invalidated today and why?" A spike in invalidations suggests a bug in the Strava sync pipeline triggering excessive invalidations.

**Why stored in Supabase, not Redis:**

Cache performance data is permanent observability data — it accumulates over weeks and months and is queried for trend analysis. It should survive Redis restarts and Redis key evictions. Supabase (durable Postgres) is the correct store. Redis is for ephemeral performance data (current TTL, current quota count). Supabase is for permanent operational records.

---

## Part 3: New Schema Models

### 3.1 AthleteQuota — Rate Limiting and Cost Tracking

**Complete schema:**

```prisma
model AthleteQuota {
  id               String    @id @default(cuid())
  athleteId        String    @unique
  subscriptionTier String    @default("FREE")  // "FREE" | "PRO" | "TEAM"
  dailyMessageCount Int      @default(0)
  lastMessageDate   String   // "YYYY-MM-DD" — compared against today to detect day rollover
  resetAt           DateTime // next midnight UTC

  // Token-based cost tracking (preferred over estimatedCostUSD — see rationale)
  totalInputTokens  BigInt   @default(0)
  totalOutputTokens BigInt   @default(0)

  // Model-specific token breakdown
  sonnetInputTokens  BigInt  @default(0)
  sonnetOutputTokens BigInt  @default(0)
  haikuInputTokens   BigInt  @default(0)
  haikuOutputTokens  BigInt  @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  athlete Athlete @relation(fields: [athleteId], references: [id], onDelete: Cascade)

  @@map("athlete_quotas")
}
```

**Why token counts instead of estimatedCostUSD:**

The current implementation logs `estimatedCostUSD` per coaching turn:

```ts
const estimatedCostUSD =
  (contextTokenEstimate / 1_000_000 * INPUT_COST_PER_MTK) +
  (estimatedOutputTokens / 1_000_000 * OUTPUT_COST_PER_MTK)
```

Storing this USD value in a database column creates a data corruption problem: when Anthropic changes pricing (which happens), all historical stored values represent a different cost model than current values. A stored `estimatedCostUSD` of $0.0042 from 6 months ago and a stored $0.0042 from today may represent different amounts of actual usage because the per-token price changed.

Storing token counts instead:
1. Token counts are stable facts about what happened (how many tokens were consumed) — pricing does not retroactively change token counts.
2. Cost is computed at query time from current pricing: `SELECT totalInputTokens * 0.000003 + totalOutputTokens * 0.000015 AS estimatedCostUSD FROM athlete_quotas WHERE athleteId = $1`.
3. When Anthropic changes pricing, the query formula changes — no data migration needed.
4. Model-specific breakdowns (`sonnetInputTokens`, `haikuInputTokens`) enable accurate attribution when the system uses different models for different tasks (e.g., Haiku for memory extraction, Sonnet for coaching). Aggregating into one column would mix pricing tiers incorrectly.

**Cost computation formula:**

```sql
SELECT
  athleteId,
  (sonnetInputTokens / 1000000.0 * 3.00) +
  (sonnetOutputTokens / 1000000.0 * 15.00) +
  (haikuInputTokens / 1000000.0 * 0.25) +
  (haikuOutputTokens / 1000000.0 * 1.25)
  AS totalEstimatedCostUSD
FROM athlete_quotas
WHERE athleteId = $1;
```

Pricing as of 2026: claude-sonnet-4-6 = $3.00/MTok input, $15.00/MTok output. claude-haiku-4-5 = $0.25/MTok input, $1.25/MTok output. These constants change in the query, not in the stored data.

**Daily message count sync mechanism:**

`dailyMessageCount` is stored redundantly in both AthleteQuota (Supabase, source of truth) and Redis (fast path). The sync mechanism:
- On each message: increment Redis first (fast, atomic), then async-update Supabase.
- On Redis miss: read from Supabase, repopulate Redis.
- On day rollover: Redis key expires at midnight, next request rebuilds from Supabase.
- Async updates to Supabase are fire-and-forget but use a retry queue (not yet implemented) to handle Supabase write failures.

**Subscription tier limits with cost math:**

```ts
const DAILY_LIMITS = {
  FREE: 10,   // max cost: 10 × $0.003 avg/turn = $0.030/day = $10.95/year per free user
  PRO: 50,    // max cost: 50 × $0.003 = $0.150/day = $54.75/year per pro user
  TEAM: -1,   // unlimited (sold at enterprise pricing, not self-serve)
}
```

Free tier rationale: $10.95/year max cost per user. At $0/month subscription price, free users must be subsidized by pro revenue. With a 5:1 free:pro ratio and pro at $15/month ($180/year), revenue per pro covers 180/54.75 = 3.3 free users. Economics work.

Pro tier rationale: $54.75/year max cost at $180/year revenue = 69.6% margin at the limit. Most pro users average 15-20 messages/day (not 50), so average actual cost is ~$20/year, giving 89% margin. Sustainable.

Team tier: enterprise contract pricing where cost is explicitly negotiated — unlimited usage requires a different commercial relationship.

---

### 3.2 ConversationSummary — The Compaction Bridge Schema

**Complete schema:**

```prisma
model ConversationSummary {
  id             String   @id @default(cuid())
  conversationId String   @unique  // one summary per conversation, upsert-safe
  athleteId      String

  summary        String   @db.Text // 150-200 word detailed summary of the full conversation
  messageCount   Int                // number of messages in the conversation at time of generation
  generatedAtMsg Int                // should always be 45 — the trigger message number

  embedding      Unsupported("vector(1536)")?  // enables semantic retrieval of past sessions

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  athlete      Athlete          @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  conversation CoachConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([athleteId, createdAt])
  @@map("conversation_summaries")
}
```

**Field rationale:**

`conversationId @unique`: The `@unique` constraint ensures there is at most one summary per conversation. Combined with Prisma's `upsert` operation, this makes summarization idempotent — if the fire-and-forget trigger fires twice for the same conversation (edge case: concurrent messages hitting message 45 simultaneously), the second upsert updates the existing record rather than creating a duplicate.

`generatedAtMsg Int`: Records which message number triggered summarization. The value should always be 45 (the trigger point). If you query and find values of 30 or 20, there was a bug in the trigger logic — this field enables detecting that regression without reading logs.

`messageCount Int`: The total number of messages at the time the summary was generated. Allows estimating how much conversation context was summarized. If a conversation has 50 messages but the summary's `messageCount` is 45, you know the last 5 messages happened after summarization and are not included.

`embedding Unsupported("vector(1536)")?`: Enables semantic retrieval of past conversation summaries. When Alex starts a new conversation and mentions "tempo work," the coaching context can semantically search `ConversationSummary` records: "find past sessions where tempo work was discussed." Without embeddings, summaries can only be loaded by recency. With embeddings, they can be loaded by relevance to the current session topic.

**The relationship between ConversationSummary and CoachMemory CONVERSATION_SUMMARY type:**

These are complementary, not competing. They serve different retrieval patterns:

`ConversationSummary` (its own model): A 150-200 word detailed record. Retrieved semantically — only loaded when it is relevant to the current session's topic. Not always loaded. Contains enough detail to reconstruct the narrative of what happened in that session.

`CoachMemory` with `memoryType = CONVERSATION_SUMMARY`: A 3-4 sentence digest. Always loaded into the `memorySummary` field of the next coaching context, regardless of relevance. Provides continuity ("Last session we discussed your tempo plateau and agreed to add a midweek threshold session — how did it go?") without waiting for semantic search to find the right summary.

Together: The CONVERSATION_SUMMARY memory gives the coach immediate continuity on session start. The `ConversationSummary` record with its embedding gives the coach access to detail when a specific past session becomes relevant to the current conversation.

---

### 3.3 IVFFlat Index — What It Is and Why It's Needed

**Why a regular B-tree index does not work for vector similarity search:**

A B-tree index works by sorting values in a tree structure. To find records matching `WHERE value = 42`, the B-tree navigates from root to the matching leaf in O(log n) time — fast because sorted data has a single closest point.

Vector similarity search is a fundamentally different problem: "find the K vectors most similar to query vector Q." In 1,536-dimensional space, "similar" means geometrically close by cosine distance. A B-tree cannot be built for this because there is no single sorted order in 1,536 dimensions — every dimension is an independent axis. To find the K closest vectors with a B-tree, you would have to compute the distance from Q to every single vector and sort. That is O(n) — exact search, which scales linearly with the number of stored vectors.

**What IVFFlat does:**

IVFFlat (Inverted File with Flat compression) is an approximate nearest neighbor index for high-dimensional vectors. It works in two phases:

1. **At index-build time:** Cluster all stored vectors into `lists` groups using k-means clustering. With `lists = 100`, the index finds 100 cluster centroids that represent the "center" of 100 different regions of the vector space. Each stored vector is assigned to the nearest centroid.

2. **At query time:** Instead of comparing the query vector to all N stored vectors, IVFFlat:
   - Finds the `probes` nearest centroids to the query vector (comparing against 100 centroids = 100 operations).
   - Searches only the vectors assigned to those `probes` clusters (comparing against ~N/lists × probes vectors).

**The math with 1,000 memories:**

- Exact search: 1,000 comparisons. Always correct.
- IVFFlat with lists=100, probes=5: 100 (centroid comparison) + 5 clusters × ~10 vectors/cluster = 100 + 50 = **150 comparisons**. ~6.7× faster.
- At 10,000 memories: Exact = 10,000 comparisons. IVFFlat ≈ 100 + 50 = 150 comparisons. ~67× faster.

The speedup grows as the dataset grows because IVFFlat's search cost is roughly constant while exact search scales linearly.

**Why "approximate" is acceptable for memory retrieval:**

IVFFlat is approximate because it only searches the `probes` nearest clusters, not all clusters. Vectors that are genuinely relevant but happen to be assigned to a cluster whose centroid is not in the top `probes` will be missed. This is the quality-speed tradeoff.

For memory retrieval: missing the 11th-most-relevant coaching memory is an acceptable miss. The coaching context needs the top 3-5 most relevant memories. IVFFlat reliably finds these in the top clusters. The missed memories are, by definition, less similar to the query than the ones found. The coaching quality impact of these misses is minimal.

**The probes parameter:**

`probes` controls how many clusters to search at query time. Higher probes = more accurate results, slower query. Lower probes = faster, more approximate.

- `probes = 1`: Only search the single nearest cluster. Very fast. Many relevant memories missed.
- `probes = 5-10`: Search the 5-10 nearest clusters. Catches 95%+ of true nearest neighbors for typical memory queries. Recommended range for coaching memory retrieval where moderate precision is acceptable.
- `probes = lists` (100): Exact search. Defeats the purpose of the index.

`probes = 5-10` is appropriate because coaching memory retrieval quality at 95%+ recall is indistinguishable from exact search in practice — the user cannot perceive whether the coach loaded the 3rd-nearest or the 4th-nearest memory.

**When to rebuild the index:**

IVFFlat cluster centroids are computed once at index-build time and do not update automatically as new vectors are added. New vectors are added to the nearest existing cluster. After significant growth (e.g., the memory pool doubles), the clusters no longer represent the actual distribution of vectors — some clusters become dense while others are sparse, reducing retrieval accuracy. Rule of thumb: rebuild the index when the number of vectors has increased by 50%+ since the last build. For a coaching memory system with moderate growth rate, rebuilding monthly is sufficient.

**Why lists = 100:**

The pgvector recommendation is `lists = sqrt(num_vectors)`. For 10,000 memories (a large long-term user): `sqrt(10,000) = 100`. This formula produces clusters of approximately `num_vectors / lists = 100` vectors each — a size where exact search within the cluster is fast (100 comparisons) and the centroid comparison meaningfully narrows the search space.

For a system starting with 1,000 memories: `sqrt(1,000) = 32`. Use `lists = 32` initially and rebuild to `lists = 100` when the dataset grows. Creating the index:

```sql
CREATE INDEX coach_memories_embedding_idx
ON coach_memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## Part 4: End-to-End Production Request Flows

### 4.1 Complete Coaching Message Flow With All Production Systems

**Alex Chen sends: "Why do I feel exhausted around week 6-7 of every training block?"**

Using consistent mock data throughout:
- Athlete ID: `cmopb72l0000abc123xyz`
- IP address: `203.0.113.42`
- Session: valid Iron Session cookie
- Conversation ID: `conv_xyz789`
- Redis context: warm (60s TTL, 23s remaining)
- Daily quota: 23 messages today (Pro limit: 50)

---

**Step 1 — IP Rate Limit Check → Redis**
*Latency: ~1ms*

```
redis.incr("ratelimit:ip:203.0.113.42:minute:1748908200") → 14
```

14 < 100 (threshold) → allowed. Continue.

If count had been 101 → `return NextResponse.json({ error: "Too many requests" }, { status: 429 })`. The function returns here. No auth check. No DB query. Total cost: 1 Redis call.

---

**Step 2 — Iron Session Auth Verification → CPU**
*Latency: ~1ms (crypto, no I/O)*

```ts
const session = await getIronSession(request, response, sessionOptions)
if (!session.athleteId) return redirect('/login')
const athleteId = session.athleteId // "cmopb72l0000abc123xyz"
```

Iron Session decrypts the session cookie using `SESSION_SECRET`. If the cookie is invalid, expired, or tampered → redirect to login. No database query. CPU-only cryptographic operation.

---

**Step 3 — Conversation Validation → Supabase**
*Latency: ~25ms*

```ts
const conversation = await prisma.coachConversation.findUnique({
  where: { id: "conv_xyz789" }
})
if (!conversation || conversation.athleteId !== "cmopb72l0000abc123xyz")
  return 404
```

Confirms the conversation exists and belongs to the authenticated athlete. Prevents horizontal privilege escalation (user A cannot post to user B's conversation).

---

**Step 4 — Daily Message Limit → Redis (fast path)**
*Latency: ~1ms*

```
redis.get("quota:daily:cmopb72l0000abc123xyz:20260526") → "23"
```

23 < 50 (Pro limit) → allowed.

If Redis returns null (cache miss): fall back to `prisma.athleteQuota.findUnique({ where: { athleteId } })`. Check `dailyMessageCount`. Repopulate Redis. Latency: ~25ms instead of ~1ms. Correctness unaffected.

If count had been 50: `return 429 with { error: "Daily message limit reached. Resets at midnight UTC." }`. Function returns. No expensive operations have occurred.

---

**Step 5 — Context Retrieval → Redis (hit)**
*Latency: ~2ms*

```
redis.get("context:cmopb72l0000abc123xyz") → [full JSON, 1,847 bytes]
```

L1 in-memory Map check runs first (0ms, misses — different instance than last request). L2 Redis returns the full `AthleteIntelligenceContext`. Parsed into TypeScript object. Written to L1 for subsequent requests from this instance.

If Redis misses: L3 Supabase computation = 6 DB queries + 5 engines = ~200ms. Write result to Redis. Latency: ~200ms instead of ~2ms.

Mock data in Redis context includes:
```json
{
  "trainingLoad": { "ctl": 59.9, "atl": 38.2, "tsb": 21.7 },
  "phase": { "phase": "BUILD", "daysUntilRace": 68 },
  "injuryRisk": { "category": "OPTIMAL", "acwr": 0.44 }
}
```

---

**Step 6 — Memory Loading → Embedding Query, Ranking, Selection**
*Latency: ~15ms (OpenAI embedding + pgvector query)*

Generate query embedding for "Why do I feel exhausted around week 6-7 of every training block?":
```
openai.embeddings.create({ model: "text-embedding-ada-002", input: userMessage })
→ [0.023, -0.156, 0.089, ...] // 1,536 floats
```

pgvector query against Tier 1 FACT memories:
```sql
SELECT id, summary, importance, "lastAccessed", "accessCount",
       1 - (embedding <=> $1::vector) AS similarity
FROM coach_memories
WHERE "athleteId" = 'cmopb72l0000abc123xyz'
  AND "memoryType" = 'FACT'
  AND tier = 1
  AND embedding IS NOT NULL
  AND (1 - (embedding <=> $1::vector) >= 0.35 OR importance >= 0.90)
ORDER BY similarity DESC
LIMIT 10;
```

Results (mock):
- Memory: "Athlete: history of low ferritin — caused fatigue crash in weeks 6-7 of last 2 training blocks" | similarity: 0.89 | importance: 0.90 | accessCount: 11
- Memory: "Athlete: vegetarian, protein recovery is challenging" | similarity: 0.51 | importance: 0.70 | accessCount: 5

Ranking function applies (Section 1.6). Top 3 selected after scoring. Also load: CONSOLIDATED profile (if exists) + most recent CONVERSATION_SUMMARY memory.

`lastAccessed` updated for selected memories. `accessCount` incremented.

---

**Step 7 — System Prompt Assembly → CPU**
*Latency: ~1ms*

`buildSystemPrompt(coachContext)` concatenates all context sections (Section 4B of Case_Review_Prep.md) into a structured string. With loaded memories, the `memorySummary` section contains:

```
## Previous Conversation Context
Athlete: history of low ferritin — caused fatigue crash in weeks 6-7 of last 2 training blocks.
Athlete: vegetarian, protein recovery is challenging.
```

Total system prompt: ~1,400 tokens. Well within 2,500 budget — no compression cascade triggered.

---

**Step 8 — Claude Streaming**
*Latency: 300-800ms to first token, 3-6s total*

```ts
const anthropicStream = anthropic.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: systemPrompt,
  messages: [...conversationHistory, { role: "user", content: userMessage }],
})
```

Vercel begins streaming text_delta events to the ReadableStream. Each token is immediately forwarded to the client:
```ts
for await (const event of anthropicStream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    fullText += event.delta.text
    controller.enqueue(encoder.encode(event.delta.text))
  }
}
```

Claude's response references the loaded memory: "Your week 6-7 exhaustion has a documented pattern — you've mentioned it in previous sessions and it's consistent with what we know about your ferritin history. Low iron classically presents as..."

---

**Step 9 — Chunk-Based Safety Interception (Layer 1 Patterns)**
*Latency: <1ms (synchronous string check)*

After stream completes, `classifyCoachingResponse(fullText, anthropic)` runs. Layer 1 substring pre-filter checks the full response against 28 health-adjacent terms. The response contains "ferritin" and "iron" → Layer 1 fires.

Layer 1 fires → proceed to Layer 2.

---

**Step 10 — Post-Stream Safety Classification (Layer 2 Claude)**
*Latency: 200-500ms*

Secondary Claude call:
```ts
const result = await anthropic.messages.create({
  model: COACH_MODEL,
  max_tokens: 50,
  messages: [{ role: "user", content: SAFETY_CLASSIFICATION_PROMPT + "\n\n" + fullText }],
})
```

Claude evaluates the response. Returns "PASS" — the response discussed ferritin in the context of training fatigue and recommended seeing a GP for iron testing, which is appropriate coaching language, not a medical diagnosis. No disclaimer appended.

If Layer 2 had returned "FAIL": disclaimer appended to stream (`\n\n---\n_Note: For medical concerns, please consult a sports medicine professional._`) and to stored content.

---

**Step 11 — Message Persistence → Supabase**
*Latency: ~25ms*

```ts
await prisma.coachMessage.create({
  data: {
    conversationId: "conv_xyz789",
    sessionId: "sess_abc",
    role: "ASSISTANT",
    content: fullText,
    metadata: { suggestedQuestions: ["→ When did you last get iron levels checked?"] },
  },
})
```

The assistant message is now permanently stored. The streaming response was already delivered to the client — this persist operation does not affect user-facing latency.

---

**Step 12 — Quota Increment → Redis + Supabase (async)**
*Latency: ~1ms (Redis) + ~25ms (Supabase, async)*

```ts
// Synchronous Redis increment
await redis.incr("quota:daily:cmopb72l0000abc123xyz:20260526") // → 24

// Fire-and-forget Supabase update
void prisma.athleteQuota.update({
  where: { athleteId: "cmopb72l0000abc123xyz" },
  data: {
    dailyMessageCount: 24,
    totalInputTokens: { increment: contextTokenEstimate },
    totalOutputTokens: { increment: estimatedOutputTokens },
    sonnetInputTokens: { increment: contextTokenEstimate },
    sonnetOutputTokens: { increment: estimatedOutputTokens },
  },
})
```

Redis update is synchronous (quick consistency guarantee). Supabase update is fire-and-forget (eventual consistency for the permanent record).

---

**Step 13 — Memory Extraction → Fire-and-Forget**
*Latency: 0ms (non-blocking)*

```ts
void maybeExtractMemory(athlete.id, conversationId, userMessage, storedContent)
```

Pre-filter check: `userMessage.length > 60` → true. Proceeds.

Secondary Claude call (in background, ~800ms):
- Extracts: "Athlete: experiences fatigue crash in weeks 6-7 of training blocks — corroborated by low ferritin history from prior sessions."
- Redundancy check: cosine similarity 0.91 against existing ferritin memory (below 0.92 threshold) → not duplicate → store.

---

**Step 14 — Memory Created → Supabase Write + Embedding + Cache Invalidation**
*Latency: ~20ms (Supabase) + ~15ms (OpenAI embedding) + ~1ms (Redis del)*

```ts
await prisma.coachMemory.create({ data: { athleteId, conversationId, summary, importance: 0.90 } })
const embedding = await openai.embeddings.create({ model: "text-embedding-ada-002", input: summary })
await prisma.$executeRaw`UPDATE coach_memories SET embedding = ${JSON.stringify(embedding.data[0].embedding)}::vector WHERE id = ${newMemory.id}`
await redis.del("context:cmopb72l0000abc123xyz")  // invalidate — coachMemories is now stale
```

**Total latency breakdown:**

| Step | Time | On critical path? |
|---|---|---|
| IP rate limit | 1ms | Yes |
| Auth verification | 1ms | Yes |
| Conversation validation | 25ms | Yes |
| Daily message limit | 1ms | Yes |
| Context retrieval (Redis hit) | 2ms | Yes |
| Memory embedding + query | 15ms | Yes |
| System prompt assembly | 1ms | Yes |
| Claude time-to-first-token | 300-800ms | Yes |
| Claude total streaming | 3-6s | Yes |
| Safety Layer 1 | <1ms | Yes (post-stream) |
| Safety Layer 2 | 200-500ms | Yes (post-stream) |
| Message persist | 25ms | Yes (post-stream) |
| Quota increment (Redis) | 1ms | Yes |
| Quota update (Supabase) | 25ms | No (fire-and-forget) |
| Memory extraction | 800ms | No (fire-and-forget) |
| Embedding generation | 15ms | No (fire-and-forget) |
| Cache invalidation | 1ms | No (fire-and-forget) |

**Time-to-first-byte:** ~345-820ms. **Total stream completion:** ~4-7s.

---

### 4.2 Memory Edit Flow — Full Cache and Embedding Update

**Alex edits the memory: "Athlete: prefers morning runs before 7am" → "Athlete: prefers evening runs after 6pm (schedule change as of May 2026)"**

---

**Step 1: PATCH /api/coach/memories/[id]**

Request arrives with `{ id: "mem_abc", summary: "Athlete: prefers evening runs after 6pm (schedule change as of May 2026)" }`.

**Before:**
```
coach_memories table:
  id: "mem_abc"
  athleteId: "cmopb72l0000abc123xyz"
  summary: "Athlete: prefers morning runs before 7am"
  importance: 0.50
  embedding: [0.023, -0.156, ...]  // represents "morning runs" concept
  lastAccessed: "2026-05-24T08:32:00Z"
  accessCount: 7
```

---

**Step 2: Ownership Verification → Supabase**
*Latency: ~25ms*

```ts
const memory = await prisma.coachMemory.findUnique({ where: { id: "mem_abc" } })
if (!memory || memory.athleteId !== session.athleteId) return 404
```

Prevents user A from editing user B's memories. The athleteId on the memory must match the authenticated session's athleteId.

---

**Step 3: Supabase Update (summary text)**
*Latency: ~20ms*

```ts
await prisma.coachMemory.update({
  where: { id: "mem_abc" },
  data: { summary: "Athlete: prefers evening runs after 6pm (schedule change as of May 2026)" },
})
```

At this moment, the database has mismatched state: the `summary` field says "evening runs" but the `embedding` column still represents "morning runs" semantics. Any semantic search run between now and Step 5 would return this memory for "morning" queries and not for "evening" queries. The gap is typically <100ms — acceptable in practice.

---

**Step 4: OpenAI Embedding Generation for New Text**
*Latency: ~15ms*

```ts
const response = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: "Athlete: prefers evening runs after 6pm (schedule change as of May 2026)",
})
const newEmbedding = response.data[0].embedding // [0.047, 0.198, -0.023, ...] — different vector
```

The new embedding vector semantically represents "evening runs" — it will be close to queries about "evening training," "post-work runs," "night time workouts," and far from "morning runs," "early workouts," "pre-work training."

---

**Step 5: Supabase Update (embedding column)**
*Latency: ~20ms*

```ts
await prisma.$executeRaw`
  UPDATE coach_memories
  SET embedding = ${JSON.stringify(newEmbedding)}::vector
  WHERE id = ${"mem_abc"}
`
```

Using `$executeRaw` because Prisma does not have a native type for `vector(1536)`. The `::vector` cast converts the JSON array to the pgvector format. Both `summary` and `embedding` are now consistent. The memory will now appear in semantic searches for "evening" and disappear from searches for "morning."

**After:**
```
coach_memories table:
  id: "mem_abc"
  athleteId: "cmopb72l0000abc123xyz"
  summary: "Athlete: prefers evening runs after 6pm (schedule change as of May 2026)"
  importance: 0.50
  embedding: [0.047, 0.198, -0.023, ...]  // now represents "evening runs" concept
  lastAccessed: "2026-05-24T08:32:00Z"
  accessCount: 7
  updatedAt: "2026-05-26T14:47:33Z"
```

---

**Step 6: Redis Context Cache Invalidation**
*Latency: ~1ms*

```ts
await redis.del("context:cmopb72l0000abc123xyz")
```

The cached context in Redis includes the `coachMemories` array, which contains the old "morning runs" memory summary. If not invalidated, the next coaching turn would load the cached context with the stale summary — Claude would believe Alex runs in the morning when Alex now runs in the evening. This would produce incorrect training prescriptions (e.g., suggesting pre-work runs that Alex can no longer do).

Redis invalidation forces recomputation on the next request. The recomputed context will load the updated "evening runs" memory.

**Why not patch the Redis JSON directly:**

`redis.json.set("context:alex", "$.coachMemories[0].summary", newSummary)` would be faster (~1ms vs the next request's full recomputation). But: the `coachMemories` array in the cached context is ordered by creation date with indices that may have shifted if memories were added or deleted since the cache was written. Patching index `[0]` might update the wrong memory. Full invalidation + recomputation is safe; targeted JSON patching is fragile.

---

**Step 7: ContextCacheMetadata Update**
*Latency: ~20ms (async)*

```ts
void prisma.contextCacheMetadata.upsert({
  where: { athleteId: "cmopb72l0000abc123xyz" },
  update: { lastInvalidatedAt: new Date(), invalidationReason: "memory_updated" },
  create: { athleteId: "cmopb72l0000abc123xyz", lastInvalidatedAt: new Date(), invalidationReason: "memory_updated" },
})
```

Records the invalidation event for operational visibility. Fire-and-forget — does not block the response.

---

**Step 8: Response to User**
*Total latency: ~81ms (Steps 1-7 on critical path)*

```json
{
  "success": true,
  "data": {
    "id": "mem_abc",
    "summary": "Athlete: prefers evening runs after 6pm (schedule change as of May 2026)",
    "importance": 0.50,
    "updatedAt": "2026-05-26T14:47:33Z"
  }
}
```

The user sees their memory updated instantly. What happened invisibly: the semantic search position of this memory shifted from "morning" to "evening" concept space. The Redis cache was invalidated. The next coaching session will correctly know Alex runs in the evenings.

---

## Part 5: Interview Quick Reference

### 5.1 The 10 Most Important Production Decisions

**Decision 1 — Semantic memory retrieval instead of recency-based loading**

*Decision:* Use embedding similarity search (pgvector cosine distance) to select which memories to load into the coaching context, rather than loading the most recently created memories.

*Alternative rejected:* `ORDER BY createdAt DESC LIMIT 3` — the current implementation. Fast, simple, no OpenAI dependency. Rejected because it systematically loads irrelevant memories when the current question doesn't match recent conversation topics, while leaving high-value historical facts (injury history, medical context) permanently buried.

*Rationale:* A coach's value comes from knowing the right thing at the right time. A memory about knee history from 6 months ago is more valuable for a question about mileage increases than a memory about race-day fueling from 3 days ago. Semantic retrieval selects by relevance, not by creation timestamp. The result is a coaching experience that feels coherent across months rather than one that only references recent sessions.

*Production tradeoff:* Semantic retrieval adds ~15ms per coaching turn (embedding generation + pgvector query). It introduces an OpenAI API dependency — if OpenAI is down, memory retrieval falls back to recency-based loading. The dependency is acceptable because the embedding quality at `text-embedding-ada-002` is high and the cost is negligible.

---

**Decision 2 — Tier system for memory lifecycle management**

*Decision:* Tier 1 FACT memories (0-90 days) are semantic search candidates; Tier 2 (>90 days) are archived into CONSOLIDATED profiles and excluded from search.

*Alternative rejected:* Search all memories forever (no tiering). More accurate recall in theory — a highly relevant memory from 2 years ago could be retrieved. Rejected because as the memory pool grows to hundreds of records, many are outdated or superseded. Searching outdated memories adds noise and risk of stale advice.

*Rationale:* The tier system solves the "stale but similar" problem: a memory from 18 months ago saying "prefers morning runs" might score 0.85 similarity to a question about scheduling, but if Alex now runs in the evenings (updated 3 months ago in Tier 1), the Tier 2 record is wrong. By consolidating Tier 2 into a synthesized CONSOLIDATED profile and only searching Tier 1, the search always returns recent-enough-to-be-true facts.

*Production tradeoff:* The CONSOLIDATED synthesis job must run correctly — a bug in consolidation could lose information when moving facts from Tier 1 to Tier 2. The job requires careful testing and an audit trail (Tier 2 records are soft-deleted, not hard-deleted) so human review is possible if consolidation fails.

---

**Decision 3 — IVFFlat index for approximate nearest neighbor search**

*Decision:* Create a `CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)` on `coach_memories.embedding`.

*Alternative rejected:* Exact nearest neighbor search (no index, full table scan). Correct results every time. Rejected because exact search scales linearly with the number of memories — at 10,000 memories, every coaching turn runs 10,000 vector comparisons. With 100 concurrent users, that's 1,000,000 comparisons per second.

*Rationale:* IVFFlat reduces search cost from O(n) to approximately O(lists + probes × cluster_size) by clustering vectors and only searching nearby clusters. The quality tradeoff is ~2-5% miss rate on true nearest neighbors — acceptable for memory retrieval where missing the 10th-most-relevant memory has no perceptible coaching quality impact.

*Production tradeoff:* IVFFlat clusters are computed at index-build time and do not update dynamically. The index must be rebuilt periodically as the dataset grows (recommended: when vector count increases 50%+ since last build). Between rebuilds, retrieval accuracy gradually degrades as new vectors are assigned to stale clusters.

---

**Decision 4 — Importance scoring for medical history protection**

*Decision:* Every `CoachMemory` has an `importance Float (0.0-1.0)` field. Memories with `importance >= 0.90` bypass the relevance threshold filter and are always loaded.

*Alternative rejected:* No importance differentiation — all memories treated equally. Simpler to implement. Rejected because it allows a preference memory ("prefers morning runs") to displace a medical memory ("stress fracture history") in the 3-memory loading slots, based purely on which was created more recently.

*Rationale:* The worst-case outcome of forgetting a preference is minor friction. The worst-case outcome of forgetting a medical constraint is a coaching prescription that harms the athlete. The importance scale ensures high-consequence facts are systematically protected from eviction. The critical override (+0.50 additive boost) guarantees mathematical certainty that importance >= 0.90 memories load regardless of relevance competition.

*Production tradeoff:* Importance scores are assigned during extraction by Claude's judgment. Claude can misclassify importance — assigning 0.85 to an acute medical constraint that should be 1.0. The extraction prompt must include explicit guidance and examples for each importance tier. Human review of extracted memories (the existing `/coach/memories` page) provides a correction mechanism.

---

**Decision 5 — Redis as shared cache across serverless instances**

*Decision:* Replace the module-level `Map<string, CacheEntry>` with a three-layer cache: L1 (in-memory Map, 10s TTL, instance-local) → L2 (Redis, 60s TTL, shared) → L3 (Supabase, source of truth).

*Alternative rejected:* Keep the module-level Map only. Zero infrastructure cost. Already implemented. Rejected because it provides zero benefit under concurrent load (each serverless instance has its own Map; a cache hit on Instance A does not help Instance B).

*Rationale:* Redis is a single service that all function instances connect to. A context computed by Instance A is immediately available to Instance B via Redis. The cache hit rate under concurrent load changes from ~0% (module-level Map only) to ~95%+ (Redis shared cache) for frequently accessed athletes.

*Production tradeoff:* Redis introduces a new infrastructure dependency and 1-5ms of network latency per cache check. On a Redis outage, all requests fall through to L3 (Supabase recomputation), causing latency to spike but not causing correctness failures. Using a managed Redis service (Upstash, Vercel KV) with built-in replication reduces outage risk.

---

**Decision 6 — Redis + Supabase hybrid for daily message quotas**

*Decision:* Store daily message counts in both Redis (fast reads, atomic increments) and Supabase (durable, source of truth). Redis serves reads; Supabase serves as the authoritative fallback.

*Alternative 1 rejected:* Supabase only (COUNT query per message). Correct and simple. Rejected because COUNT queries on large tables are expensive and slow at scale — every message requires a DB query before the coaching pipeline can proceed.

*Alternative 2 rejected:* Redis only (no Supabase backup). Fast. Rejected because Redis key loss (restart, eviction, outage) means quota data is lost. An attacker could trigger a Redis restart and gain unlimited messages.

*Rationale:* The hybrid provides both performance (Redis for the common case) and correctness (Supabase as fallback and source of truth). If Redis crashes mid-day, the next request reads from Supabase (accurate) and repopulates Redis. No quota violation is possible.

*Production tradeoff:* Dual writes (Redis + Supabase) create a brief window of inconsistency if the Supabase write fails after the Redis write succeeds. Mitigation: use a retry queue for Supabase writes, and treat Redis as the authoritative count for the current day with Supabase as the end-of-day reconciliation source.

---

**Decision 7 — Subscription tiers with daily message limits**

*Decision:* Three tiers — Free (10/day), Pro (50/day), Team (unlimited) — with Redis-enforced limits before any coaching pipeline code executes.

*Alternative rejected:* No limits — unlimited messages for all users. Simplest UX. Rejected because at $0.003 per coaching turn, 1,000 DAU each sending 100 messages/day = $300/day = $109,500/year with no revenue. Economically unsustainable.

*Rationale:* The daily limit converts the cost control problem from "per-request cost" to "per-user daily cap." The limits are enforced in Redis before any DB query or Claude call — a user over their limit costs ~1ms of Redis lookup, not the full pipeline cost. The tier structure provides a sustainable revenue model: free users generate product value and referrals; pro users generate revenue that covers both their cost and a portion of free user cost.

*Production tradeoff:* Message limits are a friction point. Users who hit their limit will be frustrated. The UX must be: transparent about limits (show count on every page), graceful on limit hit (offer upgrade, not just error), and generous enough that typical users rarely hit the limit. Free at 10/day means a casual user who opens the app twice a week never hits the limit; an engaged user who talks to the coach daily will upgrade.

---

**Decision 8 — Conversation summarization at message 45, not 50**

*Decision:* When `conversationMessageCount === 45` (not 50), trigger fire-and-forget summarization. Store the result in `ConversationSummary` and create a `CoachMemory CONVERSATION_SUMMARY` record.

*Alternative rejected:* Summarize at message 50. At 50, the messages route checks count FIRST and returns 429 BEFORE building context — there is no opportunity to trigger summarization inside the route handler. Summarization at 50 would require a separate background job triggered by the 429 response, adding complexity.

*Rationale:* At message 45, the route handler still has full access to the conversation context and can trigger summarization fire-and-forget before closing. The 5-message buffer prevents the race condition where two simultaneous messages both reach 45 and both trigger summarization.

*Production tradeoff:* Summarization at 45 means the last 5 messages (46-50) are NOT included in the ConversationSummary. These messages are still in the 8-turn sliding window for the immediate coaching turn, but they will be excluded when the user starts a new conversation. This is acceptable — the 5-message gap is small relative to the 45 messages that are summarized.

---

**Decision 9 — Post-stream safety interception instead of pre-delivery interception**

*Decision:* Run the two-layer safety classifier (Section 7F of Case_Review_Prep.md) after the full response has streamed to the client, not before delivery.

*Alternative rejected:* Buffer the full response, classify it, then deliver if safe. Eliminates the risk of the user seeing problematic content. Rejected because buffering eliminates streaming — the user waits for the full response before seeing any text, destroying the conversational feel. Average response buffering time would add 3-5 seconds of blank screen.

*Rationale:* The current approach delivers partial responses to the user immediately (good UX) and appends a disclaimer if the safety classifier flags the content (correct outcome, slightly awkward UX). The failure mode — user sees potentially problematic language followed by a disclaimer — is preferable to the alternative — user waits 3-5 extra seconds on every message.

*Production tradeoff:* Chunk-based interception (detecting problematic patterns mid-stream and stopping delivery before the full response is sent) would be the ideal solution. Implementation complexity: requires buffering N tokens (enough to detect a pattern), checking for patterns, and either releasing the buffer or stopping the stream. This is feasible but more complex than the current post-stream approach.

---

**Decision 10 — Embedding redundancy detection before storing new memories**

*Decision:* Before creating a new `CoachMemory` record, check cosine similarity against existing Tier 1 FACT memories. If max similarity > 0.92, skip storage (duplicate detected).

*Alternative rejected:* No redundancy detection — store all extracted memories as-is. Simpler. Rejected because duplicate memories consume the per-conversation extraction cap and per-athlete total memory limit, crowding out unique high-value facts.

*Rationale:* An athlete who mentions "I prefer morning runs" three times across three conversations produces three semantically identical memories that consume three of their 25-memory slots. The 0.92 threshold is chosen to catch near-duplicate phrasings (similarity 0.92-0.99) while allowing genuinely related but distinct facts (similarity 0.80-0.91) to both be stored.

*Production tradeoff:* The 0.92 threshold can be tuned. Too high (0.98) → only exact duplicates caught, many near-duplicates stored. Too low (0.85) → genuinely distinct facts incorrectly deduplicated. The threshold should be validated against a labeled dataset of "same fact, different phrasing" pairs and "related but distinct facts" pairs.

---

### 5.2 Mock Data Reference Card

**Alex Chen's current state — consistent across all examples in this document:**

```
Athlete ID:     cmopb72l0000abc123xyz
Name:           Alex Chen
Goal Race:      SF Half Marathon, 2026-08-02, distance 21.1km, goal 1:55:00
Days to race:   68
Subscription:   PRO

Intelligence signals:
  CTL:    59.9 (Chronic Training Load — fitness)
  ATL:    38.2 (Acute Training Load — current fatigue)
  TSB:    +21.7 (Training Stress Balance — fresher than baseline)
  ACWR:   0.44 (Gabbett ratio — OPTIMAL range)
  Phase:  BUILD (HIGH confidence)
  Pred:   1:53:19 half marathon (1:41 ahead of 1:55:00 goal)

Daily quota:    23 messages today / 50 limit
```

**Supabase form (raw table rows):**

```
athletes:
  id: cmopb72l0000abc123xyz | name: Alex Chen | maxHeartRate: 185 | restingHeartRate: 52

activities (last 3):
  id: act_051 | startedAt: 2026-05-24 | type: EASY | distance: 8.2km | trainingLoad: 42.3
  id: act_052 | startedAt: 2026-05-22 | type: TEMPO | distance: 5.0km | trainingLoad: 61.1
  id: act_053 | startedAt: 2026-05-20 | type: LONG_RUN | distance: 17.5km | trainingLoad: 84.7

weekly_training_summaries (last 2):
  weekStartDate: 2026-05-18 | totalLoad: 187.2 | ctl: 61.2 | atl: 44.1 | tsb: 17.1 | acwr: 0.72
  weekStartDate: 2026-05-25 | totalLoad: 38.2  | ctl: 59.9 | atl: 38.2 | tsb: 21.7 | acwr: 0.44

coach_memories:
  id: mem_m01 | summary: "Athlete: left IT band syndrome, triggered above 60km/week" | importance: 0.95 | tier: 1 | accessCount: 14
  id: mem_m02 | summary: "Athlete: vegetarian, struggles with protein recovery" | importance: 0.70 | tier: 1 | accessCount: 5
  id: mem_m03 | summary: "Athlete: prefers evening runs after 6pm" | importance: 0.50 | tier: 1 | accessCount: 7

athlete_quotas:
  id: quota_abc | subscriptionTier: PRO | dailyMessageCount: 23 | lastMessageDate: 2026-05-26
  totalInputTokens: 482300 | totalOutputTokens: 89200
```

**Redis form (same data, fast layer):**

```
KEY: context:cmopb72l0000abc123xyz
TTL: 37 seconds remaining
VALUE: {
  "athlete": { "name": "Alex Chen", "maxHeartRate": 185 },
  "trainingLoad": { "ctl": 59.9, "atl": 38.2, "tsb": 21.7 },
  "injuryRisk": { "category": "OPTIMAL", "acwr": 0.44 },
  "phase": { "phase": "BUILD", "confidence": "HIGH", "daysUntilRace": 68 },
  "racePrediction": { "predictedTimeFormatted": "1:53:19", "gapToGoalFormatted": "1:41 ahead" },
  "weeklyBrief": { "keySignal": "CTL 59.9 declining — consistency matters this week" }
}

KEY: quota:daily:cmopb72l0000abc123xyz:20260526
VALUE: 23
TTL: 35,400 seconds (until midnight UTC)

KEY: ratelimit:ip:203.0.113.42:minute:1748908200
VALUE: 14
TTL: 48 seconds
```

**Contrast:**
- Supabase contains raw normalized data (individual table rows, exact values as stored).
- Redis contains derived, computed, denormalized data (the result of running all 6 engines and joining multiple tables).
- Supabase is permanent and consistent. Redis is temporary and may be stale (up to TTL).
- Any value in Redis can be rebuilt from Supabase by calling `buildAthleteIntelligenceContext`. The reverse is not true.

---

### 5.3 Questions the Interviewer Will Likely Ask About Production

**Q1: Why semantic retrieval instead of recency-based loading?**

The current system loads the 3 most recently created memories regardless of their relevance to the current coaching question. This produces systematically wrong results when the athlete's question doesn't match recent conversation topics. If Alex asks about knee pain today but the last 3 memory entries are about fueling, shoes, and race-day warmup (all created in the last week), the memory about documented knee history from 6 months ago never loads. The coach gives advice without knowing about the prior injury.

Semantic retrieval selects by meaning proximity — the embedding of "knee pain during long runs" is geometrically close to the embedding of the historical knee injury memory, regardless of when that memory was created. This is the correct model for how a good coach works: they recall the *relevant* information, not just the *recent* information.

---

**Q2: How do tiers and semantic search work together?**

Semantic search runs against the Tier 1 FACT candidate pool only. Tier 2 records (archived, >90 days) are excluded from the search query via `WHERE tier = 1`. The CONSOLIDATED memory record (which synthesizes all Tier 2 facts) is always loaded verbatim — it is not retrieved by semantic search, it is always included.

The result: the coach always has the synthesized long-term athlete profile (CONSOLIDATED), always has the most recent session bridge (CONVERSATION_SUMMARY memory), and dynamically loads the most relevant recent facts from Tier 1. Tier 2 records provide the audit trail for what went into the CONSOLIDATED record, but are never individually searched — the consolidation job's synthesis is the interface to old memories.

---

**Q3: Why is the Redis cache invalidated when a memory changes?**

The cached `AthleteIntelligenceContext` in Redis includes `coachMemories: CoachMemory[]` — an array of the athlete's recent memories fetched from Supabase during `buildAthleteIntelligenceContext`. If a memory's `summary` field is updated in Supabase but the Redis cache is not invalidated, the next 60 seconds of coaching requests will load the old memory text. Claude will give advice based on the stale memory content.

For a memory edit where the athlete corrected important information ("I was training for a marathon, not a half marathon"), this stale coaching would produce actively wrong coaching prescriptions. Invalidating the Redis cache on any memory change forces the next request to recompute from Supabase, guaranteeing the coaching context always reflects current memory state.

---

**Q4: What happens if Redis goes down?**

The system falls back to L3 (Supabase) for all cache misses. Context recomputation runs on every request: 6 DB queries + 5 intelligence engines = ~200-300ms added latency per request. The system is correct (Supabase is source of truth) but slow during the Redis outage.

For daily message quotas: Redis miss triggers Supabase read. The Supabase `dailyMessageCount` is the accurate count — Redis was just the fast path. No quota violations occur. Redis is repopulated from Supabase on the first miss after recovery.

For IP rate limiting: if Redis is down, the rate limit check throws, and the request proceeds (fail-open by default). This means rate limiting is temporarily disabled during a Redis outage. For a brief outage, this is acceptable; for a prolonged outage, a secondary rate limiting mechanism (e.g., Cloudflare rate limiting at the DNS level) is needed.

---

**Q5: Why store token counts instead of cost in USD?**

Storing `estimatedCostUSD` in the database creates a data corruption problem when pricing changes. A value of $0.0042 stored 6 months ago under the old pricing model represents different actual usage than $0.0042 stored today. You cannot compare historical cost data across pricing changes.

Storing token counts avoids this: `totalInputTokens: 482,300` is a stable fact about what happened. Cost is computed at query time from current pricing: `inputTokens / 1,000,000 × $3.00`. When Anthropic changes pricing, the computation formula changes — no data migration needed. The historical token counts remain accurate descriptions of usage.

Additionally, model-specific breakdowns (`sonnetInputTokens`, `haikuInputTokens`) enable accurate attribution when the system uses multiple models. Aggregating to one cost column would mix Sonnet's $3.00/MTok with Haiku's $0.25/MTok incorrectly.

---

**Q6: How does the importance scale prevent medical history from being evicted?**

Two mechanisms work together. First, the critical override: any memory with `importance >= 0.90` receives a flat +0.50 additive boost in the ranking function. This mathematically guarantees that even a memory with low semantic similarity (0.10) to the current question achieves a final score of at least 0.60 — above most non-critical memories in the typical 0.35-0.75 score range. The medical memory always loads.

Second, the tier system does not archive high-importance memories. Before a FACT memory advances to Tier 2 (>90 days), the consolidation job explicitly preserves `importance >= 0.90` facts in the CONSOLIDATED profile rather than summarizing them away. The consolidation prompt is told: "Do not condense or omit any medical history, injury history, or medical constraints."

Together: high-importance memories always load (via critical override) and are never lost (via protected consolidation).

---

**Q7: Why fire-and-forget for memory extraction?**

Memory extraction is a secondary Claude API call. At the time the extraction runs, the primary coaching response has already been streamed and received by the user. Awaiting extraction would add 800-2,000ms of invisible wait time after the streaming is visually complete — the user sees the response finished, but the browser is still waiting for the HTTP response body to close.

The worst case of fire-and-forget: extraction fails (API error, rate limit, Claude returns null). The coaching session worked. The athlete's message was a one-time context. No durable information was lost. The coach is slightly less personalized in the next session — acceptable.

The worst case of awaiting: extraction succeeds but takes 2 seconds. Every coaching turn is 2 seconds longer for the user, even for turns that don't produce extractable memories (the majority). The latency cost is paid on every turn; the benefit is realized on a minority of turns.

---

**Q8: Why IVFFlat instead of exact nearest-neighbor search?**

Exact nearest-neighbor search (full table scan, all vector comparisons) scales linearly with the number of stored vectors. At 10,000 memories across all athletes, exact search on each coaching turn runs 10,000 cosine distance comparisons per request. Under concurrent load (100 users simultaneously), that's 1,000,000 comparisons per second on the Supabase instance.

IVFFlat reduces this to approximately 150 comparisons per query (100 centroid comparisons + ~50 vectors in the top 5 clusters) — a 67× reduction at 10,000 vectors. The quality tradeoff is ~2-5% miss rate on true nearest neighbors, which is undetectable in practice for coaching memory retrieval.

Additionally, IVFFlat allows the similarity query to use the index rather than a sequential scan — the difference between a query taking 5ms (indexed) and 200ms (full scan) becomes apparent at scale.

---

**Q9: How does the conversation summary bridge the 50-message limit?**

Without summarization, the 50-message limit creates a hard coaching context boundary: when the user hits 50 messages and creates a new conversation, all context built in the previous conversation is accessible only through the 5 extracted memories (which may be at the extraction cap). The coaching relationship restarts with a thin context.

With summarization at message 45: the full 45-message coaching arc is distilled into a 200-word `ConversationSummary` record (stored separately with an embedding) and a 3-4 sentence `CoachMemory CONVERSATION_SUMMARY` record (stored in the memory system). When the user starts a new conversation, the CONVERSATION_SUMMARY memory is always loaded, providing immediate coaching continuity. The ConversationSummary record is retrievable when its topic is semantically relevant to the new session.

The bridge is not perfect — 200 words cannot capture everything from a 45-message conversation. But it captures the most important themes, decisions, and commitments made in the session. Combined with the extracted FACT memories and the CONSOLIDATED profile, the coaching relationship persists across conversation boundaries.

---

**Q10: Why Top-K and Top-P filtering together?**

Top-K provides a hard upper bound: never score more than 10 candidate memories, regardless of how many are above the similarity threshold. Without Top-K, a dense memory pool could produce 50+ candidates above the 0.35 threshold, requiring the ranking function to score 50 memories — expensive, and returns more than needed.

Top-P provides a quality floor: never include memories below 0.35 cosine similarity in the candidate pool, regardless of how few candidates exist. Without Top-P, the ranking function might receive 10 candidates where 8 are below 0.35 (weakly related by coincidental vocabulary) — the ranking function would score and potentially load genuinely irrelevant memories.

Together: the candidate pool is both bounded (Top-K ≤ 10) and qualified (Top-P: similarity ≥ 0.35 or importance ≥ 0.90). This ensures the ranking function operates on a small set of genuinely relevant candidates.

---

**Q11: What is the cost of the embedding system at scale?**

`text-embedding-ada-002` pricing: $0.0001 per 1,000 tokens. Memory summaries average 20-40 tokens each.

- Per memory stored: ~$0.000004 (4 millionths of a dollar)
- Per query embedding per coaching turn: ~$0.000004 (the user message embedding)
- At 50,000 coaching turns per day: $0.20/day for query embeddings
- At 1,000 new memories per day: $0.004/day for storage embeddings
- Redundancy check (one embedding, one pgvector query): already counted above
- **Total embedding system cost at 50,000 DAU:** ~$0.20/day = $73/year

For context: 50,000 coaching turns at $0.003 average per turn = $150/day for Claude. The embedding system is 0.13% of total AI cost. Essentially free. It enables a qualitatively better coaching experience at negligible marginal cost.

---

**Q12: How would you debug a high cache miss rate?**

Step 1: Query `ContextCacheMetadata` for athletes with high miss rates:
```sql
SELECT athleteId, cacheMissCount, cacheHitCount,
  cacheMissCount::float / NULLIF(cacheMissCount + cacheHitCount, 0) AS missRate,
  lastInvalidatedAt, invalidationReason
FROM context_cache_metadata
WHERE cacheMissCount + cacheHitCount > 10
ORDER BY missRate DESC;
```

Step 2: Check `invalidationReason`. If most misses follow `invalidationReason = 'new_activity'` → the Strava sync is more frequent than expected, constantly invalidating the cache. Solution: add debounce — don't invalidate on every activity, invalidate after a sync batch completes.

Step 3: Check Vercel function logs for `intelligence_context_cache_hit` vs `intelligence_context_cache_miss` events. If misses cluster at specific times → cold-start bursts (Vercel spinning up new instances). L2 Redis should absorb these — if Redis is missing too, check Redis TTL configuration.

Step 4: Check `avgComputeMs` in `ContextCacheMetadata`. If increasing over time → database queries getting slower as tables grow. Add index analysis: `EXPLAIN ANALYZE` on the `findMany` queries in `buildAthleteIntelligenceContext`.

---

**Q13: Why not store embeddings in Redis instead of Supabase?**

Embeddings are 1,536 floats each = approximately 6KB per vector as JSON. For 1,000 memories per athlete, that's 6MB of embedding data per athlete. Redis is an in-memory store — storing 6MB per athlete for 10,000 athletes = 60GB of RAM just for embeddings. Redis is designed for small, hot data (session tokens, counters, small cached objects). 60GB of embedding data would require a very expensive Redis instance.

More importantly, embeddings are durable data. They represent the semantic meaning of memories that should persist for years. Redis is ephemeral — a restart loses all data. Rebuilding 1,000 embeddings per athlete after a Redis restart would require 1,000 OpenAI API calls per affected athlete. Storing embeddings in Supabase (Postgres) keeps them in durable, ACID-compliant storage alongside the text they represent.

The correct architecture: embeddings stored in Supabase alongside the text. Redis used only for derived, recomputable data (intelligence context cache, quota counts, rate limits) where a Redis restart causes performance degradation but not data loss.

---

**Q14: What breaks first if you remove the tier system?**

The semantic search candidate pool expands to include all memories, regardless of age. After 2 years of coaching:

1. **Stale advice corrupts coaching quality.** Alex's memory from 18 months ago: "prefers morning runs." Alex updated to evening runs 3 months ago (Tier 1 FACT). Without tiers, both memories are in the search candidate pool. The "morning runs" memory may score higher on certain queries (creation date was earlier → access history was longer → higher `accessCount` factor). The coach gives morning-run advice to an evening runner.

2. **Search quality degrades.** With 300 memories all in the candidate pool, the semantic search returns more noise. The ranking function must differentiate between 50 similarly-scoring memories instead of 10. The top-K filter (10 candidates) is less discriminative when the candidate pool is 300 instead of 30.

3. **CONSOLIDATED memories lose their value.** The CONSOLIDATED record synthesizes what is known about the athlete into an organized profile. Without tiers, the individual facts that went into CONSOLIDATED are still searchable — the coach can receive both the synthesized CONSOLIDATED view and the raw individual facts (potentially contradictory if the synthesis updated something). Context becomes inconsistent.

---

**Q15: How does subscription tier interact with storage tier?**

These are orthogonal dimensions that intersect at one specific point: the consolidation threshold.

Subscription tier (billing) → determines how many Tier 1 FACT memories can accumulate before the consolidation job converts them to Tier 2 and synthesizes a new CONSOLIDATED record:
- Free: consolidate when Tier 1 FACT count reaches 10
- Pro: consolidate at 50
- Team: consolidate at 200

The practical effect: Pro users have a richer semantic search candidate pool (up to 50 individual Tier 1 FACTs) before synthesis. Free users get a more aggressively consolidated coaching model (synthesis happens more often, fewer granular facts available for individual retrieval). The coaching quality difference: Pro users receive more precisely relevant individual facts; Free users receive more summarized profile knowledge.

Storage tier (lifecycle) → operates the same regardless of subscription. All memories pass through Tier 1 → Tier 2 → CONSOLIDATED on the same 90-day schedule. The subscription tier determines when consolidation is *triggered*, not how the tier system *works* per se.

---

*End of Production Architecture Reference*

---
*Document stats: ~18,000 words, ~580 lines. No existing files were modified — only `docs/PRODUCTION_ARCHITECTURE.md` was created.*
