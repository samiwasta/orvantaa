CREATE TYPE "AdminNotificationKind" AS ENUM (
  'TEAM_MEMBER_ADDED',
  'TEAM_MEMBER_REMOVED',
  'SUBSCRIPTION_PAYMENT_FAILED',
  'SUBSCRIPTION_PAYMENT_DUE',
  'SUBSCRIPTION_PAYMENT_LATE',
  'SCHOOL_SUBSCRIPTION_INACTIVE',
  'SCHOOL_SUBSCRIPTION_HOLD',
  'SCHOOL_SUBSCRIPTION_BLOCKED',
  'STUDENTS_UNASSIGNED',
  'MAINTENANCE_MODE',
  'SYSTEM'
);

CREATE TYPE "AdminNotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "admin_notifications" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "kind" "AdminNotificationKind" NOT NULL,
  "priority" "AdminNotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "href" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_notification_reads" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_notification_reads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_notifications_dedupeKey_key" ON "admin_notifications"("dedupeKey");
CREATE INDEX "admin_notifications_createdAt_idx" ON "admin_notifications"("createdAt" DESC);
CREATE UNIQUE INDEX "admin_notification_reads_notificationId_userId_key" ON "admin_notification_reads"("notificationId", "userId");
CREATE INDEX "admin_notification_reads_userId_idx" ON "admin_notification_reads"("userId");

ALTER TABLE "admin_notification_reads"
  ADD CONSTRAINT "admin_notification_reads_notificationId_fkey"
  FOREIGN KEY ("notificationId") REFERENCES "admin_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_notification_reads"
  ADD CONSTRAINT "admin_notification_reads_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
