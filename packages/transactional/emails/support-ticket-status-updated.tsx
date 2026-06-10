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

type SupportTicketStatusUpdatedEmailProps = {
  firstName: string
  ticketNumber: string
  statusLabel: string
  adminNote: string | null
  trackUrl: string
}

export default function SupportTicketStatusUpdatedEmail({
  firstName = "there",
  ticketNumber = "ORV-000001",
  statusLabel = "In progress",
  adminNote = null,
  trackUrl = "https://app.orvantaa.com/help/tickets/example",
}: SupportTicketStatusUpdatedEmailProps) {
  const logoBaseUrl = "https://app.orvantaa.com"

  return (
    <Html>
      <Head />
      <Preview>Ticket {ticketNumber} is now {statusLabel}</Preview>
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
            <Heading style={heading}>Ticket status updated</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Your support ticket <strong>{ticketNumber}</strong> is now{" "}
              <strong>{statusLabel}</strong>.
            </Text>
            {adminNote ? (
              <Section style={noteBox}>
                <Text style={noteLabel}>Team note</Text>
                <Text style={noteText}>{adminNote}</Text>
              </Section>
            ) : null}
            <Section style={buttonSection}>
              <Button href={trackUrl} style={button}>
                View ticket details
              </Button>
            </Section>
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

const noteBox = {
  backgroundColor: "#f5f3ff",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "0 0 16px",
}

const noteLabel = {
  color: "#6C5CE7",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  margin: "0 0 6px",
}

const noteText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
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

const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" }

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
}
