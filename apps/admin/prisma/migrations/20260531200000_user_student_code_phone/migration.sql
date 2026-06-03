-- AlterTable
ALTER TABLE "users" ADD COLUMN "studentCode" TEXT,
ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_studentCode_key" ON "users"("studentCode");
