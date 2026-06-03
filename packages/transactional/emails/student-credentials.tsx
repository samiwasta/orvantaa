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

type StudentCredentialsEmailProps = {
  firstName: string
  loginUrl: string
  username: string
  password: string
  studentCode: string
}

export default function StudentCredentialsEmail({
  firstName = "there",
  loginUrl = "https://app.orvantaa.com/auth",
  username = "student",
  password = "example-password",
  studentCode = "STU001",
}: StudentCredentialsEmailProps) {
  const logoBaseUrl = "https://app.orvantaa.com"

  return (
    <Html>
      <Head />
      <Preview>Your Orvantaa student account credentials</Preview>
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
            <Heading style={heading}>Your student account</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Your school has set up your Orvantaa account. Use the credentials
              below to sign in.
            </Text>
            <Section style={credentialsBox}>
              <Text style={credentialLine}>
                <strong>Student code:</strong> {studentCode}
              </Text>
              <Text style={credentialLine}>
                <strong>Username:</strong> {username}
              </Text>
              <Text style={credentialLine}>
                <strong>Password:</strong> {password}
              </Text>
            </Section>
            <Section style={buttonSection}>
              <Button href={loginUrl} style={button}>
                Sign in to Orvantaa
              </Button>
            </Section>
            <Text style={text}>
              For your security, change your password after your first login if
              your school allows it.
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
