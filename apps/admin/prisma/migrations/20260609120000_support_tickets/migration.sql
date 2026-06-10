CREATE TYPE "SupportTicketIssueArea" AS ENUM (
  'ACCOUNT_PROFILE',
  'LOGIN_PASSWORD',
  'SUBJECTS_LESSONS',
  'QUIZZES',
  'PERFORMANCE_REPORTS',
  'AI_TUTOR',
  'NOTIFICATIONS',
  'TECHNICAL',
  'OTHER'
);

CREATE TYPE "SupportTicketStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
);

CREATE TABLE "support_tickets" (
  "id" TEXT NOT NULL,
  "ticketNumber" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "issueArea" "SupportTicketIssueArea" NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
  "adminNote" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");
CREATE INDEX "support_tickets_userId_createdAt_idx" ON "support_tickets"("userId", "createdAt" DESC);
CREATE INDEX "support_tickets_status_createdAt_idx" ON "support_tickets"("status", "createdAt" DESC);

ALTER TABLE "support_tickets"
  ADD CONSTRAINT "support_tickets_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
