import { render } from "@react-email/render"
import _QuizAttemptReportEmail from "@workspace/transactional/emails/quiz-attempt-report"

import { buildQuizSessionReportUrl, getStudentAppUrl } from "@/lib/app-urls"
import { type EmailProvider, emailProvider } from "@/lib/email"

const QuizAttemptReportEmail: typeof _QuizAttemptReportEmail =
  typeof _QuizAttemptReportEmail === "function"
    ? _QuizAttemptReportEmail
    : (_QuizAttemptReportEmail as { default: typeof _QuizAttemptReportEmail })
        .default

type SendQuizAttemptReportInput = {
  to: string
  firstName: string
  quizTitle: string
  subjectName: string
  outcome: "completed" | "terminated"
  scorePercent: number
  warningCount: number
  warningLimit: number
  reportToken: string
}

export class QuizAttemptEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendAttemptReportEmail(
    input: SendQuizAttemptReportInput
  ): Promise<void> {
    const sessionUrl = buildQuizSessionReportUrl(input.reportToken)
    const helpUrl = `${getStudentAppUrl()}/help`

    const html = await render(
      QuizAttemptReportEmail({
        firstName: input.firstName,
        quizTitle: input.quizTitle,
        subjectName: input.subjectName,
        outcome: input.outcome,
        scorePercent: input.scorePercent,
        warningCount: input.warningCount,
        warningLimit: input.warningLimit,
        sessionUrl,
        helpUrl,
      })
    )

    await this.provider.send({
      to: input.to,
      subject:
        input.outcome === "terminated"
          ? `Quiz blocked: ${input.quizTitle}`
          : `Quiz completed: ${input.quizTitle}`,
      html,
    })
  }
}

export const quizAttemptEmailService = new QuizAttemptEmailService()
