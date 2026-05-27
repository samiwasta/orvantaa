export const AUTH_COOKIE_NAME = "orvantaa_access_token"

export const AUTH_COOKIE_MAX_AGE_DEFAULT_SEC = 60 * 60 * 24 * 7

export const AUTH_COOKIE_MAX_AGE_REMEMBER_SEC = 60 * 60 * 24 * 30

export const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/forgot-password",
  "/reset-password",
] as const

export const AUTH_API_PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/forgot-password",
] as const
