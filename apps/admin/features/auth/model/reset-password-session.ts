export const RESET_PASSWORD_SUCCESS_KEY = "orvantaa:reset-password-success"

export function markResetPasswordSuccess(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(RESET_PASSWORD_SUCCESS_KEY, "1")
}

export function hasResetPasswordSuccess(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(RESET_PASSWORD_SUCCESS_KEY) === "1"
}

export function clearResetPasswordSuccess(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(RESET_PASSWORD_SUCCESS_KEY)
}
