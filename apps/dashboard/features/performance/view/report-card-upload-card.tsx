"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardDescription, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { FilePlus2, Pencil, Plus, Upload } from "lucide-react"
import { useRef, useState } from "react"

import {
  calcOverallPercent,
  calcSubjectPercent,
  type ExamKey,
  mockReportCard,
  type ReportCard,
  type SubjectReportScore,
} from "../model/performance-data"

// ─── helpers ─────────────────────────────────────────────────────────────────
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

// ─── Manual entry sheet ───────────────────────────────────────────────────────
type ManualEntrySheetProps = {
  onSave: (card: ReportCard) => void
}

function ManualEntrySheet({ onSave }: ManualEntrySheetProps) {
  const exams = mockReportCard.exams
  const subjects = mockReportCard.subjects.map((s) => s.subject)

  const emptyScores = (): Record<ExamKey, number | null> => ({
    unit1: null,
    term1: null,
    unit2: null,
    final: null,
  })

  const [scores, setScores] = useState<
    Record<string, Record<ExamKey, number | null>>
  >(Object.fromEntries(subjects.map((s) => [s, emptyScores()])))
  const [open, setOpen] = useState(false)

  const handleChange = (subject: string, key: ExamKey, raw: string) => {
    const num = raw === "" ? null : Number(raw)
    setScores((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [key]: num } as Record<
        ExamKey,
        number | null
      >,
    }))
  }

  const handleSave = () => {
    const newCard: ReportCard = {
      ...mockReportCard,
      id: "rc-manual",
      subjects: subjects.map((subject) => ({
        subject,
        scores: scores[subject] ?? emptyScores(),
      })),
    }
    onSave(newCard)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-100 text-[#6C5CE7]">
            <Pencil className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">Enter manually</p>
            <p className="text-xs text-muted-foreground">Type in your scores</p>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle className="text-base font-semibold">
            Enter Report Card
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Fill in your marks for each subject and examination.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {subjects.map((subject) => {
              const subjectScores = scores[subject]
              return (
                <div
                  key={subject}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    {subject}
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
                          value={subjectScores?.[exam.key] ?? ""}
                          onChange={(e) =>
                            handleChange(subject, exam.key, e.target.value)
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
              className="h-10 flex-1 rounded-xl text-sm"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="button"
            onClick={handleSave}
            className="h-10 flex-1 rounded-xl bg-[#6C5CE7] text-sm font-semibold text-white hover:bg-[#5d4ed6]"
          >
            Save Report
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── Upload option ────────────────────────────────────────────────────────────
type UploadOptionProps = {
  onFileSelected: (file: File) => void
  onClose: () => void
}

function UploadOption({ onFileSelected, onClose }: UploadOptionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          inputRef.current?.click()
          onClose()
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
          <Upload className="size-4" />
        </div>
        <div>
          <p className="font-medium text-foreground">Upload file</p>
          <p className="text-xs text-muted-foreground">
            PDF, PNG, JPG — max 10MB
          </p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFileSelected(f)
        }}
      />
    </>
  )
}

// ─── Score cell ───────────────────────────────────────────────────────────────
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

// ─── Main card ────────────────────────────────────────────────────────────────
export function ReportCardUploadCard() {
  const [report, setReport] = useState<ReportCard>(mockReportCard)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const overallPct = calcOverallPercent(report)

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-md ring-1 ring-black/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <CardTitle className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-[17px]">
            Report Card Analysis
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Track your scores across all examinations
          </CardDescription>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              className="h-8 shrink-0 gap-1.5 rounded-lg bg-[#6C5CE7] px-3 text-xs font-semibold text-white hover:bg-[#5d4ed6]"
            >
              <Plus className="size-3.5" />
              Add new report
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-64 gap-1 p-2">
            <p className="mb-1 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Add report
            </p>
            <ManualEntrySheet
              onSave={(card) => {
                setReport(card)
                setPopoverOpen(false)
              }}
            />
            <UploadOption
              onFileSelected={() => setPopoverOpen(false)}
              onClose={() => setPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Overall badge + title */}
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
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
            percentBadgeClass(overallPct)
          )}
        >
          Overall {overallPct}%
        </span>
      </div>

      {/* Scores table */}
      <div className="mt-3 flex-1 overflow-x-auto px-5 pb-5 sm:px-6">
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
                  {exam.label}
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
                <tr key={sub.subject} className="group rounded-lg">
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
                        percentColor(subPct)
                      )}
                    >
                      {subPct}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
