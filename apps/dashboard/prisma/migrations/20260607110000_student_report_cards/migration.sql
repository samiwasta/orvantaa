-- CreateTable
CREATE TABLE "student_report_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Report Card',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_card_exam_columns" (
    "id" TEXT NOT NULL,
    "reportCardId" TEXT NOT NULL,
    "examKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "report_card_exam_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_card_subject_scores" (
    "id" TEXT NOT NULL,
    "reportCardId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examKey" TEXT NOT NULL,
    "obtainedMarks" INTEGER,

    CONSTRAINT "report_card_subject_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_report_cards_userId_key" ON "student_report_cards"("userId");

-- CreateIndex
CREATE INDEX "report_card_exam_columns_reportCardId_idx" ON "report_card_exam_columns"("reportCardId");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_exam_columns_reportCardId_examKey_key" ON "report_card_exam_columns"("reportCardId", "examKey");

-- CreateIndex
CREATE INDEX "report_card_subject_scores_reportCardId_idx" ON "report_card_subject_scores"("reportCardId");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_subject_scores_reportCardId_subjectId_examKey_key" ON "report_card_subject_scores"("reportCardId", "subjectId", "examKey");

-- AddForeignKey
ALTER TABLE "student_report_cards" ADD CONSTRAINT "student_report_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_exam_columns" ADD CONSTRAINT "report_card_exam_columns_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "student_report_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_subject_scores" ADD CONSTRAINT "report_card_subject_scores_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "student_report_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_subject_scores" ADD CONSTRAINT "report_card_subject_scores_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
