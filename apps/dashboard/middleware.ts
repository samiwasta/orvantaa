import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  AUTH_API_PUBLIC_PATHS,
  AUTH_COOKIE_NAME,
  CHANGE_PASSWORD_PATH,
  ONBOARDING_API_PATH_PREFIX,
  ONBOARDING_PATH,
  PUBLIC_PATH_PREFIXES,
  SUBSCRIPTION_UNAVAILABLE_PATH,
} from "@/lib/auth/constants"
import { verifyAccessToken } from "@/lib/auth/jwt"
import {
  clearAuthCookie,
  forbiddenAuthResponse,
  isStudentSession,
  sessionMustChangePassword,
  sessionNeedsOnboarding,
} from "@/lib/auth/middleware-auth"

function readOnboardingProtected(): boolean {
  return process.env.ONBOARDING_PROTECTED === "true"
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function isAuthApiPublicPath(pathname: string): boolean {
  return AUTH_API_PUBLIC_PATHS.some((path) => pathname === path)
}

function isChangePasswordPath(pathname: string): boolean {
  return (
    pathname === CHANGE_PASSWORD_PATH ||
    pathname.startsWith(`${CHANGE_PASSWORD_PATH}/`)
  )
}

function isChangePasswordApiPath(pathname: string): boolean {
  return pathname === "/api/auth/change-password"
}

function isOnboardingPath(pathname: string): boolean {
  return (
    pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`)
  )
}

function isOnboardingApiPath(pathname: string): boolean {
  return (
    pathname === ONBOARDING_API_PATH_PREFIX ||
    pathname.startsWith(`${ONBOARDING_API_PATH_PREFIX}/`)
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isAuthApiPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  let session: Awaited<ReturnType<typeof verifyAccessToken>> | null = null

  if (token) {
    try {
      session = await verifyAccessToken(token)
    } catch {
      session = null
    }
  }

  const onboardingProtected = readOnboardingProtected()
  const mustChangePassword =
    isStudentSession(session) && sessionMustChangePassword(session)
  const needsOnboarding =
    onboardingProtected &&
    isStudentSession(session) &&
    sessionNeedsOnboarding(session)

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(
        isStudentSession(session)
          ? mustChangePassword
            ? CHANGE_PASSWORD_PATH
            : needsOnboarding
              ? ONBOARDING_PATH
              : "/dashboard"
          : "/auth",
        request.url
      )
    )
  }

  if (session && isPublicPath(pathname)) {
    if (!isStudentSession(session)) {
      return forbiddenAuthResponse(request, { clearCookie: true, token })
    }
    if (
      pathname === SUBSCRIPTION_UNAVAILABLE_PATH ||
      pathname.startsWith(`${SUBSCRIPTION_UNAVAILABLE_PATH}/`)
    ) {
      return NextResponse.next()
    }
    if (mustChangePassword) {
      if (isChangePasswordPath(pathname)) {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url))
    }
    if (isChangePasswordPath(pathname)) {
      return NextResponse.redirect(
        new URL(needsOnboarding ? ONBOARDING_PATH : "/dashboard", request.url)
      )
    }
    if (pathname === "/auth" || pathname.startsWith("/auth/")) {
      return NextResponse.redirect(
        new URL(needsOnboarding ? ONBOARDING_PATH : "/dashboard", request.url)
      )
    }
    return NextResponse.redirect(
      new URL(needsOnboarding ? ONBOARDING_PATH : "/dashboard", request.url)
    )
  }

  const isProtected =
    !isPublicPath(pathname) &&
    !pathname.startsWith("/_next") &&
    !isAuthApiPublicPath(pathname)

  if (!session && isProtected) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    }

    const response = NextResponse.redirect(new URL("/auth", request.url))
    if (token) {
      clearAuthCookie(response)
    }
    return response
  }

  if (session && isProtected && !isStudentSession(session)) {
    return forbiddenAuthResponse(request, { clearCookie: true, token })
  }

  if (mustChangePassword && isProtected) {
    if (isChangePasswordApiPath(pathname)) {
      return NextResponse.next()
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Password change required." },
        { status: 403 }
      )
    }
    if (!isChangePasswordPath(pathname)) {
      return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url))
    }
  }

  if (needsOnboarding && isProtected) {
    if (isOnboardingApiPath(pathname)) {
      return NextResponse.next()
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Onboarding required." },
        { status: 403 }
      )
    }
    if (!isOnboardingPath(pathname)) {
      return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url))
    }
  }

  // When protected, completed / school students cannot open /onboarding.
  // When false (dev), any logged-in student can open it to build the feature.
  if (
    onboardingProtected &&
    isStudentSession(session) &&
    !sessionNeedsOnboarding(session) &&
    isOnboardingPath(pathname)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
