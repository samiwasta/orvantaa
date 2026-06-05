-- CreateEnum
CREATE TYPE "QuizTimedMode" AS ENUM ('UNTIMED', 'PER_QUESTION', 'WHOLE_QUIZ');

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN "timedMode" "QuizTimedMode" NOT NULL DEFAULT 'UNTIMED';
ALTER TABLE "quizzes" ADD COLUMN "timeLimitSeconds" INTEGER;
