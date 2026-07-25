import type { McqQuestion } from "./quiz-data"

export const QUIZ_RETRY_MIN_GAP = 3
export const QUIZ_RETRY_MAX_GAP = 6

export type QuizDeckEntry = {
  question: McqQuestion
  /** Stable original order for labels (1-based display from bank). */
  bankIndex: number
  isRetry: boolean
}

export type QuizRetryTicket = {
  entry: QuizDeckEntry
  /** Continues remaining before this retry is injected back into the queue. */
  delayLeft: number
}

export function buildInitialQuizDeck(
  questions: McqQuestion[]
): QuizDeckEntry[] {
  return questions.map((question, bankIndex) => ({
    question,
    bankIndex,
    isRetry: false,
  }))
}

export function randomRetryDelay(
  minGap = QUIZ_RETRY_MIN_GAP,
  maxGap = QUIZ_RETRY_MAX_GAP
): number {
  const min = Math.max(1, minGap)
  const max = Math.max(min, maxGap)
  return min + Math.floor(Math.random() * (max - min + 1))
}

/**
 * After the student continues past a checked question, tick pending retries and
 * append any that are due back onto the upcoming queue.
 */
export function advanceQuizLearningQueue(input: {
  upcoming: QuizDeckEntry[]
  pending: QuizRetryTicket[]
}): { upcoming: QuizDeckEntry[]; pending: QuizRetryTicket[] } {
  const pending = input.pending.map((ticket) => ({
    ...ticket,
    delayLeft: ticket.delayLeft - 1,
  }))

  const due = pending.filter((ticket) => ticket.delayLeft <= 0)
  const stillWaiting = pending.filter((ticket) => ticket.delayLeft > 0)

  return {
    upcoming: [...input.upcoming, ...due.map((ticket) => ticket.entry)],
    pending: stillWaiting,
  }
}

export function scheduleWrongAnswerRetry(input: {
  entry: QuizDeckEntry
  pending: QuizRetryTicket[]
  delay?: number
}): QuizRetryTicket[] {
  const delay = input.delay ?? randomRetryDelay()
  return [
    ...input.pending,
    {
      entry: {
        ...input.entry,
        isRetry: true,
      },
      delayLeft: delay,
    },
  ]
}

/** If the main queue is empty but retries remain, pull the soonest one early. */
export function pullNextLearningEntry(input: {
  upcoming: QuizDeckEntry[]
  pending: QuizRetryTicket[]
}): {
  next: QuizDeckEntry | null
  upcoming: QuizDeckEntry[]
  pending: QuizRetryTicket[]
  done: boolean
} {
  if (input.upcoming.length > 0) {
    const [next, ...rest] = input.upcoming
    return {
      next: next ?? null,
      upcoming: rest,
      pending: input.pending,
      done: false,
    }
  }

  if (input.pending.length === 0) {
    return { next: null, upcoming: [], pending: [], done: true }
  }

  const sorted = [...input.pending].sort((a, b) => a.delayLeft - b.delayLeft)
  const [first, ...rest] = sorted
  if (!first) {
    return { next: null, upcoming: [], pending: [], done: true }
  }

  return {
    next: first.entry,
    upcoming: [],
    pending: rest,
    done: false,
  }
}
