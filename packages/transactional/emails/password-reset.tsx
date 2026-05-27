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

type PasswordResetEmailProps = {
  firstName: string
  resetUrl: string
}

export default function PasswordResetEmail({
  firstName = "there",
  resetUrl = "https://app.orvantaa.com/reset-password?token=example",
}: PasswordResetEmailProps) {
  const logoBaseUrl = "https://app.orvantaa.com"

  return (
    <Html>
      <Head />
      <Preview>Reset your Orvantaa password</Preview>
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
          <Heading style={heading}>Reset your password</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            We received a request to reset your password for your Orvantaa
            account. Click the button below to choose a new password.
          </Text>
          <Section style={buttonSection}>
            <Button href={resetUrl} style={button}>
              Reset password
            </Button>
          </Section>
          <Text style={text}>
            This link expires in <strong>1 hour</strong>. If you did not request
            a password reset, you can safely ignore this email.
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

const outerSection = {
  width: "100%",
  padding: "24px 12px",
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "520px",
  boxSizing: "border-box" as const,
}

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
}

const logo = {
  margin: "0 auto",
}

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

const buttonSection = {
  textAlign: "center" as const,
  margin: "28px 0",
}

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

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0 16px",
}

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
}
