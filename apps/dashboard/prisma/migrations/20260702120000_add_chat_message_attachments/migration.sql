-- AlterTable
ALTER TABLE "ai_tutor_chat_messages" ADD COLUMN IF NOT EXISTS "attachments" JSONB;
