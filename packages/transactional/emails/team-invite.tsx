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

type TeamInviteEmailProps = {
  firstName: string
  roleLabel: string
  loginUrl: string
  resetUrl: string
  username: string
  password: string
}

export default function TeamInviteEmail({
  firstName = "there",
  roleLabel = "Admin",
  loginUrl = "https://admin.orvantaa.com/auth",
  resetUrl = "https://admin.orvantaa.com/reset-password?token=example",
  username = "user",
  password = "example-password",
}: TeamInviteEmailProps) {
  const logoBaseUrl = "https://app.orvantaa.com"

  return (
    <Html>
      <Head />
      <Preview>Your Orvantaa {roleLabel} account is ready</Preview>
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
            <Heading style={heading}>Welcome to Orvantaa</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              An {roleLabel.toLowerCase()} account has been created for you. Use
              the credentials below to sign in, then set your own password.
            </Text>
            <Section style={credentialsBox}>
              <Text style={credentialLine}>
                <strong>Username:</strong> {username}
              </Text>
              <Text style={credentialLine}>
                <strong>Temporary password:</strong> {password}
              </Text>
            </Section>
            <Section style={buttonSection}>
              <Button href={resetUrl} style={button}>
                Set your password
              </Button>
            </Section>
            <Section style={buttonSection}>
              <Button href={loginUrl} style={secondaryButton}>
                Sign in to Orvantaa
              </Button>
            </Section>
            <Text style={text}>
              For your security, use <strong>Set your password</strong> to choose
              a new password before your first sign-in. The reset link expires in{" "}
              <strong>1 hour</strong>.
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

const credentialsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 20px",
}

const credentialLine = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 8px",
}

const buttonSection = {
  textAlign: "center" as const,
  margin: "16px 0",
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

const secondaryButton = {
  ...button,
  backgroundColor: "#ffffff",
  color: "#6C5CE7",
  border: "1px solid #6C5CE7",
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
