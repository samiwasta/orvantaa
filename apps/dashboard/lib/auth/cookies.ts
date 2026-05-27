import type { NextResponse } from "next/server"

import {
  AUTH_COOKIE_MAX_AGE_DEFAULT_SEC,
  AUTH_COOKIE_MAX_AGE_REMEMBER_SEC,
  AUTH_COOKIE_NAME,
} from "./constants"
import { getTokenMaxAgeSeconds } from "./jwt"

export function setAuthCookie(
  response: NextResponse,
  token: string,
  rememberMe = false
): void {
  const maxAge = getTokenMaxAgeSeconds(rememberMe)

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export {
  AUTH_COOKIE_MAX_AGE_DEFAULT_SEC,
  AUTH_COOKIE_MAX_AGE_REMEMBER_SEC,
  AUTH_COOKIE_NAME,
}
