import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  AUTH_API_PUBLIC_PATHS,
  AUTH_COOKIE_NAME,
  PUBLIC_PATH_PREFIXES,
} from "@/lib/auth/constants"
import { verifyAccessToken } from "@/lib/auth/jwt"

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function isAuthApiPublicPath(pathname: string): boolean {
  return AUTH_API_PUBLIC_PATHS.some((path) => pathname === path)
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

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/auth", request.url)
    )
  }

  if (session && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
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
      response.cookies.delete(AUTH_COOKIE_NAME)
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
