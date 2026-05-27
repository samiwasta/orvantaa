import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME } from "./constants"
import { type AccessTokenPayload, verifyAccessToken } from "./jwt"

export async function getAuthSession(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  try {
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

export async function requireAuthSession(): Promise<AccessTokenPayload> {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
