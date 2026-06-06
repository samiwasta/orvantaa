-- Rename platform settings column to reflect per-student principal amount
ALTER TABLE "platform_settings"
RENAME COLUMN "subscriptionMonthlyAmountPaise" TO "subscriptionPrincipalAmountPaise";

-- Store billing breakdown on each school subscription
ALTER TABLE "school_recurring_subscriptions"
ADD COLUMN "studentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "principalAmountPaise" INTEGER NOT NULL DEFAULT 0;
