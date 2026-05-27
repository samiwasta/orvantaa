export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export type SendEmailResult = {
  id: string
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<SendEmailResult>
}
