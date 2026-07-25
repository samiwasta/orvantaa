"use client"

import { Button } from "@workspace/ui/components/button"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Loader2, PencilLine } from "lucide-react"
import { Fragment, useState } from "react"

import {
  calcAverageOverallPercent,
  calcExamColumnSummary,
  calcExamPercent,
  calcSubjectPercent,
  emptyExamMaxMarks,
  emptyExamScores,
  type ExamDef,
  type ExamKey,
  type ReportCard,
  resolveSubjectExamMax,
  type SubjectReportScore,
} from "../model/performance-data"
import { saveReportCard } from "../service/report-card.service"

function percentColor(pct: number) {
  if (pct >= 80) return "text-emerald-600"
  if (pct >= 60) return "text-amber-600"
  return "text-red-500"
}

function shortExamLabel(exam: ExamDef) {
  switch (exam.key) {
    case "unit1":
      return "Unit 1"
    case "term1":
      return "Term 1"
    case "unit2":
      return "Unit 2"
    case "final":
      return "Final"
    default:
      return exam.label
  }
}

type SubjectDraft = {
  scores: Record<ExamKey, number | null>
  maxMarks: Record<ExamKey, number>
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
  const [exams] = useState<ExamDef[]>(() =>
    initialReport.exams.map((exam) => ({ ...exam }))
  )
  const [activeExam, setActiveExam] = useState<ExamKey>(
    () => exams[0]?.key ?? "unit1"
  )
  const [drafts, setDrafts] = useState<Record<string, SubjectDraft>>(() =>
    Object.fromEntries(
      initialReport.subjects.map((subject) => [
        subject.subjectId,
        {
          scores: { ...subject.scores },
          maxMarks: { ...subject.maxMarks },
        },
      ])
    )
  )

  const resetForm = () => {
    setActiveExam(exams[0]?.key ?? "unit1")
    setDrafts(
      Object.fromEntries(
        initialReport.subjects.map((subject) => [
          subject.subjectId,
          {
            scores: { ...subject.scores },
            maxMarks: { ...subject.maxMarks },
          },
        ])
      )
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (nextOpen) resetForm()
  }

  const getDraft = (subjectId: string): SubjectDraft =>
    drafts[subjectId] ?? {
      scores: emptyExamScores(),
      maxMarks: emptyExamMaxMarks(exams),
    }

  const handleMaxMarksChange = (
    subjectId: string,
    key: ExamKey,
    raw: string
  ) => {
    const maxMarks = raw === "" ? 0 : Number(raw)
    if (!Number.isFinite(maxMarks) || maxMarks < 0 || maxMarks > 1000) return

    setDrafts((prev) => {
      const current = prev[subjectId] ?? getDraft(subjectId)
      const nextMax = { ...current.maxMarks, [key]: maxMarks }
      const obtained = current.scores[key]
      const nextScores = { ...current.scores }
      if (obtained !== null && maxMarks > 0 && obtained > maxMarks) {
        nextScores[key] = maxMarks
      }
      return {
        ...prev,
        [subjectId]: { scores: nextScores, maxMarks: nextMax },
      }
    })
  }

  const handleScoreChange = (
    subjectId: string,
    key: ExamKey,
    raw: string,
    maxMarks: number
  ) => {
    const num = raw === "" ? null : Number(raw)
    if (num !== null && (Number.isNaN(num) || num < 0 || num > maxMarks)) return

    setDrafts((prev) => {
      const current = prev[subjectId] ?? getDraft(subjectId)
      return {
        ...prev,
        [subjectId]: {
          ...current,
          scores: { ...current.scores, [key]: num },
        },
      }
    })
  }

  const filledCountForExam = (examKey: ExamKey) =>
    initialReport.subjects.filter((subject) => {
      const draft = getDraft(subject.subjectId)
      return draft.scores[examKey] !== null
    }).length

  const handleSave = async () => {
    if (initialReport.subjects.length === 0) return

    for (const subject of initialReport.subjects) {
      const draft = getDraft(subject.subjectId)
      for (const exam of exams) {
        if (draft.maxMarks[exam.key] < 1) return
      }
    }

    setIsSaving(true)
    try {
      const payload: ReportCard = {
        ...initialReport,
        exams,
        subjects: initialReport.subjects.map((subject) => {
          const draft = getDraft(subject.subjectId)
          return {
            ...subject,
            scores: draft.scores,
            maxMarks: draft.maxMarks,
          }
        }),
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

  const activeExamDef =
    exams.find((exam) => exam.key === activeExam) ?? exams[0]
  const filledForActive = activeExamDef
    ? filledCountForExam(activeExamDef.key)
    : 0
  const totalSubjects = initialReport.subjects.length

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col gap-0 p-0",
          "data-[side=right]:!w-full data-[side=right]:!max-w-none",
          "sm:data-[side=right]:!max-w-lg"
        )}
      >
        <SheetHeader className="space-y-1.5 border-b border-border/60 p-4 sm:p-5">
          <SheetTitle className="pr-8 text-base font-semibold">
            Enter Report Card
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed text-muted-foreground">
            Choose an exam, then fill max and obtained marks for each subject.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={activeExam}
          onValueChange={(value) => setActiveExam(value as ExamKey)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="space-y-4 border-b border-border/60 bg-[#F8FAFF] px-4 py-4 sm:px-5">
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold tracking-wide text-[#4169E1] uppercase">
                Select exam
              </p>
              <TabsList
                className={cn(
                  "flex !h-auto min-h-11 w-full items-center justify-start gap-1.5 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-[#4169E1]/12",
                  "group-data-horizontal/tabs:!h-auto"
                )}
              >
                {exams.map((exam) => {
                  const filled = filledCountForExam(exam.key)
                  const isComplete =
                    totalSubjects > 0 && filled === totalSubjects
                  return (
                    <TabsTrigger
                      key={exam.key}
                      value={exam.key}
                      className={cn(
                        "h-9 min-w-[4.75rem] flex-1 shrink-0 rounded-lg px-2.5 text-xs font-semibold after:hidden",
                        "data-active:bg-[#4169E1] data-active:text-white data-active:shadow-sm",
                        "bg-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="whitespace-nowrap">
                        {shortExamLabel(exam)}
                      </span>
                      {isComplete ? (
                        <Check
                          className="size-3.5 shrink-0 opacity-90"
                          strokeWidth={2.5}
                        />
                      ) : null}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {activeExamDef ? (
              <div className="relative z-0 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-[#4169E1]/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Entering marks for
                    </p>
                    <p className="mt-0.5 font-heading text-base font-semibold break-words text-foreground">
                      {activeExamDef.label}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                      filledForActive === totalSubjects && totalSubjects > 0
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-[#F0F4FF] text-[#4169E1] ring-[#E0E7FF]"
                    )}
                  >
                    {filledForActive}/{totalSubjects} filled
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E0E7FF]">
                  <div
                    className="h-full rounded-full bg-[#4169E1] transition-all"
                    style={{
                      width:
                        totalSubjects > 0
                          ? `${(filledForActive / totalSubjects) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {exams.map((exam) => (
              <TabsContent
                key={exam.key}
                value={exam.key}
                className="mt-0 space-y-3 px-4 py-4 outline-none sm:px-5 sm:py-5"
              >
                {initialReport.subjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                    No subjects assigned yet.
                  </div>
                ) : (
                  initialReport.subjects.map((subject) => {
                    const draft = getDraft(subject.subjectId)
                    const maxMarks = draft.maxMarks[exam.key] || exam.maxMarks
                    const obtained = draft.scores[exam.key]
                    const percent = calcExamPercent(obtained, maxMarks)
                    const isFilled = obtained !== null

                    return (
                      <div
                        key={subject.subjectId}
                        className={cn(
                          "rounded-2xl bg-white p-4 shadow-sm ring-1 transition-colors",
                          isFilled ? "ring-[#4169E1]/25" : "ring-black/5"
                        )}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <p className="min-w-0 flex-1 text-sm font-semibold break-words text-foreground sm:text-[15px]">
                            {subject.subject}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                              percent === null
                                ? "bg-muted text-muted-foreground"
                                : percent >= 80
                                  ? "bg-emerald-50 text-emerald-700"
                                  : percent >= 60
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-rose-50 text-rose-600"
                            )}
                          >
                            {percent === null ? "—%" : `${percent}%`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Max marks
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              max={1000}
                              inputMode="numeric"
                              value={draft.maxMarks[exam.key] || ""}
                              onChange={(e) =>
                                handleMaxMarksChange(
                                  subject.subjectId,
                                  exam.key,
                                  e.target.value
                                )
                              }
                              className="h-11 rounded-xl text-base tabular-nums sm:text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Obtained
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={maxMarks}
                              inputMode="numeric"
                              placeholder="—"
                              value={obtained ?? ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  subject.subjectId,
                                  exam.key,
                                  e.target.value,
                                  maxMarks
                                )
                              }
                              className="h-11 rounded-xl text-base tabular-nums sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <SheetFooter className="mt-0 flex-row gap-3 border-t border-border/60 p-4 sm:p-5">
          <SheetClose asChild>
            <Button
              variant="outline"
              disabled={isSaving}
              className="h-11 flex-1 rounded-xl text-sm"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="h-11 flex-1 rounded-xl bg-[#4169E1] text-sm font-semibold text-white hover:bg-[#3558C8]"
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
  if (obtained === null) {
    return <span className="text-muted-foreground/50">—</span>
  }

  return (
    <span className="font-medium text-foreground tabular-nums">
      {obtained}
      <span className="text-[10px] font-normal text-muted-foreground">
        /{max}
      </span>
    </span>
  )
}

function PercentCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground/50">—</span>
  }

  return (
    <span className={cn("font-semibold tabular-nums", percentColor(value))}>
      {value}%
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

  const hasSubjects = report.subjects.length > 0

  return (
    <>
      <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-md ring-1 ring-black/5">
        <div className="relative border-b border-[#4169E1]/20 bg-gradient-to-br from-[#F5F7FF] via-white to-white px-5 pt-5 pb-4 sm:px-6">
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
            <Button
              size="sm"
              disabled={!hasSubjects}
              onClick={() => setSheetOpen(true)}
              className="h-8 gap-1.5 rounded-lg bg-[#4169E1] px-3 text-xs font-semibold text-white hover:bg-[#3558C8]"
            >
              <PencilLine className="size-3.5" />
              Enter marks
            </Button>
          </div>

          <div className="mx-auto max-w-xl pr-24 text-center sm:pr-28">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#4169E1] uppercase">
              Orvantaa Academic Report
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Report Card
            </h2>
            <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-[#4169E1]/40" />
            <p className="mt-2 text-xs text-muted-foreground">
              Your marks across school examinations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-4 sm:px-5">
          {report.subjects.length === 0 ? (
            <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-[#4169E1]/25 bg-[#F0F4FF]/40 px-4 text-center text-sm text-muted-foreground">
              Your class subjects will appear here once assigned by your school.
            </div>
          ) : (
            <table className="w-full min-w-[640px] border-collapse overflow-hidden rounded-xl text-sm ring-1 ring-[#4169E1]/15">
              <thead>
                <tr className="bg-[#F0F4FF]">
                  <th className="border-b border-[#4169E1]/15 px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-[#5B5B7A] uppercase">
                    Subject
                  </th>
                  {report.exams.map((exam) => (
                    <Fragment key={exam.key}>
                      <th className="border-b border-[#4169E1]/15 px-2 py-2.5 text-center text-[11px] font-semibold tracking-wide text-[#5B5B7A] uppercase">
                        <span className="block normal-case">{exam.label}</span>
                        <span className="mt-0.5 block text-[10px] font-medium tracking-normal text-muted-foreground normal-case">
                          Marks
                        </span>
                      </th>
                      <th className="border-b border-[#4169E1]/15 px-2 py-2.5 text-center text-[11px] font-semibold tracking-wide text-[#4169E1] uppercase">
                        %
                      </th>
                    </Fragment>
                  ))}
                  <th className="border-b border-[#4169E1]/15 px-2 py-2.5 text-center text-[11px] font-semibold tracking-wide text-[#5B5B7A] uppercase">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((sub: SubjectReportScore, index) => {
                  const subPct = calcSubjectPercent(sub, report.exams)
                  return (
                    <tr
                      key={sub.subjectId}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"}
                    >
                      <td className="border-b border-[#E8EEFF] px-3 py-2.5 font-semibold text-foreground">
                        {sub.subject}
                      </td>
                      {report.exams.map((exam) => {
                        const max = resolveSubjectExamMax(sub, exam)
                        const obtained = sub.scores[exam.key]
                        const examPct = calcExamPercent(obtained, max)
                        return (
                          <Fragment key={exam.key}>
                            <td className="border-b border-[#E8EEFF] px-2 py-2.5 text-center text-[13px]">
                              <ScoreCell obtained={obtained} max={max} />
                            </td>
                            <td className="border-b border-[#E8EEFF] px-2 py-2.5 text-center text-[13px]">
                              <PercentCell value={examPct} />
                            </td>
                          </Fragment>
                        )
                      })}
                      <td className="border-b border-[#E8EEFF] px-2 py-2.5 text-center">
                        <span
                          className={cn(
                            "text-[13px] font-bold tabular-nums",
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
              <tfoot>
                <tr className="border-t-2 border-[#4169E1]/20 bg-[#F0F4FF]">
                  <td className="px-3 py-3">
                    <p className="text-sm font-bold text-foreground">Total</p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      Marks · Avg %
                    </p>
                  </td>
                  {report.exams.map((exam) => {
                    const summary = calcExamColumnSummary(report.subjects, exam)
                    return (
                      <Fragment key={exam.key}>
                        <td className="px-2 py-3 text-center text-[13px] font-semibold text-foreground tabular-nums">
                          {summary.hasScores ? (
                            <>
                              {summary.obtained}
                              <span className="text-[10px] font-normal text-muted-foreground">
                                /{summary.max}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center text-[13px]">
                          <PercentCell value={summary.avgPercent} />
                        </td>
                      </Fragment>
                    )
                  })}
                  <td className="px-2 py-3 text-center">
                    {(() => {
                      const avg = calcAverageOverallPercent(
                        report.subjects,
                        report.exams
                      )
                      return (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground">
                            Avg
                          </p>
                          <p
                            className={cn(
                              "text-[13px] font-bold tabular-nums",
                              avg === null
                                ? "text-muted-foreground/50"
                                : percentColor(avg)
                            )}
                          >
                            {avg === null ? "—" : `${avg}%`}
                          </p>
                        </div>
                      )
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      <ManualEntrySheet
        key={report.id ?? "new-report-card"}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialReport={report}
        onSave={setReport}
      />
    </>
  )
}
