import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import type { AccessTokenPayload } from "./jwt"
import { AUTH_COOKIE_NAME } from "./constants"

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE_NAME)
}

export function forbiddenAuthResponse(
  request: NextRequest,
  options?: { clearCookie?: boolean; token?: string }
): NextResponse {
  const { pathname } = request.nextUrl

  const response = pathname.startsWith("/api/")
    ? NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      )
    : NextResponse.redirect(
        new URL("/auth?reason=forbidden", request.url)
      )

  if (options?.clearCookie && options.token) {
    clearAuthCookie(response)
  }

  return response
}

export function isAdminSession(
  session: AccessTokenPayload | null
): session is AccessTokenPayload {
  return session?.role === "admin"
}
