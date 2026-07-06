-- CreateEnum
CREATE TYPE "StudentGoalType" AS ENUM ('COMPLETE_CHAPTERS', 'REVISE_CHAPTER', 'PASS_QUIZ', 'IMPROVE_WEAK_AREA', 'MAINTAIN_STREAK');

-- CreateEnum
CREATE TYPE "StudentGoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "StudentGoalSource" AS ENUM ('AI', 'SYSTEM');

-- CreateTable
CREATE TABLE "student_exam_targets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_exam_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "StudentGoalType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rationale" TEXT,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "progressCount" INTEGER NOT NULL DEFAULT 0,
    "status" "StudentGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "href" TEXT,
    "metadata" JSONB,
    "source" "StudentGoalSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "student_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_exam_targets_userId_key" ON "student_exam_targets"("userId");

-- CreateIndex
CREATE INDEX "student_goals_userId_status_periodEnd_idx" ON "student_goals"("userId", "status", "periodEnd");

-- CreateIndex
CREATE INDEX "student_goals_userId_status_priority_idx" ON "student_goals"("userId", "status", "priority");

-- AddForeignKey
ALTER TABLE "student_exam_targets" ADD CONSTRAINT "student_exam_targets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_goals" ADD CONSTRAINT "student_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
