-- CreateEnum
CREATE TYPE "RecurringSubscriptionStatus" AS ENUM ('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PENDING', 'HALTED', 'CANCELLED', 'COMPLETED', 'EXPIRED');

-- AlterTable
ALTER TABLE "platform_settings"
ADD COLUMN "subscriptionMonthlyAmountPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "subscriptionPlanName" TEXT NOT NULL DEFAULT 'Orvantaa Platform Subscription',
ADD COLUMN "razorpayPlanId" TEXT,
ADD COLUMN "subscriptionBillingCycles" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN "autoStartSchoolSubscriptions" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "school_recurring_subscriptions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "razorpaySubscriptionId" TEXT NOT NULL,
    "razorpayPlanId" TEXT NOT NULL,
    "razorpayCustomerId" TEXT NOT NULL,
    "status" "RecurringSubscriptionStatus" NOT NULL DEFAULT 'CREATED',
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "planName" TEXT NOT NULL,
    "authUrl" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "nextChargeAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_recurring_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_recurring_subscriptions_schoolId_key" ON "school_recurring_subscriptions"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_recurring_subscriptions_razorpaySubscriptionId_key" ON "school_recurring_subscriptions"("razorpaySubscriptionId");

-- CreateIndex
CREATE INDEX "school_recurring_subscriptions_status_idx" ON "school_recurring_subscriptions"("status");

-- AddForeignKey
ALTER TABLE "school_recurring_subscriptions" ADD CONSTRAINT "school_recurring_subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
