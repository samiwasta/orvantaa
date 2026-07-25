"use client"

import { RichTextContent } from "@workspace/rich-text"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, Check, Clock, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { submitQuizAttempt } from "@/features/performance/service/activity-tracking.service"
import { useQuizProctor } from "@/features/proctoring/controller/use-quiz-proctor"
import type { ProctorLockState } from "@/features/proctoring/model/proctor-session"
import { ProctorBlankOverlay } from "@/features/proctoring/view/proctor-blank-overlay"
import { ProctorCameraPreview } from "@/features/proctoring/view/proctor-camera-preview"
import { ProctorNoticeToast } from "@/features/proctoring/view/proctor-notice-toast"
import { ProctorStatusBadge } from "@/features/proctoring/view/proctor-status-badge"
import { ProctorTerminatedDialog } from "@/features/proctoring/view/proctor-terminated-dialog"
import { ProctorWarningDialog } from "@/features/proctoring/view/proctor-warning-dialog"
import { QuizLockedCard } from "@/features/proctoring/view/quiz-locked-card"
import { useDashboardChrome } from "@/features/sidebar/model/dashboard-chrome-context"

import type { ChapterItem } from "../model/chapter-data"
import { chapterSlug, isTimedQuiz } from "../model/chapter-data"
import type { QuizSession } from "../model/quiz-data"
import { optionDisplayLabel } from "../model/quiz-data"
import {
  advanceQuizLearningQueue,
  buildInitialQuizDeck,
  pullNextLearningEntry,
  type QuizDeckEntry,
  type QuizRetryTicket,
  scheduleWrongAnswerRetry,
} from "../model/quiz-learning-deck"
import { requestQuizSoftHint } from "../service/quiz-soft-hint.service"
import { QuizAnswerFeedback } from "./quiz-answer-feedback"
import { QuizStartDialog } from "./quiz-start-dialog"

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function countAnswered(answers: Record<string, string>): number {
  return Object.values(answers).filter((optionId) => Boolean(optionId)).length
}

function QuizTimerBadge({
  secondsLeft,
  label,
  paused,
}: {
  secondsLeft: number
  label: string
  paused: boolean
}) {
  const urgent = secondsLeft <= 30
  const critical = secondsLeft <= 10

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ring-1 backdrop-blur-sm",
        critical
          ? "bg-white text-red-600 ring-white/80"
          : urgent
            ? "bg-white text-amber-600 ring-white/80"
            : "bg-white/95 text-sky-700 ring-white/70"
      )}
      aria-live="polite"
      aria-label={`${label}: ${formatCountdown(secondsLeft)} remaining`}
    >
      <Clock
        className={cn("size-4", critical && !paused && "animate-pulse")}
        aria-hidden
      />
      <span>{formatCountdown(secondsLeft)}</span>
      <span className="hidden text-[11px] font-medium opacity-80 sm:inline">
        {paused ? "Paused" : label}
      </span>
    </div>
  )
}

type QuizViewProps = {
  subjectSlug: string
  chapter: ChapterItem
  session: QuizSession
  proctorLock: ProctorLockState
}

export function QuizView({
  subjectSlug,
  chapter,
  session,
  proctorLock,
}: QuizViewProps) {
  const router = useRouter()
  const { setImmersive } = useDashboardChrome()
  const chSlug = chapterSlug(chapter)
  const chapterHref = `/subjects/${subjectSlug}/${chSlug}`
  const { quiz, questions } = session
  const chapterTitle = `Chapter ${chapter.number}: ${chapter.title}`

  const timed = isTimedQuiz(quiz)
  const limitSeconds =
    timed && quiz.timeLimitSeconds && quiz.timeLimitSeconds > 0
      ? quiz.timeLimitSeconds
      : null
  const isPerQuestion = quiz.timedMode === "per_question"
  const isWholeQuiz = quiz.timedMode === "whole_quiz"
  const bankTotal = questions.length

  const [currentEntry, setCurrentEntry] = useState<QuizDeckEntry | null>(null)
  const [upcoming, setUpcoming] = useState<QuizDeckEntry[]>([])
  const [pendingRetries, setPendingRetries] = useState<QuizRetryTicket[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({})
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<string>>(
    () => new Set()
  )
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null)
  const [retryScheduled, setRetryScheduled] = useState(false)
  const [softHint, setSoftHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [hintError, setHintError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [terminated, setTerminated] = useState(false)
  const [terminationSaving, setTerminationSaving] = useState(false)
  const [terminationError, setTerminationError] = useState<string | null>(null)
  const [terminationAnswers, setTerminationAnswers] = useState<
    Record<string, string>
  >({})
  const [stepKey, setStepKey] = useState(0)
  const startedAtRef = useRef(Date.now())
  const finishingRef = useRef(false)
  const terminatedRef = useRef(false)
  const expiryKeyRef = useRef<string | null>(null)
  const selectedOptionIdRef = useRef<string | null>(null)
  const answerMapRef = useRef(answerMap)
  const currentEntryRef = useRef(currentEntry)
  const upcomingRef = useRef(upcoming)
  const pendingRetriesRef = useRef(pendingRetries)
  const feedbackCorrectRef = useRef(feedbackCorrect)
  const proctorSessionIdRef = useRef<string | null>(null)

  const question = currentEntry?.question ?? null
  const questionNumber = currentEntry ? currentEntry.bankIndex + 1 : 0
  const isRetry = currentEntry?.isRetry ?? false
  const feedbackOpen = feedbackCorrect !== null
  const uniqueProgress = seenQuestionIds.size

  selectedOptionIdRef.current = selectedOptionId
  answerMapRef.current = answerMap
  currentEntryRef.current = currentEntry
  upcomingRef.current = upcoming
  pendingRetriesRef.current = pendingRetries
  feedbackCorrectRef.current = feedbackCorrect

  const persistCurrentSelection = useCallback(() => {
    const current = currentEntryRef.current?.question
    if (!current) return answerMapRef.current

    const selectedId = selectedOptionIdRef.current
    if (!selectedId) return answerMapRef.current

    const selectedOption = current.options.find(
      (option) => option.id === selectedId
    )
    if (!selectedOption) return answerMapRef.current

    const nextAnswers = {
      ...answerMapRef.current,
      [current.dbId]: selectedOption.dbId,
    }
    setAnswerMap(nextAnswers)
    return nextAnswers
  }, [])

  const submitAttempt = useCallback(
    async (finalAnswers: Record<string, string>) => {
      await submitQuizAttempt({
        quizId: quiz.id,
        answers: questions.map((item) => ({
          questionId: item.dbId,
          optionId: finalAnswers[item.dbId] ?? "",
        })),
        timeSpentSeconds: Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000)
        ),
        proctorSessionId: proctorSessionIdRef.current ?? undefined,
      })
    },
    [questions, quiz.id]
  )

  const saveTerminatedAttempt = useCallback(
    async (finalAnswers: Record<string, string>) => {
      setTerminationSaving(true)
      setTerminationError(null)
      try {
        await submitAttempt(finalAnswers)
      } catch (error) {
        setTerminationError(
          error instanceof Error
            ? error.message
            : "Could not save your attempt."
        )
      } finally {
        setTerminationSaving(false)
      }
    },
    [submitAttempt]
  )

  const handleTerminated = useCallback(() => {
    if (terminatedRef.current) return
    terminatedRef.current = true

    const finalAnswers = persistCurrentSelection()
    finishingRef.current = true
    setTerminated(true)
    setTerminationAnswers(finalAnswers)
    void saveTerminatedAttempt(finalAnswers)
  }, [persistCurrentSelection, saveTerminatedAttempt])

  const proctor = useQuizProctor({
    quizId: quiz.id,
    questionIndex: Math.max(0, questionNumber - 1),
    onTerminated: handleTerminated,
  })

  const {
    suspend: suspendProctor,
    resume: resumeProctor,
    complete: completeProctor,
  } = proctor

  proctorSessionIdRef.current = proctor.sessionId

  useEffect(() => {
    const immersive = hasStarted && !terminated
    setImmersive(immersive)
    return () => setImmersive(false)
  }, [hasStarted, setImmersive, terminated])

  useEffect(() => {
    void import("@/features/proctoring/controller/proctor-face-detector").then(
      (mod) => void mod.getProctorFaceDetector()
    )
  }, [])

  const timerPaused = proctor.warning !== null || feedbackOpen
  const runtimeLock = proctor.status === "locked" ? proctor.lock : null

  useEffect(() => {
    if (!question) {
      setSelectedOptionId(null)
      return
    }

    if (feedbackCorrectRef.current !== null) return
    setSelectedOptionId(null)
  }, [question?.dbId, isRetry, stepKey])

  useEffect(() => {
    if (!hasStarted || !timed || !limitSeconds) {
      if (!hasStarted) setSecondsLeft(null)
      return
    }
    if (isPerQuestion) {
      setSecondsLeft(limitSeconds)
    } else if (isWholeQuiz) {
      setSecondsLeft((prev) => (prev === null ? limitSeconds : prev))
    }
  }, [hasStarted, timed, limitSeconds, isPerQuestion, isWholeQuiz, stepKey])

  useEffect(() => {
    if (!hasStarted || !timed || !limitSeconds) return
    if (timerPaused || terminated) return

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 0) return prev
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [
    hasStarted,
    timed,
    limitSeconds,
    timerPaused,
    terminated,
    isPerQuestion ? stepKey : quiz.id,
  ])

  const finishQuiz = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (finishingRef.current || isSubmitting) return
      finishingRef.current = true
      setIsSubmitting(true)
      suspendProctor()
      try {
        await submitAttempt(finalAnswers)
        completeProctor()
        router.push(chapterHref)
      } catch (error) {
        console.error("[quiz] Failed to submit attempt:", error)
        finishingRef.current = false
        resumeProctor()
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      chapterHref,
      completeProctor,
      isSubmitting,
      resumeProctor,
      router,
      submitAttempt,
      suspendProctor,
    ]
  )

  const clearFeedbackState = useCallback(() => {
    setFeedbackCorrect(null)
    setRetryScheduled(false)
    setSoftHint(null)
    setHintLoading(false)
    setHintError(null)
  }, [])

  const moveToNextEntry = useCallback(
    (finalAnswers: Record<string, string>) => {
      const ticked = advanceQuizLearningQueue({
        upcoming: upcomingRef.current,
        pending: pendingRetriesRef.current,
      })
      const pulled = pullNextLearningEntry(ticked)

      setUpcoming(pulled.upcoming)
      setPendingRetries(pulled.pending)
      clearFeedbackState()
      setSelectedOptionId(null)

      if (pulled.done || !pulled.next) {
        void finishQuiz(finalAnswers)
        return
      }

      setStepKey((value) => value + 1)
      expiryKeyRef.current = null
      setCurrentEntry(pulled.next)
    },
    [clearFeedbackState, finishQuiz]
  )

  const handleTimeExpired = useCallback(() => {
    if (finishingRef.current) return
    if (feedbackCorrectRef.current !== null) return

    const nextAnswers = persistCurrentSelection()

    if (isWholeQuiz) {
      void finishQuiz(nextAnswers)
      return
    }

    if (isPerQuestion) {
      moveToNextEntry(nextAnswers)
    }
  }, [
    finishQuiz,
    isPerQuestion,
    isWholeQuiz,
    moveToNextEntry,
    persistCurrentSelection,
  ])

  useEffect(() => {
    if (!hasStarted || !timed || secondsLeft !== 0) return
    if (terminated) return
    const key = isPerQuestion ? `q-${stepKey}` : "whole"
    if (expiryKeyRef.current === key) return
    expiryKeyRef.current = key
    handleTimeExpired()
  }, [
    handleTimeExpired,
    hasStarted,
    isPerQuestion,
    secondsLeft,
    stepKey,
    terminated,
    timed,
  ])

  const lock = proctorLock.locked ? proctorLock : runtimeLock

  if (lock) {
    return (
      <QuizLockedCard
        quizTitle={quiz.title}
        chapterHref={chapterHref}
        warningCount={lock.warningCount}
        warningLimit={lock.warningLimit}
        terminatedAt={lock.terminatedAt}
      />
    )
  }

  if (hasStarted && !question) {
    return (
      <div className="w-full">
        <Link
          href={chapterHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to Chapter
        </Link>
        <p className="mt-6 text-sm text-muted-foreground">
          No questions available for this quiz.
        </p>
      </div>
    )
  }

  const handleCheckAnswer = () => {
    if (!question || !currentEntry || !selectedOptionId) return
    if (feedbackOpen || finishingRef.current) return

    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId
    )
    if (!selectedOption) return

    const nextAnswers = {
      ...answerMap,
      [question.dbId]: selectedOption.dbId,
    }
    setAnswerMap(nextAnswers)
    setSeenQuestionIds((prev) => {
      const next = new Set(prev)
      next.add(question.dbId)
      return next
    })

    const isCorrect = selectedOptionId === question.correctOptionId
    setFeedbackCorrect(isCorrect)

    if (isCorrect) {
      setRetryScheduled(false)
      setSoftHint(null)
      setHintError(null)
      setHintLoading(false)
      return
    }

    const nextPending = scheduleWrongAnswerRetry({
      entry: currentEntry,
      pending: pendingRetries,
    })
    setPendingRetries(nextPending)
    setRetryScheduled(true)
    setHintLoading(true)
    setHintError(null)
    setSoftHint(null)

    void requestQuizSoftHint({
      quizTitle: quiz.title,
      chapterTitle,
      questionNumber,
      question,
      selectedOptionId,
    })
      .then((hint) => {
        setSoftHint(hint)
        setHintLoading(false)
      })
      .catch(() => {
        setHintLoading(false)
        setHintError(
          "Think about the core idea in the question stem before looking at the options again."
        )
      })
  }

  const handleContinue = () => {
    if (feedbackCorrect === null || isSubmitting || finishingRef.current) return
    const finalAnswers = persistCurrentSelection()
    moveToNextEntry(finalAnswers)
  }

  const handleStartQuiz = async () => {
    const ready = await proctor.start()
    if (!ready) return

    const deck = buildInitialQuizDeck(questions)
    const pulled = pullNextLearningEntry({ upcoming: deck, pending: [] })

    startedAtRef.current = Date.now()
    expiryKeyRef.current = null
    setStepKey(0)
    clearFeedbackState()
    setAnswerMap({})
    setSeenQuestionIds(new Set())
    setUpcoming(pulled.upcoming)
    setPendingRetries([])
    setCurrentEntry(pulled.next)
    setSelectedOptionId(null)

    if (timed && limitSeconds) {
      setSecondsLeft(limitSeconds)
    }
    setHasStarted(true)
  }

  const handleExitQuiz = () => {
    proctor.abandon()
    router.push(chapterHref)
  }

  const timerLabel = isPerQuestion ? "Per question" : "Time left"
  const progressPercent =
    bankTotal === 0 ? 0 : Math.round((uniqueProgress / bankTotal) * 100)

  return (
    <div className="w-full">
      <QuizStartDialog
        open={!hasStarted && !terminated}
        quiz={quiz}
        questionCount={bankTotal}
        isStarting={proctor.isStarting}
        startError={proctor.startError}
        onStart={() => void handleStartQuiz()}
        onCancel={() => router.push(chapterHref)}
      />

      <ProctorWarningDialog
        warning={proctor.warning}
        onAcknowledge={proctor.acknowledgeWarning}
      />

      <ProctorTerminatedDialog
        open={terminated}
        warningLimit={proctor.warningLimit || proctorLock.warningLimit}
        answeredCount={countAnswered(terminationAnswers)}
        totalQuestions={bankTotal}
        isSaving={terminationSaving}
        saveError={terminationError}
        onExit={() => router.push(chapterHref)}
        onRetrySave={() => void saveTerminatedAttempt(terminationAnswers)}
      />

      <ProctorNoticeToast notice={proctor.notice} />
      <ProctorBlankOverlay active={proctor.blankScreen} />
      <ProctorCameraPreview
        stream={proctor.mediaStream}
        signals={proctor.behaviorSignals}
      />

      {hasStarted ? (
        <button
          type="button"
          onClick={handleExitQuiz}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Leave quiz
        </button>
      ) : (
        <Link
          href={chapterHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to Chapter
        </Link>
      )}

      {!hasStarted ? (
        <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-[#E8EEFF]/90 bg-white p-8 text-center shadow-[0_10px_30px_-18px_rgba(65,105,225,0.18)]">
          <p className="font-heading text-lg font-semibold text-foreground">
            {quiz.title}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Review the instructions, then start when you&apos;re ready.
          </p>
        </div>
      ) : question ? (
        <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-[#E8EEFF]/90 bg-white shadow-[0_10px_30px_-18px_rgba(65,105,225,0.18)]">
          <div className="relative overflow-hidden bg-linear-to-br from-[#4169E1] via-[#7c6ff0] to-[#9b8cf5] px-4 py-3.5 sm:px-5 sm:py-4">
            <div
              className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-white/10"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    Question {questionNumber} of {bankTotal}
                  </span>
                  {isRetry ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[11px] font-semibold text-amber-950">
                      <RotateCcw className="size-3" aria-hidden />
                      Retry
                    </span>
                  ) : null}
                  {timed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/90">
                      <Clock className="size-3" aria-hidden />
                      Time based
                    </span>
                  ) : null}
                  <ProctorStatusBadge
                    warningCount={proctor.warningCount}
                    warningLimit={proctor.warningLimit}
                  />
                </div>
                <h1 className="mt-2 truncate font-heading text-base leading-snug font-semibold text-white sm:text-lg">
                  {quiz.title}
                </h1>
              </div>

              {timed && secondsLeft !== null ? (
                <QuizTimerBadge
                  secondsLeft={secondsLeft}
                  label={timerLabel}
                  paused={timerPaused}
                />
              ) : null}
            </div>

            <div
              className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/20"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-white/90 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div
            className={cn(
              "px-4 py-5 sm:px-5 sm:py-6",
              proctor.isMonitoring && "select-none"
            )}
          >
            <div className="note-student-preview font-heading">
              <RichTextContent
                html={question.question}
                structured
                studentPreview
                previewBlock="heading"
              />
            </div>

            <div
              className="mt-5 space-y-2.5"
              role="radiogroup"
              aria-label="Answer choices"
            >
              {question.options.map((option) => {
                const selected = selectedOptionId === option.id
                const letter = optionDisplayLabel(option.id)
                const showCorrect =
                  feedbackOpen &&
                  feedbackCorrect === true &&
                  option.id === question.correctOptionId
                const showWrong =
                  feedbackOpen && feedbackCorrect === false && selected

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={feedbackOpen}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 text-left transition-all sm:px-4",
                      "bg-[#F5F7FF] ring-1 ring-[#E8EEFF]",
                      !feedbackOpen && "hover:bg-[#F0EEFF]",
                      selected &&
                        !feedbackOpen &&
                        "bg-[#F0EEFF] shadow-sm ring-2 ring-[#4169E1] ring-offset-0",
                      showCorrect && "bg-emerald-50 ring-2 ring-emerald-500",
                      showWrong && "bg-red-50 ring-2 ring-red-400",
                      feedbackOpen && "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                        showCorrect
                          ? "bg-emerald-500 text-white"
                          : showWrong
                            ? "bg-red-500 text-white"
                            : selected
                              ? "bg-[#4169E1] text-white"
                              : "bg-white text-[#4169E1] ring-1 ring-[#E4E9F5]"
                      )}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-medium text-foreground sm:text-[15px]">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {feedbackOpen ? (
              <QuizAnswerFeedback
                isCorrect={feedbackCorrect === true}
                isRetryScheduled={retryScheduled}
                hint={softHint}
                hintLoading={hintLoading}
                hintError={hintError}
              />
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EEF1F8] pt-5">
              {feedbackOpen ? (
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={
                    isSubmitting || (feedbackCorrect === false && hintLoading)
                  }
                  className="h-10 rounded-xl bg-[#FF8A3D] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] hover:bg-[#E8722A] active:bg-[#D96A20] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOptionId || isSubmitting}
                  className="h-10 gap-1.5 rounded-xl bg-[#FF8A3D] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(255,138,61,0.8)] hover:bg-[#E8722A] active:bg-[#D96A20] disabled:opacity-50"
                >
                  <Check className="size-4" aria-hidden />
                  Check answer
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
