import { cache } from "react"

import { getAuthSession } from "@/features/auth/server/get-auth-session"

import { PROCTOR_WARNING_LIMIT } from "../model/proctor-rules"
import type { ProctorLockState } from "../model/proctor-session"
import { proctorService } from "../service/proctor.service"

const UNLOCKED: ProctorLockState = {
  locked: false,
  warningCount: 0,
  warningLimit: PROCTOR_WARNING_LIMIT,
  terminatedAt: null,
}

export const loadQuizProctorLock = cache(
  async (quizId: string): Promise<ProctorLockState> => {
    const session = await getAuthSession()
    if (!session) return UNLOCKED

    return proctorService.getQuizLock(session.sub, quizId)
  }
)
