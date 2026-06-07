-- CreateEnum
CREATE TYPE "AiTutorMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "ai_tutor_chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tutor_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tutor_chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "AiTutorMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tutor_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_tutor_chat_sessions_userId_updatedAt_idx" ON "ai_tutor_chat_sessions"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "ai_tutor_chat_messages_sessionId_createdAt_idx" ON "ai_tutor_chat_messages"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_tutor_chat_sessions" ADD CONSTRAINT "ai_tutor_chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tutor_chat_messages" ADD CONSTRAINT "ai_tutor_chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_tutor_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
