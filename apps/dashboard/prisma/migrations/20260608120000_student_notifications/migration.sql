CREATE TYPE "StudentNotificationKind" AS ENUM (
  'QUIZ_COMPLETED',
  'LESSON_COMPLETED',
  'PASSWORD_CHANGE_REQUIRED',
  'MAINTENANCE_MODE',
  'SYSTEM'
);

CREATE TYPE "StudentNotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "student_notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "kind" "StudentNotificationKind" NOT NULL,
  "priority" "StudentNotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "href" TEXT,
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "student_notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_notifications_userId_dedupeKey_key" ON "student_notifications"("userId", "dedupeKey");
CREATE INDEX "student_notifications_userId_createdAt_idx" ON "student_notifications"("userId", "createdAt" DESC);
CREATE INDEX "student_notifications_userId_readAt_idx" ON "student_notifications"("userId", "readAt");

ALTER TABLE "student_notifications"
  ADD CONSTRAINT "student_notifications_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
