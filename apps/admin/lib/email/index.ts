import { ResendEmailProvider } from "./providers/resend.provider"
import { SESEmailProvider } from "./providers/ses.provider"
import type { EmailProvider } from "./types"

export type { EmailProvider, SendEmailOptions, SendEmailResult } from "./types"

type EmailProviderName = "resend" | "ses"

function createEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "resend") as EmailProviderName

  if (provider === "ses") {
    return new SESEmailProvider()
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set")
  }
  return new ResendEmailProvider(apiKey)
}

const globalForEmail = globalThis as unknown as {
  emailProvider: EmailProvider | undefined
}

export const emailProvider: EmailProvider =
  globalForEmail.emailProvider ?? createEmailProvider()

if (process.env.NODE_ENV !== "production") {
  globalForEmail.emailProvider = emailProvider
}
