export type RazorpayConfig = {
  keyId: string
  keySecret: string
  webhookSecret: string | null
  enabled: boolean
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? ""
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? ""
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || null
  const explicitEnabled = process.env.RAZORPAY_ENABLED?.trim().toLowerCase()

  const hasCredentials = Boolean(keyId && keySecret)
  const enabled =
    explicitEnabled === "true"
      ? hasCredentials
      : explicitEnabled === "false"
        ? false
        : hasCredentials

  return {
    keyId,
    keySecret,
    webhookSecret,
    enabled,
  }
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayConfig().enabled
}
