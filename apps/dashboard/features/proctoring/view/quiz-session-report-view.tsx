import { cn } from "@workspace/ui/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  OctagonAlert,
  Shield,
} from "lucide-react"
import Link from "next/link"

import type { QuizSessionReport } from "../model/quiz-session-report"

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds === null) return "—"
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`
}

type QuizSessionReportViewProps = {
  report: QuizSessionReport
}

export function QuizSessionReportView({ report }: QuizSessionReportViewProps) {
  const blocked = report.outcome === "terminated"
  const studentName =
    `${report.student.firstName} ${report.student.lastName}`.trim()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="overflow-hidden rounded-[1.5rem] border border-[#E8EEFF] bg-white shadow-[0_16px_40px_-24px_rgba(65,105,225,0.35)]">
        <div
          className={cn(
            "relative overflow-hidden px-5 py-6 sm:px-7",
            blocked
              ? "bg-linear-to-br from-[#DC2626] via-[#E23B3B] to-[#F05252]"
              : "bg-linear-to-br from-[#6C5CE7] via-[#7c6ff0] to-[#9b8cf5]"
          )}
        >
          <div
            className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-white/15"
            aria-hidden
          />
          <p className="text-[11px] font-semibold tracking-wide text-white/80 uppercase">
            Quiz session proof
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white sm:text-[1.7rem]">
            {report.quiz.title}
          </h1>
          <p className="mt-1.5 text-sm text-white/85">
            {report.quiz.subjectName} · Chapter {report.quiz.chapterNumber}:{" "}
            {report.quiz.chapterTitle}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {blocked ? (
              <OctagonAlert className="size-3.5" aria-hidden />
            ) : (
              <CheckCircle2 className="size-3.5" aria-hidden />
            )}
            {blocked ? "Blocked by proctoring" : "Completed successfully"}
          </div>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-7">
          <section className="grid gap-3 sm:grid-cols-2">
            <InfoCard label="Student" value={studentName || "Student"} />
            <InfoCard
              label="Student code"
              value={report.student.studentCode ?? "—"}
            />
            <InfoCard
              label="Started"
              value={formatDateTime(report.startedAt)}
            />
            <InfoCard
              label="Ended"
              value={
                report.endedAt ? formatDateTime(report.endedAt) : "Not recorded"
              }
            />
            <InfoCard
              label="Duration"
              value={formatDuration(report.durationSeconds)}
            />
            <InfoCard
              label="Warnings"
              value={`${report.warningCount} / ${report.warningLimit}`}
            />
            {report.attempt ? (
              <>
                <InfoCard
                  label="Score"
                  value={`${report.attempt.scorePercent}%`}
                />
                <InfoCard
                  label="Answered"
                  value={`${report.attempt.answeredCount} / ${report.attempt.totalQuestions}`}
                />
              </>
            ) : null}
          </section>

          <section className="rounded-2xl bg-[#F7F6FF] px-4 py-4 ring-1 ring-[#E8EEFF]">
            <div className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#6C5CE7] ring-1 ring-[#E4E9F5]">
                <Shield className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Share this page with Support
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  This link is proof of the attempt. If something looks wrong,
                  open Help and Support and paste this page URL in your ticket.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={report.helpHref}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#5B4BD6]"
                  >
                    Help and Support
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                  <p className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E9F5] bg-white px-3 text-[11px] font-medium text-muted-foreground">
                    <Copy className="size-3.5" aria-hidden />
                    Session ID: {report.sessionId}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="size-4 text-[#6C5CE7]" aria-hidden />
              <h2 className="font-heading text-base font-semibold text-foreground">
                Activity log
              </h2>
            </div>

            {report.violations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E4E9F5] bg-[#FAFBFF] px-4 py-6 text-center text-sm text-muted-foreground">
                No proctoring events were recorded during this attempt.
              </div>
            ) : (
              <ol className="space-y-2.5">
                {report.violations.map((item, index) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-[#EEF1F8] bg-white px-4 py-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                          item.warningNumber !== null
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#F0EEFF] text-[#6C5CE7]"
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          {item.warningNumber !== null ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100">
                              <AlertTriangle className="size-3" aria-hidden />
                              Warning {item.warningNumber}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-100">
                              Logged
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                          {item.message}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span>{formatDateTime(item.occurredAt)}</span>
                          {item.questionIndex !== null ? (
                            <span>Question {item.questionIndex + 1}</span>
                          ) : null}
                          <span className="font-medium text-slate-500">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8F9FC] px-4 py-3 ring-1 ring-[#EEF1F8]">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
