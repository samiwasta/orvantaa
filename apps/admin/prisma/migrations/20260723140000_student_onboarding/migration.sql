-- AlterTable
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "state" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingSchoolId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingBoardId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingCity" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingState" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingStandard" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardingSection" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "schools_name_idx" ON "schools"("name");
CREATE INDEX IF NOT EXISTS "users_onboardingSchoolId_idx" ON "users"("onboardingSchoolId");
CREATE INDEX IF NOT EXISTS "users_onboardingBoardId_idx" ON "users"("onboardingBoardId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_onboardingSchoolId_fkey'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_onboardingSchoolId_fkey"
      FOREIGN KEY ("onboardingSchoolId") REFERENCES "schools"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_onboardingBoardId_fkey'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_onboardingBoardId_fkey"
      FOREIGN KEY ("onboardingBoardId") REFERENCES "boards"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
