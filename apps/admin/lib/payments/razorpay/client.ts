import { getRazorpayConfig } from "./config"
import {
  mapWebhookEventToStatus,
  recordFromRazorpayPaymentEntity,
  recordFromRazorpayOrderEntity,
} from "./map-payment"
import type {
  RazorpayPaymentRecord,
  RazorpayPaymentsClient,
} from "./types"

class StubRazorpayPaymentsClient implements RazorpayPaymentsClient {
  isConfigured(): boolean {
    return false
  }

  async fetchPaymentsForSchool(_schoolId: string): Promise<RazorpayPaymentRecord[]> {
    return []
  }
}

class LiveRazorpayPaymentsClient implements RazorpayPaymentsClient {
  private readonly keyId: string
  private readonly keySecret: string

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId
    this.keySecret = keySecret
  }

  isConfigured(): boolean {
    return true
  }

  private authHeader(): string {
    const token = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")
    return `Basic ${token}`
  }

  async fetchPaymentsForSchool(schoolId: string): Promise<RazorpayPaymentRecord[]> {
    const url = new URL("https://api.razorpay.com/v1/payments")
    url.searchParams.set("count", "100")

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `[Razorpay] Failed to fetch payments (${response.status}): ${body.slice(0, 200)}`
      )
    }

    const data = (await response.json()) as {
      items?: Array<{
        id: string
        order_id?: string
        amount?: number
        currency?: string
        status?: string
        method?: string
        created_at?: number
        invoice_id?: string
        notes?: Record<string, string>
      }>
    }

    const records: RazorpayPaymentRecord[] = []
    for (const item of data.items ?? []) {
      const record = recordFromRazorpayPaymentEntity(item)
      if (!record) continue
      if (!record.schoolId) continue
      if (record.schoolId !== schoolId) continue
      records.push({ ...record, schoolId })
    }

    return records.sort(
      (a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()
    )
  }
}

let clientInstance: RazorpayPaymentsClient | null = null

export function getRazorpayPaymentsClient(): RazorpayPaymentsClient {
  if (clientInstance) return clientInstance

  const config = getRazorpayConfig()
  clientInstance = config.enabled
    ? new LiveRazorpayPaymentsClient(config.keyId, config.keySecret)
    : new StubRazorpayPaymentsClient()

  return clientInstance
}

export function parseRazorpayWebhookPayments(
  body: unknown
): RazorpayPaymentRecord[] {
  if (!body || typeof body !== "object") return []

  const event = (body as { event?: string }).event ?? ""
  const payload = (body as { payload?: Record<string, unknown> }).payload ?? {}

  const paymentEntity = (
    payload.payment as { entity?: Record<string, unknown> } | undefined
  )?.entity
  const orderEntity = (payload.order as { entity?: Record<string, unknown> } | undefined)
    ?.entity

  const records: RazorpayPaymentRecord[] = []

  if (paymentEntity) {
    const record = recordFromRazorpayPaymentEntity(
      paymentEntity as Parameters<typeof recordFromRazorpayPaymentEntity>[0]
    )
    if (record) {
      const status = mapWebhookStatusFromEvent(event, record.status)
      records.push({ ...record, status })
    }
  }

  if (orderEntity && records.length === 0) {
    const record = recordFromRazorpayOrderEntity(
      orderEntity as Parameters<typeof recordFromRazorpayOrderEntity>[0]
    )
    if (record) {
      const status = mapWebhookStatusFromEvent(event, record.status)
      records.push({ ...record, status })
    }
  }

  return records
}

function mapWebhookStatusFromEvent(
  event: string,
  fallback: RazorpayPaymentRecord["status"]
): RazorpayPaymentRecord["status"] {
  if (!event) return fallback
  return mapWebhookEventToStatus(event)
}
