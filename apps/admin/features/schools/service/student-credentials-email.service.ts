import { render } from "@react-email/render"
import _StudentCredentialsEmail from "@workspace/transactional/emails/student-credentials"

import { type EmailProvider, emailProvider } from "@/lib/email"

import { formatStudentDisplayCode } from "../model/school-student-list-item"

const StudentCredentialsEmail: typeof _StudentCredentialsEmail =
  typeof _StudentCredentialsEmail === "function"
    ? _StudentCredentialsEmail
    : (_StudentCredentialsEmail as { default: typeof _StudentCredentialsEmail })
        .default

function studentLoginUrl(): string {
  const base =
    process.env.STUDENT_APP_URL ??
    process.env.NEXT_PUBLIC_STUDENT_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  return `${base.replace(/\/$/, "")}/auth`
}

export type StudentCredentialEmailPayload = {
  to: string
  firstName: string
  username: string
  plainPassword: string
  studentCode: string | null
  userId: string
}

export class StudentCredentialsEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendCredentials(payload: StudentCredentialEmailPayload): Promise<void> {
    const studentCode = formatStudentDisplayCode(
      payload.studentCode,
      payload.username,
      payload.userId
    )
    const html = await render(
      StudentCredentialsEmail({
        firstName: payload.firstName,
        loginUrl: studentLoginUrl(),
        username: payload.username,
        password: payload.plainPassword,
        studentCode,
      })
    )

    await this.provider.send({
      to: payload.to,
      subject: "Your Orvantaa student account",
      html,
    })
  }
}

export const studentCredentialsEmailService = new StudentCredentialsEmailService()
