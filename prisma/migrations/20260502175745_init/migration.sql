-- CreateEnum
CREATE TYPE "ActivitySource" AS ENUM ('GENERATED', 'STRAVA', 'MANUAL');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('EASY', 'RECOVERY', 'STEADY_STATE', 'TEMPO', 'THRESHOLD', 'INTERVAL', 'LONG_RUN', 'RACE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TrainingPhase" AS ENUM ('BASE', 'BUILD', 'PEAK', 'TAPER', 'RECOVERY', 'UNSTRUCTURED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationContext" AS ENUM ('DASHBOARD', 'ACTIVITY', 'RACE_GOAL', 'WEEKLY_BRIEF', 'GENERAL');

-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('KM', 'MILES');

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "restingHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "preferredUnit" "DistanceUnit" NOT NULL DEFAULT 'KM',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_races" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "raceName" TEXT NOT NULL,
    "raceDate" TIMESTAMP(3) NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "goalTimeSeconds" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "source" "ActivitySource" NOT NULL DEFAULT 'GENERATED',
    "stravaActivityId" BIGINT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "movingTimeSeconds" INTEGER NOT NULL,
    "elevationGainMeters" DOUBLE PRECISION,
    "avgPaceSecPerKm" INTEGER NOT NULL,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "avgCadence" INTEGER,
    "calories" INTEGER,
    "trainingLoad" DOUBLE PRECISION NOT NULL,
    "workoutType" "WorkoutType" NOT NULL DEFAULT 'UNKNOWN',
    "workoutTypeConfidence" DOUBLE PRECISION,
    "workoutTypeExplanation" TEXT,
    "executionEvaluation" TEXT,
    "intendedWorkoutType" "WorkoutType",
    "trainingPhase" "TrainingPhase",
    "trainingWeek" INTEGER,
    "hasGps" BOOLEAN NOT NULL DEFAULT false,
    "tcxPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_laps" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "lapNumber" INTEGER NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "avgPaceSecPerKm" INTEGER NOT NULL,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "avgCadence" INTEGER,
    "isRest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_laps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_training_summaries" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "totalDistanceMeters" DOUBLE PRECISION NOT NULL,
    "totalDurationSeconds" INTEGER NOT NULL,
    "totalMovingTimeSeconds" INTEGER NOT NULL,
    "activityCount" INTEGER NOT NULL,
    "totalLoad" DOUBLE PRECISION NOT NULL,
    "avgHeartRate" INTEGER,
    "longRunDistanceMeters" DOUBLE PRECISION,
    "qualitySessionCount" INTEGER NOT NULL DEFAULT 0,
    "ctl" DOUBLE PRECISION NOT NULL,
    "atl" DOUBLE PRECISION NOT NULL,
    "tsb" DOUBLE PRECISION NOT NULL,
    "acwr" DOUBLE PRECISION NOT NULL,
    "trainingPhase" "TrainingPhase" NOT NULL,
    "phaseRationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_training_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_coaching_briefs" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "goalRaceId" TEXT,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "trainingPhase" "TrainingPhase" NOT NULL,
    "acwr" DOUBLE PRECISION NOT NULL,
    "projectedTimeSeconds" INTEGER,
    "gapToGoalSeconds" INTEGER,
    "phaseNote" TEXT NOT NULL,
    "keyWorkoutNote" TEXT NOT NULL,
    "riskNote" TEXT NOT NULL,
    "priorityNote" TEXT NOT NULL,
    "trajectoryNote" TEXT NOT NULL,
    "aiRewrite" TEXT,
    "isAiRewritten" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_coaching_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_conversations" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "contextType" "ConversationContext" NOT NULL DEFAULT 'GENERAL',
    "activityId" TEXT,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_memories" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "conversationId" TEXT,
    "summary" TEXT NOT NULL,
    "turnRangeStart" INTEGER NOT NULL,
    "turnRangeEnd" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_dataset_metadata" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "raceName" TEXT NOT NULL,
    "raceDate" TIMESTAMP(3) NOT NULL,
    "targetTimeSeconds" INTEGER NOT NULL,
    "weekCount" INTEGER NOT NULL,
    "activityCount" INTEGER NOT NULL,
    "seedHash" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "generated_dataset_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_connections" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "stravaAthleteId" BIGINT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncActivityId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strava_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "athletes_email_key" ON "athletes"("email");

-- CreateIndex
CREATE INDEX "goal_races_athleteId_isActive_idx" ON "goal_races"("athleteId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "activities_stravaActivityId_key" ON "activities"("stravaActivityId");

-- CreateIndex
CREATE INDEX "activities_athleteId_startedAt_idx" ON "activities"("athleteId", "startedAt");

-- CreateIndex
CREATE INDEX "activities_athleteId_workoutType_idx" ON "activities"("athleteId", "workoutType");

-- CreateIndex
CREATE INDEX "activities_athleteId_trainingPhase_idx" ON "activities"("athleteId", "trainingPhase");

-- CreateIndex
CREATE INDEX "activity_laps_activityId_lapNumber_idx" ON "activity_laps"("activityId", "lapNumber");

-- CreateIndex
CREATE INDEX "weekly_training_summaries_athleteId_weekNumber_idx" ON "weekly_training_summaries"("athleteId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_training_summaries_athleteId_weekStartDate_key" ON "weekly_training_summaries"("athleteId", "weekStartDate");

-- CreateIndex
CREATE INDEX "weekly_coaching_briefs_athleteId_weekNumber_idx" ON "weekly_coaching_briefs"("athleteId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_coaching_briefs_athleteId_weekStartDate_key" ON "weekly_coaching_briefs"("athleteId", "weekStartDate");

-- CreateIndex
CREATE INDEX "coach_conversations_athleteId_contextType_idx" ON "coach_conversations"("athleteId", "contextType");

-- CreateIndex
CREATE INDEX "coach_conversations_athleteId_isActive_idx" ON "coach_conversations"("athleteId", "isActive");

-- CreateIndex
CREATE INDEX "coach_messages_conversationId_createdAt_idx" ON "coach_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "coach_memories_athleteId_idx" ON "coach_memories"("athleteId");

-- CreateIndex
CREATE INDEX "coach_memories_conversationId_idx" ON "coach_memories"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_dataset_metadata_athleteId_seedHash_key" ON "generated_dataset_metadata"("athleteId", "seedHash");

-- CreateIndex
CREATE UNIQUE INDEX "strava_connections_athleteId_key" ON "strava_connections"("athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "strava_connections_stravaAthleteId_key" ON "strava_connections"("stravaAthleteId");

-- AddForeignKey
ALTER TABLE "goal_races" ADD CONSTRAINT "goal_races_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_laps" ADD CONSTRAINT "activity_laps_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_training_summaries" ADD CONSTRAINT "weekly_training_summaries_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_coaching_briefs" ADD CONSTRAINT "weekly_coaching_briefs_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_coaching_briefs" ADD CONSTRAINT "weekly_coaching_briefs_goalRaceId_fkey" FOREIGN KEY ("goalRaceId") REFERENCES "goal_races"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_conversations" ADD CONSTRAINT "coach_conversations_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "coach_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_memories" ADD CONSTRAINT "coach_memories_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_dataset_metadata" ADD CONSTRAINT "generated_dataset_metadata_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strava_connections" ADD CONSTRAINT "strava_connections_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
