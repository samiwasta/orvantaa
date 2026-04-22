export const FORGOT_PASSWORD_LINK_SENT_KEY =
  "orvantaa:forgot-password-link-sent"

export function markForgotPasswordLinkSent(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(FORGOT_PASSWORD_LINK_SENT_KEY, "1")
}

export function hasForgotPasswordLinkSent(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(FORGOT_PASSWORD_LINK_SENT_KEY) === "1"
}

export function clearForgotPasswordLinkSent(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(FORGOT_PASSWORD_LINK_SENT_KEY)
}
