import { jwtVerify, SignJWT } from "jose"

import type { AppUserRole } from "@/features/user/model/user"

import {
  AUTH_COOKIE_MAX_AGE_DEFAULT_SEC,
  AUTH_COOKIE_MAX_AGE_REMEMBER_SEC,
} from "./constants"

export type AccessTokenPayload = {
  sub: string
  username: string
  role: AppUserRole
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return new TextEncoder().encode(secret)
}

function getJwtExpiresInSeconds(rememberMe = false): number {
  if (rememberMe) {
    return AUTH_COOKIE_MAX_AGE_REMEMBER_SEC
  }
  const fromEnv = process.env.JWT_EXPIRES_IN_SECONDS
  if (fromEnv) {
    const parsed = Number.parseInt(fromEnv, 10)
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return AUTH_COOKIE_MAX_AGE_DEFAULT_SEC
}

export async function signAccessToken(
  payload: AccessTokenPayload,
  rememberMe = false
): Promise<string> {
  const expiresInSec = getJwtExpiresInSeconds(rememberMe)

  return new SignJWT({
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSec}s`)
    .sign(getJwtSecret())
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret())

  const sub = payload.sub
  const username = payload.username
  const role = payload.role

  if (
    typeof sub !== "string" ||
    typeof username !== "string" ||
    (role !== "admin" && role !== "student")
  ) {
    throw new Error("Invalid token payload")
  }

  return { sub, username, role }
}

export function getTokenMaxAgeSeconds(rememberMe = false): number {
  return getJwtExpiresInSeconds(rememberMe)
}
