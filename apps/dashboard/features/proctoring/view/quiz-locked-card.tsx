import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowLeft,
  Lock,
  MessageCircleQuestion,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"

type QuizLockedCardProps = {
  quizTitle: string
  chapterHref: string
  warningCount: number
  warningLimit: number
  terminatedAt: string | null
  className?: string
}

function formatTerminatedAt(value: string | null): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function QuizLockedCard({
  quizTitle,
  chapterHref,
  warningCount,
  warningLimit,
  terminatedAt,
  className,
}: QuizLockedCardProps) {
  const endedOn = formatTerminatedAt(terminatedAt)

  return (
    <div className={cn("w-full", className)}>
      <Link
        href={chapterHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Back to Chapter
      </Link>

      <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-[#E8EEFF]/90 bg-white shadow-[0_10px_30px_-18px_rgba(65,105,225,0.18)]">
        <div className="relative overflow-hidden bg-linear-to-br from-[#DC2626] via-[#E23B3B] to-[#F05252] px-5 py-5 sm:px-6">
          <div
            className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-white/15"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <Lock className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-white/85 uppercase">
                Quiz locked
              </p>
              <h1 className="mt-1 font-heading text-lg font-semibold tracking-tight text-white sm:text-xl">
                {quizTitle}
              </h1>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex gap-3 rounded-2xl bg-amber-50/80 px-4 py-3.5 ring-1 ring-amber-100">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                A proctored attempt was ended here
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                All {warningLimit} proctoring warnings were used
                {warningCount > warningLimit
                  ? ` (${warningCount} recorded)`
                  : ""}
                {endedOn ? ` on ${endedOn}` : ""}, so this quiz cannot be
                reopened.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl bg-[#F5F7FF] px-4 py-3.5 ring-1 ring-[#E8EEFF]">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#4169E1] ring-1 ring-[#E4E9F5]">
              <MessageCircleQuestion className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Think this was a mistake?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Reach out to your teacher or raise a ticket from Help and
                Support, and they can review the attempt for you.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2.5 border-t border-[#EEF1F8] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={chapterHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E4E9F5] bg-white px-5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-[#F8F9FC] hover:text-foreground"
            >
              Back to chapter
            </Link>
            <Link
              href="/help"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#4169E1] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(65,105,225,0.8)] transition-colors hover:bg-[#5B4BD6]"
            >
              Help and Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
