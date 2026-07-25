"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import {
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  Lightbulb,
  Loader2,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react"

import { PROCTOR_WARNING_LIMIT } from "@/features/proctoring/model/proctor-rules"

import type { QuizItem } from "../model/chapter-data"
import { isTimedQuiz } from "../model/chapter-data"

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} second${totalSeconds === 1 ? "" : "s"}`
  }
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (seconds === 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`
  }
  return `${minutes}m ${seconds}s`
}

type Instruction = {
  icon: React.ReactNode
  title: string
  body: string
  tone?: "default" | "warning" | "info"
}

type QuizStartDialogProps = {
  open: boolean
  quiz: QuizItem
  questionCount: number
  isStarting?: boolean
  startError?: string | null
  onStart: () => void
  onCancel: () => void
}

export function QuizStartDialog({
  open,
  quiz,
  questionCount,
  isStarting = false,
  startError = null,
  onStart,
  onCancel,
}: QuizStartDialogProps) {
  const timed = isTimedQuiz(quiz)
  const limitSeconds =
    timed && quiz.timeLimitSeconds && quiz.timeLimitSeconds > 0
      ? quiz.timeLimitSeconds
      : null

  const instructions: Instruction[] = [
    {
      icon: <Sparkles className="size-4" aria-hidden />,
      title: "Take a calm breath",
      body: `You have ${questionCount} question${questionCount === 1 ? "" : "s"}. Read each one carefully and choose the best answer.`,
      tone: "info",
    },
  ]

  if (timed && limitSeconds) {
    instructions.push({
      icon: <Clock className="size-4" aria-hidden />,
      title:
        quiz.timedMode === "per_question"
          ? "This quiz is timed per question"
          : "This quiz has a total timer",
      body:
        quiz.timedMode === "per_question"
          ? `You get ${formatDuration(limitSeconds)} for each question. When time runs out, we move you to the next one automatically.`
          : `You get ${formatDuration(limitSeconds)} for the whole quiz. When time runs out, your attempt is submitted automatically.`,
      tone: "info",
    })
  } else {
    instructions.push({
      icon: <CheckCircle2 className="size-4" aria-hidden />,
      title: "No timer on this quiz",
      body: "Take the time you need. You can move between questions before finishing.",
      tone: "default",
    })
  }

  instructions.push(
    {
      icon: <Eye className="size-4" aria-hidden />,
      title: "This attempt is proctored",
      body: "The quiz opens in fullscreen without the sidebar. Leaving fullscreen, switching tabs or apps, or reloading is recorded.",
      tone: "warning",
    },
    {
      icon: <Video className="size-4" aria-hidden />,
      title: "Camera and microphone stay on",
      body: "Keep your face clearly in frame and stay quiet. Looking away, covering the camera, another person in view, or talking can trigger warnings.",
      tone: "warning",
    },
    {
      icon: <Ban className="size-4" aria-hidden />,
      title: "Copying and screenshots are blocked",
      body: "Right-click, copy, paste, printing, and screenshot shortcuts stay blocked. Capture attempts blank the screen.",
      tone: "warning",
    },
    {
      icon: <ShieldAlert className="size-4" aria-hidden />,
      title: `You get ${PROCTOR_WARNING_LIMIT} warnings`,
      body: `Each recorded action shows a warning. After ${PROCTOR_WARNING_LIMIT} warnings the attempt ends on its own, your answers so far are scored, and this quiz stays locked for you.`,
      tone: "warning",
    },
    {
      icon: <Lightbulb className="size-4" aria-hidden />,
      title: "Learn from every miss",
      body: "You get instant feedback. Wrong answers come with a soft AI hint and return later so you can try again after a few more questions.",
      tone: "info",
    },
    {
      icon: <Sparkles className="size-4" aria-hidden />,
      title: "Do your own best work",
      body: "Please avoid malpractice. Honest practice helps you learn faster — and keeps your score fair.",
      tone: "default",
    }
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92dvh,44rem)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[1.5rem] border-[#E8EEFF] p-0 sm:max-w-lg"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-[#4169E1] via-[#7c6ff0] to-[#9b8cf5] px-5 py-5 sm:px-6 sm:py-6">
          <div
            className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-white/10"
            aria-hidden
          />
          <DialogHeader className="relative gap-2 text-left">
            <p className="text-[11px] font-semibold tracking-wide text-white/75 uppercase">
              Before you begin
            </p>
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
              {quiz.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/80">
              A few friendly reminders so your attempt stays smooth and fair.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {instructions.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex gap-3 rounded-2xl px-4 py-3.5 ring-1",
                item.tone === "warning"
                  ? "bg-amber-50/80 ring-amber-100"
                  : item.tone === "info"
                    ? "bg-sky-50/80 ring-sky-100"
                    : "bg-[#F5F7FF] ring-[#E8EEFF]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
                  item.tone === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : item.tone === "info"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-white text-[#4169E1] ring-1 ring-[#E4E9F5]"
                )}
              >
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-[#EEF1F8] bg-[#FAFBFF] px-5 py-4 sm:px-6 sm:py-5">
          {startError ? (
            <p className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-600 ring-1 ring-red-100">
              {startError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isStarting}
              className="h-11 w-full rounded-xl border-[#E4E9F5] bg-white px-5 text-sm font-semibold sm:w-auto"
            >
              Go back
            </Button>
            <Button
              type="button"
              onClick={onStart}
              disabled={isStarting}
              className="h-11 w-full rounded-xl bg-[#FF8A3D] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] hover:bg-[#E8722A] sm:w-auto"
            >
              {isStarting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Starting...
                </span>
              ) : (
                "Start proctored quiz"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
