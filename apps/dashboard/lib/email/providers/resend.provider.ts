import { Resend } from "resend"

import type { EmailProvider, SendEmailOptions, SendEmailResult } from "../types"

export class ResendEmailProvider implements EmailProvider {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const from =
      options.from ??
      process.env.EMAIL_FROM ??
      "Orvantaa <noreply@orvantaa.com>"

    const { data, error } = await this.client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    })

    if (error ?? !data) {
      throw new Error(
        `[Resend] Failed to send email: ${error?.message ?? "unknown error"}`
      )
    }

    return { id: data.id }
  }
}
