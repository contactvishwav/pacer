-- DropForeignKey
ALTER TABLE "coach_messages" DROP CONSTRAINT "coach_messages_conversationId_fkey";

-- AlterTable
ALTER TABLE "coach_messages" ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "conversationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "coach_sessions" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_sessions_athleteId_updatedAt_idx" ON "coach_sessions"("athleteId", "updatedAt");

-- CreateIndex
CREATE INDEX "coach_messages_sessionId_createdAt_idx" ON "coach_messages"("sessionId", "createdAt");

-- DataMigration: create one "Legacy" session per athlete that has existing conversations,
-- then assign all existing coach_messages to their athlete's legacy session.
-- Uses a deterministic ID ('legacy_' || athleteId) so re-running is idempotent.

INSERT INTO "coach_sessions" ("id", "athleteId", "name", "createdAt", "updatedAt")
SELECT
    'legacy_' || a."id",
    a."id",
    'Legacy',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "athletes" a
WHERE EXISTS (
    SELECT 1 FROM "coach_conversations" cc WHERE cc."athleteId" = a."id"
)
ON CONFLICT DO NOTHING;

UPDATE "coach_messages" cm
SET "sessionId" = 'legacy_' || cc."athleteId"
FROM "coach_conversations" cc
WHERE cm."conversationId" = cc."id"
  AND cm."sessionId" IS NULL;

-- AddForeignKey
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "coach_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "coach_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_sessions" ADD CONSTRAINT "coach_sessions_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
