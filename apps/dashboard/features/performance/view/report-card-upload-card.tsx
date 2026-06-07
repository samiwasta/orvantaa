"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardDescription, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { FilePlus2, Loader2, Plus } from "lucide-react"
import { useState } from "react"

import {
  calcOverallPercent,
  calcSubjectPercent,
  type ExamDef,
  type ExamKey,
  type ReportCard,
  type SubjectReportScore,
} from "../model/performance-data"
import { saveReportCard } from "../service/report-card.service"

function percentColor(pct: number) {
  if (pct >= 80) return "text-emerald-600"
  if (pct >= 60) return "text-amber-600"
  return "text-red-500"
}

function percentBadgeClass(pct: number) {
  if (pct >= 80) return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (pct >= 60) return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-red-50 text-red-600 ring-red-200"
}

function emptyScores(): Record<ExamKey, number | null> {
  return { unit1: null, term1: null, unit2: null, final: null }
}

type ManualEntrySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialReport: ReportCard
  onSave: (card: ReportCard) => void
}

function ManualEntrySheet({
  open,
  onOpenChange,
  initialReport,
  onSave,
}: ManualEntrySheetProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [exams, setExams] = useState<ExamDef[]>(() =>
    initialReport.exams.map((exam) => ({ ...exam }))
  )
  const [scores, setScores] = useState<
    Record<string, Record<ExamKey, number | null>>
  >(() =>
    Object.fromEntries(
      initialReport.subjects.map((subject) => [
        subject.subjectId,
        { ...subject.scores },
      ])
    )
  )

  const resetForm = () => {
    setExams(initialReport.exams.map((exam) => ({ ...exam })))
    setScores(
      Object.fromEntries(
        initialReport.subjects.map((subject) => [
          subject.subjectId,
          { ...subject.scores },
        ])
      )
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (nextOpen) resetForm()
  }

  const handleExamMaxChange = (key: ExamKey, raw: string) => {
    const maxMarks = raw === "" ? 0 : Number(raw)
    setExams((current) =>
      current.map((exam) =>
        exam.key === key
          ? {
              ...exam,
              maxMarks: Number.isFinite(maxMarks) ? maxMarks : exam.maxMarks,
            }
          : exam
      )
    )
  }

  const handleScoreChange = (
    subjectId: string,
    key: ExamKey,
    raw: string,
    maxMarks: number
  ) => {
    const num = raw === "" ? null : Number(raw)
    if (num !== null && (Number.isNaN(num) || num < 0 || num > maxMarks)) return

    setScores((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] ?? emptyScores()),
        [key]: num,
      },
    }))
  }

  const handleSave = async () => {
    if (initialReport.subjects.length === 0) return

    const invalidExam = exams.find((exam) => exam.maxMarks < 1)
    if (invalidExam) return

    setIsSaving(true)
    try {
      const payload: ReportCard = {
        ...initialReport,
        exams,
        subjects: initialReport.subjects.map((subject) => ({
          ...subject,
          scores: scores[subject.subjectId] ?? emptyScores(),
        })),
      }

      const saved = await saveReportCard(payload)
      onSave(saved)
      onOpenChange(false)
    } catch (error) {
      console.error("[report-card] Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle className="text-base font-semibold">
            Enter Report Card
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Set total marks for each exam, then enter your scores for assigned
            subjects.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-5 rounded-xl border border-[#6C5CE7]/20 bg-violet-50/40 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Exam total marks
            </p>
            <div className="grid grid-cols-2 gap-3">
              {exams.map((exam) => (
                <div key={exam.key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {exam.label}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={exam.maxMarks}
                    onChange={(e) =>
                      handleExamMaxChange(exam.key, e.target.value)
                    }
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {initialReport.subjects.map((subject) => {
              const subjectScores = scores[subject.subjectId] ?? emptyScores()
              return (
                <div
                  key={subject.subjectId}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    {subject.subject}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {exams.map((exam) => (
                      <div key={exam.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {exam.label}
                          <span className="ml-1 text-[10px] text-muted-foreground/70">
                            /{exam.maxMarks}
                          </span>
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={exam.maxMarks}
                          placeholder="—"
                          value={subjectScores[exam.key] ?? ""}
                          onChange={(e) =>
                            handleScoreChange(
                              subject.subjectId,
                              exam.key,
                              e.target.value,
                              exam.maxMarks
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <SheetFooter className="border-t border-border/60 px-5 py-4">
          <SheetClose asChild>
            <Button
              variant="outline"
              disabled={isSaving}
              className="h-10 flex-1 rounded-xl text-sm"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="h-10 flex-1 rounded-xl bg-[#6C5CE7] text-sm font-semibold text-white hover:bg-[#5d4ed6]"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Report"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ScoreCell({
  obtained,
  max,
}: {
  obtained: number | null
  max: number
}) {
  if (obtained === null)
    return <span className="text-muted-foreground/50">—</span>
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        obtained / max >= 0.8
          ? "text-emerald-600"
          : obtained / max >= 0.6
            ? "text-amber-600"
            : "text-red-500"
      )}
    >
      {obtained}
      <span className="text-[10px] font-normal text-muted-foreground">
        /{max}
      </span>
    </span>
  )
}

type ReportCardUploadCardProps = {
  initialReport: ReportCard
}

export function ReportCardUploadCard({
  initialReport,
}: ReportCardUploadCardProps) {
  const [report, setReport] = useState<ReportCard>(initialReport)
  const [sheetOpen, setSheetOpen] = useState(false)

  const overallPct = calcOverallPercent(report)
  const hasAnyScore = report.subjects.some((subject) =>
    report.exams.some((exam) => subject.scores[exam.key] !== null)
  )
  const hasSubjects = report.subjects.length > 0

  return (
    <>
      <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-[17px]">
              Report Card Analysis
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Track your scores across all examinations
            </CardDescription>
          </div>

          <Button
            size="sm"
            disabled={!hasSubjects}
            onClick={() => setSheetOpen(true)}
            className="h-8 shrink-0 gap-1.5 rounded-lg bg-[#6C5CE7] px-3 text-xs font-semibold text-white hover:bg-[#5d4ed6]"
          >
            <Plus className="size-3.5" />
            Add marks
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-6">
          <div className="flex items-center gap-2">
            <FilePlus2
              className="size-4 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="text-sm font-medium text-foreground">
              {report.title}
            </span>
          </div>
          {hasAnyScore ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                percentBadgeClass(overallPct)
              )}
            >
              Overall {overallPct}%
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex-1 overflow-x-auto px-5 pb-5 sm:px-6">
          {report.subjects.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border/70 px-4 text-center text-sm text-muted-foreground">
              Your class subjects will appear here once assigned by your school.
            </div>
          ) : (
            <table className="w-full min-w-[360px] border-separate border-spacing-y-1 text-sm">
              <thead>
                <tr>
                  <th className="py-1 pr-3 text-left text-[11px] font-semibold tracking-wide text-muted-foreground">
                    Subject
                  </th>
                  {report.exams.map((exam) => (
                    <th
                      key={exam.key}
                      className="px-2 py-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
                    >
                      <span className="block">{exam.label}</span>
                      <span className="text-[10px] font-normal text-muted-foreground/70">
                        /{exam.maxMarks}
                      </span>
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((sub: SubjectReportScore) => {
                  const subPct = calcSubjectPercent(sub, report.exams)
                  return (
                    <tr key={sub.subjectId} className="group rounded-lg">
                      <td className="rounded-l-lg py-2 pr-3 font-medium text-foreground">
                        {sub.subject}
                      </td>
                      {report.exams.map((exam) => (
                        <td
                          key={exam.key}
                          className="px-2 py-2 text-center text-[13px]"
                        >
                          <ScoreCell
                            obtained={sub.scores[exam.key]}
                            max={exam.maxMarks}
                          />
                        </td>
                      ))}
                      <td className="rounded-r-lg px-2 py-2 text-center">
                        <span
                          className={cn(
                            "text-[13px] font-semibold tabular-nums",
                            subPct > 0
                              ? percentColor(subPct)
                              : "text-muted-foreground/50"
                          )}
                        >
                          {subPct > 0 ? `${subPct}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ManualEntrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialReport={report}
        onSave={setReport}
      />
    </>
  )
}
