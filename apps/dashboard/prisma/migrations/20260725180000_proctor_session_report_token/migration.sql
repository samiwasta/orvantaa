-- AlterTable
ALTER TABLE "quiz_proctor_sessions" ADD COLUMN IF NOT EXISTS "reportTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "quiz_proctor_sessions_reportTokenHash_key"
  ON "quiz_proctor_sessions"("reportTokenHash");
