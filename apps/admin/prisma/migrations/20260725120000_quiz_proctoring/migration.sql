-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProctorSessionStatus') THEN
    CREATE TYPE "ProctorSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TERMINATED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProctorViolationKind') THEN
    CREATE TYPE "ProctorViolationKind" AS ENUM (
      'TAB_HIDDEN',
      'WINDOW_BLUR',
      'FULLSCREEN_EXIT',
      'PAGE_RELOAD',
      'COPY_ATTEMPT',
      'PASTE_ATTEMPT',
      'CONTEXT_MENU',
      'DEVTOOLS_SHORTCUT',
      'PRINT_ATTEMPT',
      'SCREEN_CAPTURE_SHORTCUT'
    );
  END IF;
END $$;

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "answeredCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "proctorWarnings" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "terminatedByProctor" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "quiz_proctor_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "status" "ProctorSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "warningLimit" INTEGER NOT NULL DEFAULT 3,
    "attemptId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_proctor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "quiz_proctor_violations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kind" "ProctorViolationKind" NOT NULL,
    "warningNumber" INTEGER,
    "questionIndex" INTEGER,
    "detail" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_proctor_violations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "quiz_proctor_sessions_attemptId_key" ON "quiz_proctor_sessions"("attemptId");
CREATE INDEX IF NOT EXISTS "quiz_proctor_sessions_userId_quizId_status_idx" ON "quiz_proctor_sessions"("userId", "quizId", "status");
CREATE INDEX IF NOT EXISTS "quiz_proctor_sessions_quizId_status_idx" ON "quiz_proctor_sessions"("quizId", "status");
CREATE INDEX IF NOT EXISTS "quiz_proctor_violations_sessionId_occurredAt_idx" ON "quiz_proctor_violations"("sessionId", "occurredAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quiz_proctor_sessions_userId_fkey'
  ) THEN
    ALTER TABLE "quiz_proctor_sessions"
      ADD CONSTRAINT "quiz_proctor_sessions_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quiz_proctor_sessions_quizId_fkey'
  ) THEN
    ALTER TABLE "quiz_proctor_sessions"
      ADD CONSTRAINT "quiz_proctor_sessions_quizId_fkey"
      FOREIGN KEY ("quizId") REFERENCES "quizzes"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quiz_proctor_sessions_attemptId_fkey'
  ) THEN
    ALTER TABLE "quiz_proctor_sessions"
      ADD CONSTRAINT "quiz_proctor_sessions_attemptId_fkey"
      FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quiz_proctor_violations_sessionId_fkey'
  ) THEN
    ALTER TABLE "quiz_proctor_violations"
      ADD CONSTRAINT "quiz_proctor_violations_sessionId_fkey"
      FOREIGN KEY ("sessionId") REFERENCES "quiz_proctor_sessions"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
