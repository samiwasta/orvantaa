-- CreateEnum
CREATE TYPE "SchoolSubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'HOLD', 'BLOCKED');

-- AlterTable
ALTER TABLE "schools" ADD COLUMN "subscriptionStatus" "SchoolSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
