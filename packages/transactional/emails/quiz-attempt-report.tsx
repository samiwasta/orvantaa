import * as React from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "react-email"

type QuizAttemptReportEmailProps = {
  firstName: string
  quizTitle: string
  subjectName: string
  outcome: "completed" | "terminated"
  scorePercent: number | null
  warningCount: number
  warningLimit: number
  sessionUrl: string
  helpUrl: string
}

export default function QuizAttemptReportEmail({
  firstName = "there",
  quizTitle = "Chapter Quiz",
  subjectName = "Subject",
  outcome = "completed",
  scorePercent = 80,
  warningCount = 0,
  warningLimit = 3,
  sessionUrl = "https://app.orvantaa.com/quiz-session/example",
  helpUrl = "https://app.orvantaa.com/help",
}: QuizAttemptReportEmailProps) {
  const logoBaseUrl = "https://app.orvantaa.com"
  const blocked = outcome === "terminated"
  const preview = blocked
    ? `Your attempt for ${quizTitle} was blocked by proctoring`
    : `Your quiz report for ${quizTitle} is ready`

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Section style={outerSection}>
          <Container style={container}>
            <Section style={logoSection}>
              <Img
                src={`${logoBaseUrl}/orvantaa-logo.png`}
                alt="Orvantaa"
                width="132"
                height="34"
                style={logo}
              />
            </Section>
            <Heading style={heading}>
              {blocked ? "Quiz attempt blocked" : "Quiz attempt completed"}
            </Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              {blocked
                ? `Your proctored attempt for `
                : `You finished your proctored attempt for `}
              <strong>{quizTitle}</strong> ({subjectName}).
              {blocked
                ? " The attempt was ended after the warning limit was reached."
                : " Here is your attempt summary and session proof."}
            </Text>

            <Section style={summaryBox}>
              <Text style={summaryLine}>
                <strong>Outcome:</strong>{" "}
                {blocked ? "Blocked by proctoring" : "Completed"}
              </Text>
              {scorePercent !== null ? (
                <Text style={summaryLine}>
                  <strong>Score:</strong> {scorePercent}%
                </Text>
              ) : null}
              <Text style={summaryLine}>
                <strong>Proctor warnings:</strong> {warningCount} /{" "}
                {warningLimit}
              </Text>
            </Section>

            <Text style={text}>
              Open your session report for a full timeline of proctoring events.
              You can share this link with Support if you want to raise a
              complaint — it works as proof of the attempt.
            </Text>

            <Section style={buttonSection}>
              <Button href={sessionUrl} style={button}>
                View session report
              </Button>
            </Section>

            <Text style={muted}>
              Session link:{" "}
              <a href={sessionUrl} style={link}>
                {sessionUrl}
              </a>
            </Text>

            <Text style={text}>
              Need help? Visit{" "}
              <a href={helpUrl} style={link}>
                Help and Support
              </a>{" "}
              and include this session link in your ticket.
            </Text>

            <Hr style={hr} />
            <Text style={footer}>© {new Date().getFullYear()} Orvantaa</Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: "#F3F3FF",
  margin: "0",
  padding: "0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const outerSection = { width: "100%", padding: "24px 12px" }

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "520px",
  boxSizing: "border-box" as const,
}

const logoSection = { textAlign: "center" as const, marginBottom: "20px" }
const logo = { margin: "0 auto" }

const heading = {
  color: "#1f2937",
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "30px",
  margin: "0 0 20px",
}

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 16px",
}

const muted = {
  ...text,
  color: "#6b7280",
  fontSize: "13px",
  wordBreak: "break-all" as const,
}

const summaryBox = {
  backgroundColor: "#F7F6FF",
  borderRadius: "10px",
  padding: "14px 16px",
  margin: "0 0 20px",
}

const summaryLine = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 6px",
}

const buttonSection = { textAlign: "center" as const, margin: "28px 0" }

const button = {
  backgroundColor: "#6C5CE7",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  width: "100%",
  maxWidth: "280px",
  boxSizing: "border-box" as const,
  padding: "12px 20px",
  textDecoration: "none",
  display: "inline-block",
}

const link = { color: "#6C5CE7", textDecoration: "underline" }

const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" }

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
}
