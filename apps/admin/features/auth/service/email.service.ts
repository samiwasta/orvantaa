import { render } from "@react-email/render"
import _PasswordResetEmail from "@workspace/transactional/emails/password-reset"

import { type EmailProvider, emailProvider } from "@/lib/email"

// Handle CJS/ESM interop: tsx scripts resolve the default export as `.default`
// while Next.js bundler resolves it directly.

const PasswordResetEmail: typeof _PasswordResetEmail =
  typeof _PasswordResetEmail === "function"
    ? _PasswordResetEmail
    : (_PasswordResetEmail as any).default

export class AuthEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetUrl: string
  ): Promise<void> {
    const html = await render(PasswordResetEmail({ firstName, resetUrl }))

    await this.provider.send({
      to,
      subject: "Reset your Orvantaa password",
      html,
    })
  }
}

export const authEmailService = new AuthEmailService()
