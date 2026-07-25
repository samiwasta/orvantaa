import type { ProctorViolationKind } from "../model/proctor-rules"
import type {
  ProctorEndReason,
  ProctorLockState,
  ProctorSessionState,
  ProctorViolationResult,
} from "../model/proctor-session"

const fetchOptions: RequestInit = {
  credentials: "same-origin",
}

const PROCTOR_ENDPOINT = "/api/quiz-attempts/proctor"

export type StartProctorSessionResult = {
  session: ProctorSessionState | null
  lock: ProctorLockState | null
  resumeWarning: ProctorViolationResult | null
}

export async function startProctorSession(
  quizId: string
): Promise<StartProctorSessionResult> {
  const response = await fetch(PROCTOR_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizId }),
    ...fetchOptions,
  })

  const payload = (await response.json().catch(() => null)) as
    | (StartProctorSessionResult & { error?: string })
    | null

  // Locked quizzes return HTTP 423 with a lock payload — treat that as success.
  if (payload?.lock?.locked) {
    return {
      session: null,
      lock: payload.lock,
      resumeWarning: null,
    }
  }

  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? "Could not start the proctored attempt.")
  }

  return {
    session: payload.session ?? null,
    lock: payload.lock ?? null,
    resumeWarning: payload.resumeWarning ?? null,
  }
}

export async function reportProctorViolation(
  sessionId: string,
  input: {
    kind: ProctorViolationKind
    questionIndex?: number
    detail?: string
  }
): Promise<ProctorViolationResult> {
  const response = await fetch(
    `${PROCTOR_ENDPOINT}/${encodeURIComponent(sessionId)}/violations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "same-origin",
    }
  )

  const payload = (await response.json().catch(() => null)) as {
    violation?: ProctorViolationResult
    error?: string
  } | null

  if (!response.ok || !payload?.violation) {
    throw new Error(payload?.error ?? "Could not record proctoring activity.")
  }

  return payload.violation
}

export async function endProctorSession(
  sessionId: string,
  reason: ProctorEndReason
): Promise<void> {
  await fetch(`${PROCTOR_ENDPOINT}/${encodeURIComponent(sessionId)}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
    keepalive: true,
    ...fetchOptions,
  }).catch(() => null)
}
