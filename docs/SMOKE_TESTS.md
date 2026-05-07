# Pacer API Smoke Tests
Run these after seeding the database (npx prisma db seed) and starting the dev server (npm run dev).

## Dashboard
curl -s http://localhost:3000/api/dashboard | python3 -m json.tool | head -50

## Activities
curl -s "http://localhost:3000/api/activities?limit=5" | python3 -m json.tool | head -30

## Activity Intelligence
# Replace ACTIVITY_ID with an id from the activities response above
curl -s http://localhost:3000/api/activities/ACTIVITY_ID/intelligence | python3 -m json.tool

## Weekly Brief
curl -s http://localhost:3000/api/weekly-brief | python3 -m json.tool | head -40

## Race Prediction
curl -s http://localhost:3000/api/race-prediction | python3 -m json.tool | head -40

## Coach Sessions

### List sessions
curl -s http://localhost:3000/api/coach/sessions | python3 -m json.tool

### Create a new session
curl -s -X POST http://localhost:3000/api/coach/sessions | python3 -m json.tool
# Note the "id" field in the response — use it as SESSION_ID below

### Get messages for a session
# Replace SESSION_ID with the id from the create response above
curl -s http://localhost:3000/api/coach/sessions/SESSION_ID/messages | python3 -m json.tool

### Send a message to a session (streaming)
curl -s -X POST http://localhost:3000/api/coach/sessions/SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"How is my training going?"}' \
  --no-buffer

### Rename a session
curl -s -X PATCH http://localhost:3000/api/coach/sessions/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Race-week planning"}' | python3 -m json.tool

### Delete a session
curl -s -X DELETE http://localhost:3000/api/coach/sessions/SESSION_ID -v
# Expect HTTP 204 No Content

## Create Coach Conversation (legacy — backward-compat)
curl -s -X POST http://localhost:3000/api/coach/conversations \
  -H "Content-Type: application/json" \
  -d '{"contextType":"GENERAL"}' | python3 -m json.tool

## Send Coach Message via legacy conversations route (streaming)
# Replace CONVERSATION_ID with the id from the conversation response above
curl -s -X POST http://localhost:3000/api/coach/conversations/CONVERSATION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"How is my training going?"}' \
  --no-buffer

## Context Debug (development only)
curl -s http://localhost:3000/api/context/debug | python3 -m json.tool | head -60

## Regression Tests (requires ANTHROPIC_API_KEY and running DB)
npm run validate:regression

These tests make live Claude API calls. Run before every significant prompt or context structure change.

Individual tests can also be run standalone:
- `npm run validate:context-drift`       — determinism + value-range checks (no Claude calls)
- `npm run validate:coaching`            — grounding check: Claude references actual computed signals
- `npm run validate:prompt-constraints`  — safety check: adversarial inputs do not produce prohibited health claims
- `npm run validate:safety`              — health-advice boundary classifier unit test

## Regression Test Suite

These tests require ANTHROPIC_API_KEY and a running database.

Run the full regression suite:
```
npm run validate:regression
```

Individual tests:
```
npm run validate:context-drift      # No Claude calls, fast
npm run validate:coaching           # Verifies grounding in computed signals
npm run validate:prompt-constraints # Adversarial inputs vs safety boundary
npm run validate:safety             # Safety classifier unit tests
```

Run regression tests before:
- Any change to `src/lib/coach/system-prompt.ts`
- Any change to `buildCoachContext()` or context structure
- Changing `ANTHROPIC_MODEL` env var
- Any production deployment
