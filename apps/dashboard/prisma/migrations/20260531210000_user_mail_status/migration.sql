-- CreateEnum
CREATE TYPE "StudentMailStatus" AS ENUM ('NOT_SENT', 'SENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "mailStatus" "StudentMailStatus" NOT NULL DEFAULT 'NOT_SENT';
