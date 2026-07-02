-- CreateTable
CREATE TABLE "platform_classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_classes_name_key" ON "platform_classes"("name");

-- Backfill platform catalog from existing school classes
INSERT INTO "platform_classes" ("id", "name", "createdAt", "updatedAt")
SELECT
    'pc_' || substr(md5(lower(trim("name"))), 1, 24),
    MIN("name"),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "classes"
GROUP BY lower(trim("name"));

-- New schools start inactive until payment succeeds
ALTER TABLE "schools" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'INACTIVE';
