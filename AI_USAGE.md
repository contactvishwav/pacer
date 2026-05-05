# AI Usage

## Tools Used

| Tool | Purpose |
|---|---|
| Claude Code | Backend architecture, Prisma schema, population system, all six intelligence engines, API routes, validation scripts, deployment docs |
| Cursor (claude-sonnet-4-6) | All frontend pages, component library, streaming coach chat UI, polish passes, pagination |
| Claude.ai (this session) | Product planning, architecture decisions, prompt engineering, critical review, spec writing |

---

## What Each Tool Did

### Claude Code

Claude Code wrote the backend in its entirety: Prisma schema design, the training load engine (Banister PMC formulas), ACWR injury-risk engine (Gabbett ratio), workout type classifier, periodization phase detector, race prediction engine (Riegel formula), weekly brief generator, the unified intelligence context object, all API routes, and the full validation suite (9 scripts). It also wrote the coaching streaming route, the deterministic fallback, and the Claude-powered memory extraction function.

Claude Code committed after each coherent section following the commit discipline in `docs/WORKFLOW.md`.

### Cursor

Cursor built all six frontend pages (dashboard, activities, activity detail, coach chat, race goal, weekly brief) and the shared component library (Nav, Loading, Empty, Error, cards). The streaming coach chat UI — consuming SSE token-by-token, detecting the `__FALLBACK__` sentinel, rendering the streaming cursor — was built entirely in Cursor. Polish passes for text contrast, spacing, and mobile responsiveness were also Cursor.

### Claude.ai

The product thesis, architectural decisions, prompt sequence design, and critical review of outputs happened in this Claude.ai session before any code was written. The coaching context object structure, the two-layer architecture decision (deterministic engine layer + Claude conversational layer), the Gabbett vs PMC ACWR choice, the Prisma v6 pinning rationale, and the decision to use TCX over FIT were all worked out in planning before Claude Code was invoked.

---

## Human Decisions — What AI Could Not Make

These decisions required product judgment, domain knowledge, or explicit override of what the AI tools produced or assumed.

**Finished vertical slice instead of broad prototype**

The six dimensions were chosen before any code was written. Every prompt constrained Claude Code to implement only what was designed, not to expand scope. When Claude Code attempted to add features outside the spec, it was redirected.

**Two-layer architecture: deterministic engine + Claude**

The decision to build a full sports science computation layer (Banister PMC, Gabbett, Riegel) that feeds the Claude coaching layer was a deliberate product choice. The alternative — dumping activity data into a prompt and letting Claude compute everything — would produce generic responses. The computation layer is what makes Claude's coaching specific to this athlete's data. No AI tool suggested this architecture; it was designed upfront.

**Gabbett ACWR over PMC ATL/CTL for spike detection**

The training load engine uses Banister PMC (exponential moving averages) for the fitness/fatigue chart. The injury-risk engine uses the Gabbett ratio (acute week load ÷ 4-week average) for spike detection. These are different tools that answer different questions. ATL/CTL stays persistently elevated during a build phase, making it a poor spike detector. Gabbett isolated week 8's 1.337 anomaly precisely because the chronic denominator is stable. Claude Code knew both formulas. The decision about which to use for which purpose required understanding what each measures.

**TCX over FIT for generated activity files**

FIT is binary and requires an encoder library. TCX is XML and can be generated with string interpolation. For a time-boxed sprint where the generated files need to be human-readable and debuggable, TCX was the right choice. The `AGENT_GUIDELINES.md` TCX policy was set before Prompt 5 to prevent Claude Code from defaulting to FIT.

**Prisma v6 intentional pin**

Prisma v7 introduced four simultaneous breaking changes: datasource configuration moved from `schema.prisma` to `prisma.config.ts`, driver adapters became required for all databases, generated client import paths changed, and automatic generate/seed behavior was removed. For a time-boxed submission, pinning v6 was controlled dependency management. Claude Code's default would have installed latest. The pin was explicit in every prompt via `AGENT_GUIDELINES.md`.

**Coaching context object design**

The `CoachContext` structure — what fields it contains, how they are grouped, the 2,000-token budget, which signals to include and exclude, how conversation history is bounded — was designed manually. Claude Code implemented the function; the specification of what goes in the context object required understanding what information a coach actually needs to produce specific rather than generic responses.

**Cautious injury-risk language**

Every prompt that touched ACWR explicitly specified: "use cautious language — risk signal, training-load spike, caution range. Do not make medical claims." This constraint was in `AGENT_GUIDELINES.md` and repeated in individual prompts for the ACWR engine, coach API, and frontend components. The boundary was human-set.

**Transparent heuristics instead of fake ML**

The workout classifier, phase detector, and race prediction engine all use rule-based or formula-based computation with documented formulas in code comments. There is no statistical model, no training data, no accuracy claim beyond what the rule system produces. This was explicit in every relevant prompt: "use transparent rule-based classification, not ML."

**Optional Strava instead of required dependency**

The product works from seeded generated data. Strava was intentionally kept optional. This decision was made before writing Prompt 0 and enforced through `AGENT_GUIDELINES.md`. When Claude Code began building Strava-adjacent infrastructure before the core product was verified, it was stopped and redirected.

**Scope boundary at six dimensions**

Matched activity comparison (physiological drift analysis — D7) was scoped, designed, and then explicitly cut when timeline analysis showed it was a stretch goal. The decision to cut it cleanly rather than ship a partial implementation was a scope judgment made by a human, not by the AI tools.

---

## Corrections Made to AI Outputs

These are cases where AI-generated code or analysis was wrong and was corrected before being committed.

**INTERVAL classifier 3-lap minimum**

The workout classifier initially fired the INTERVAL rule on 2-lap sessions (warmup + main effort). A tempo run with a warmup lap generated enough HR and pace variance to trigger INTERVAL classification. Added a minimum 3-lap requirement after observing the misclassification in the `validate:classifier` output. Claude Code generated the classifier; the 3-lap rule came from understanding what an interval session actually is structurally.

*Commits: `976d96d feat(cp-08): rule-based workout type classifier with execution evaluation`, `1243324 fix(cp-15): backend review — all 12 checks pass, build clean`*

**12 schema-to-engine type mismatches**

A dedicated review prompt after the intelligence engines were built found 12 type mismatches between the Zod schemas and the engine outputs: `InjuryRiskCategory` had 4 schema values vs 5 engine values, confidence was `z.number()` in schema vs `'high'|'medium'|'low'` in engine, `acwr` was non-nullable in schema vs `number|null` in engine, and others. Claude Code generated the schemas and the engines in separate prompts without checking alignment. The review prompt found all 12 and fixed them.

*Commit: `c140669 fix: align schemas with engine types and patch three logic bugs`*

**Memory extraction prompt — missing colon**

The original `maybeExtractMemory` prompt included an example: "Athlete prefers morning runs..." — without a colon. Claude followed the example format rather than the instruction text and produced outputs like "Athlete prefers morning runs" (no colon). The `startsWith` check for `'Athlete: '` failed silently, no memories were written. The fix was to include explicit valid and invalid examples in the prompt and tighten the `startsWith` check to `'Athlete: '` with a space.

*Commit: `2df5400 fix(coach): correct memory extraction prompt and isolate count query`*

**Text matching replaced with Claude extraction for memory**

The first proposed implementation used a `MEMORY_TRIGGERS` array of phrases to detect when to write a memory. This was rejected because text matching is fragile — "I tore my calf" would not trigger "injured", "my knee has been an issue for years" would not trigger "my knee". Replaced with a secondary Claude call that reads the conversation turn and makes the determination. The architectural decision to let Claude detect its own durable context was a human call.

*Commit: `2bcb26a docs(approach): clarify classifier accuracy; feat(coach): Claude-powered memory extraction`*

**Anthropic.AuthenticationError for 401 detection**

An earlier implementation detected invalid API keys using heuristics: checking if the key was a specific string ("sk-invalid") or below a length threshold. This is not robust — key formats can change, length thresholds are arbitrary. Replaced with `instanceof Anthropic.AuthenticationError`, which is SDK-native and type-safe.

*Commit: `ed52ef3 fix(coach): surface __FALLBACK__ sentinel on Anthropic 401 auth errors`*

**Prisma v7 breaking changes caught before installation**

The initial stack recommendation assumed the latest Prisma version. Cross-checking confirmed that Prisma v7 had introduced breaking changes to datasource configuration, driver adapters, client imports, and seed behavior simultaneously. This was caught before any code was written and Prisma v6 was explicitly pinned in `AGENT_GUIDELINES.md`.

*Commit: `18ed4a6 Add Pacer agent guidelines` (constraint codified before any schema code was written)*

**Strava rate limit — non-upload limit missed**

The initial API verification cited 200 requests per 15 minutes. It was identified that Strava also has a stricter non-upload limit of 100 requests per 15 minutes that governs all read operations including activity and stream fetches. The architecture notes in `APPROACH.md` reflect the correct 100 request limit, and the import pipeline design accounts for the stricter threshold.

*Caught in planning phase; documented in APPROACH.md §What Breaks First Under Pressure*

**Prisma DATABASE_URL / DIRECT_URL labels reversed**

An early spec had the labels swapped: `DATABASE_URL` was described as the direct connection and `DIRECT_URL` as the pooled connection. The reversal was identified and corrected. The correct configuration is `DATABASE_URL` for the transaction-mode pooler (port 6543, `?pgbouncer=true`) and `DIRECT_URL` for the direct connection used by Prisma CLI migrations (port 5432).

*Caught in planning phase; correct labels are in `README.md` and `.env.example`*

**Load-more replaced with server-side pagination**

The initial activities list implementation used a "load more" button that fetched all 54 activities at once on click. This is not production-grade. Replaced with proper server-side pagination: `page`/`limit`/`totalPages`/`hasNextPage`/`hasPrevPage` in the API response, URL state via `useSearchParams` so pages are shareable and the back button works, and Previous/Next controls in the UI.

*Commit: `e328a4a feat(activities): server-side pagination with URL state and prev/next controls`*

---

## What I Personally Designed

These artifacts required product thinking and could not be delegated to any AI tool.

**Product thesis**

Strava built a describer. A coach interprets. The gap between those two is the product. This framing determined the scope, the six dimensions, and the `APPROACH.md` narrative.

**The coaching context object**

The `CoachContext` structure — athlete profile, fitness metrics (CTL/ATL/TSB/ACWR/phase), selected activity signals, bounded conversation history (8 turns), memory summary — was designed to give Claude exactly what a human coach would need to know: where the athlete is in their training arc, what the current risk signals are, what their race goal is, and what they said before. The 2,000-token budget was a deliberate constraint to keep the system efficient at scale.

**The system prompt for coaching**

The coaching system prompt — what makes Pacer a precise endurance coach rather than a generic chatbot — was written by hand. The constraints ("never say you will finish in X time", "never provide medical diagnosis", "always connect analysis to the goal race") reflect product judgment about what a coaching product should and should not do.

**The two-layer architecture decision**

The separation of deterministic computation (layer 1) and Claude conversational coaching (layer 2) was designed upfront. Layer 1 makes layer 2 specific. Layer 2 makes layer 1 accessible. This architecture is what distinguishes Pacer from a chatbot with activity data attached.

**Feature prioritization and scope cuts**

The decision to build six specific dimensions, cut D7 (matched activity comparison), keep Strava optional, and not build mobile or multi-user features was made before any code was written and enforced throughout through `AGENT_GUIDELINES.md`.

**The demo flow**

The sequence — dashboard → activities → March 8 zone-mismatch run → race goal → weekly brief → coach chat — was designed to tell a coherent product story in under 5 minutes. Each step is chosen because it demonstrates something the previous step set up.
