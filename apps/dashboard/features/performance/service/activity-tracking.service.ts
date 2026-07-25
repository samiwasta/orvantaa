type SubmitQuizAttemptInput = {
  quizId: string
  answers: Array<{
    questionId: string
    optionId: string
  }>
  timeSpentSeconds?: number
  proctorSessionId?: string
}

type QuizAttemptResponse = {
  id: string
  scorePercent: number
  correctCount: number
  totalQuestions: number
  terminatedByProctor?: boolean
}

const fetchOptions: RequestInit = {
  credentials: "same-origin",
}

export async function submitQuizAttempt(
  input: SubmitQuizAttemptInput
): Promise<QuizAttemptResponse> {
  const response = await fetch("/api/quiz-attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    ...fetchOptions,
  })

  const payload = (await response.json().catch(() => null)) as {
    attempt?: QuizAttemptResponse
    error?: string
  } | null

  if (!response.ok || !payload?.attempt) {
    throw new Error(payload?.error ?? "Could not save quiz results.")
  }

  return payload.attempt
}

export async function trackNoteProgress(
  noteId: string,
  status: "VIEWED" | "COMPLETED"
) {
  const response = await fetch(`/api/notes/${noteId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    ...fetchOptions,
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(payload?.error ?? "Could not save note progress.")
  }
}
