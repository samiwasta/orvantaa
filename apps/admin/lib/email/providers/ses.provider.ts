/**
 * AWS SES provider — plug in when migrating from Resend.
 *
 * Install the required SDK before using:
 *   pnpm add @aws-sdk/client-ses
 *
 * Then replace this stub with the real implementation:
 *
 * import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
 *
 * export class SESEmailProvider implements EmailProvider {
 *   private client = new SESClient({ region: process.env.AWS_REGION })
 *
 *   async send(options: SendEmailOptions): Promise<SendEmailResult> {
 *     const cmd = new SendEmailCommand({
 *       Destination: { ToAddresses: Array.isArray(options.to) ? options.to : [options.to] },
 *       Message: {
 *         Subject: { Data: options.subject },
 *         Body: { Html: { Data: options.html } },
 *       },
 *       Source: options.from ?? process.env.EMAIL_FROM ?? "noreply@orvantaa.com",
 *     })
 *     const result = await this.client.send(cmd)
 *     return { id: result.MessageId ?? "" }
 *   }
 * }
 */

import type { EmailProvider, SendEmailOptions, SendEmailResult } from "../types"

export class SESEmailProvider implements EmailProvider {
  async send(_options: SendEmailOptions): Promise<SendEmailResult> {
    throw new Error(
      "SESEmailProvider is not yet configured. See the stub in lib/email/providers/ses.provider.ts."
    )
  }
}
