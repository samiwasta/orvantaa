import { NextResponse } from "next/server"

import { toSafeAuthUser } from "@/features/auth/model/auth-session"
import { authUserRepository } from "@/features/auth/repository/auth-user.repository"
import { getAuthSession } from "@/lib/auth/session"

export async function GET() {
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  const user = await authUserRepository.findByUsernameOrEmail(session.username)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  return NextResponse.json({ user: toSafeAuthUser(user) })
}
