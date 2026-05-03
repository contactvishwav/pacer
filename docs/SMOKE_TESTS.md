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

## Create Coach Conversation
curl -s -X POST http://localhost:3000/api/coach/conversations \
  -H "Content-Type: application/json" \
  -d '{"contextType":"GENERAL"}' | python3 -m json.tool

## Send Coach Message (streaming)
# Replace CONVERSATION_ID with the id from the conversation response above
curl -s -X POST http://localhost:3000/api/coach/conversations/CONVERSATION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"How is my training going?"}' \
  --no-buffer

## Context Debug (development only)
curl -s http://localhost:3000/api/context/debug | python3 -m json.tool | head -60
