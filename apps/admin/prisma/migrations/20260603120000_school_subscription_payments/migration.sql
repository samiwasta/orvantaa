-- AlterTable
ALTER TABLE "schools" ADD COLUMN "billingEmail" TEXT;

-- CreateEnum
CREATE TYPE "SubscriptionPaymentStatus" AS ENUM ('DUE', 'SUCCESS', 'FAILED', 'LATE', 'PENDING');

-- CreateTable
CREATE TABLE "school_subscription_payments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "serviceName" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "amountPaise" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "SubscriptionPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_subscription_payments_transactionId_key" ON "school_subscription_payments"("transactionId");

-- CreateIndex
CREATE INDEX "school_subscription_payments_schoolId_idx" ON "school_subscription_payments"("schoolId");

-- CreateIndex
CREATE INDEX "school_subscription_payments_transactionDate_idx" ON "school_subscription_payments"("transactionDate");

-- AddForeignKey
ALTER TABLE "school_subscription_payments" ADD CONSTRAINT "school_subscription_payments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
