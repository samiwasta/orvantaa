-- CreateEnum
CREATE TYPE "AiTutorMessageFeedback" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "ai_tutor_chat_messages" ADD COLUMN "feedback" "AiTutorMessageFeedback";

-- CreateIndex
CREATE INDEX "ai_tutor_chat_messages_feedback_idx" ON "ai_tutor_chat_messages"("feedback");
