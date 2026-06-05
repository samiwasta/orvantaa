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

export type SubscriptionPaymentEmailKind =
  | "due"
  | "success"
  | "failed"
  | "late"

type SubscriptionPaymentEmailProps = {
  schoolName: string
  kind: SubscriptionPaymentEmailKind
  transactionId: string
  serviceName: string
  amountLabel: string | null
  transactionDate: string
  paymentMethod: string | null
  invoiceUrl: string | null
  portalUrl: string
}

const copyByKind: Record<
  SubscriptionPaymentEmailKind,
  { preview: string; heading: string; body: string; cta: string }
> = {
  due: {
    preview: "Payment due for your Orvantaa subscription",
    heading: "Subscription payment due",
    body: "Your subscription payment is due. Please complete the payment to keep platform access active for your school.",
    cta: "Pay now",
  },
  success: {
    preview: "Payment received for your Orvantaa subscription",
    heading: "Payment successful",
    body: "We have received your subscription payment. Thank you for continuing with Orvantaa.",
    cta: "View invoice",
  },
  failed: {
    preview: "Subscription payment failed",
    heading: "Payment failed",
    body: "Your recent subscription payment could not be processed. Please retry or use a different payment method.",
    cta: "Retry payment",
  },
  late: {
    preview: "Subscription payment overdue",
    heading: "Payment overdue",
    body: "Your subscription payment is overdue. Please pay as soon as possible to avoid interruption of service.",
    cta: "Pay now",
  },
}

export default function SubscriptionPaymentEmail({
  schoolName = "Your school",
  kind = "due",
  transactionId = "txn_example",
  serviceName = "Orvantaa Platform Subscription",
  amountLabel = "₹0.00",
  transactionDate = "—",
  paymentMethod = null,
  invoiceUrl = null,
  portalUrl = "https://app.orvantaa.com",
}: SubscriptionPaymentEmailProps) {
  const copy = copyByKind[kind]
  const logoBaseUrl = "https://app.orvantaa.com"
  const actionUrl = invoiceUrl ?? portalUrl

  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
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
            <Heading style={heading}>{copy.heading}</Heading>
            <Text style={text}>Hi {schoolName},</Text>
            <Text style={text}>{copy.body}</Text>
            <Section style={detailsBox}>
              <Text style={detailLine}>
                <strong>Transaction ID:</strong> {transactionId}
              </Text>
              <Text style={detailLine}>
                <strong>Service:</strong> {serviceName}
              </Text>
              {amountLabel ? (
                <Text style={detailLine}>
                  <strong>Amount:</strong> {amountLabel}
                </Text>
              ) : null}
              <Text style={detailLine}>
                <strong>Date:</strong> {transactionDate}
              </Text>
              {paymentMethod ? (
                <Text style={detailLine}>
                  <strong>Payment method:</strong> {paymentMethod}
                </Text>
              ) : null}
            </Section>
            <Section style={buttonSection}>
              <Button href={actionUrl} style={button}>
                {copy.cta}
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

const detailsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 20px",
}

const detailLine = {
  color: "#1f2937",
  fontSize: "14px",
  lineHeight: "22px",
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
