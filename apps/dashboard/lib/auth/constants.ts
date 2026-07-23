export const AUTH_COOKIE_NAME = "orvantaa_access_token"

export const SUBSCRIPTION_UNAVAILABLE_PATH = "/subscription-unavailable"

export const AUTH_COOKIE_MAX_AGE_DEFAULT_SEC = 60 * 60 * 24 * 7

export const AUTH_COOKIE_MAX_AGE_REMEMBER_SEC = 60 * 60 * 24 * 30

export const CHANGE_PASSWORD_PATH = "/auth/change-password"

export const ONBOARDING_PATH = "/onboarding"

/**
 * ONBOARDING_PROTECTED env toggle:
 * - "false" (dev): logged-in students can open /onboarding freely; incomplete users are not forced there.
 * - "true" (prod): incomplete students are forced through /onboarding; completed users cannot open it.
 */
export function isOnboardingProtected(): boolean {
  return process.env.ONBOARDING_PROTECTED === "true"
}
export const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/forgot-password",
  "/reset-password",
  SUBSCRIPTION_UNAVAILABLE_PATH,
] as const

export const AUTH_API_PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
] as const

export const ONBOARDING_API_PATH_PREFIX = "/api/onboarding"
