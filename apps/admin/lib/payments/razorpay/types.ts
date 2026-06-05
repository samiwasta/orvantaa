export type RazorpayPaymentStatus = "due" | "success" | "failed" | "late" | "pending"

export type RazorpayPaymentRecord = {
  transactionId: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  transactionDate: Date
  serviceName: string
  paymentMethod: string | null
  amountPaise: number | null
  currency: string
  status: RazorpayPaymentStatus
  invoiceUrl: string | null
  schoolId: string | null
}

export type RazorpayWebhookEvent = {
  event: string
  payload: {
    payment?: {
      entity?: {
        id?: string
        order_id?: string
        amount?: number
        currency?: string
        status?: string
        method?: string
        created_at?: number
        invoice_id?: string
        notes?: Record<string, string>
        error_description?: string
      }
    }
    order?: {
      entity?: {
        id?: string
        amount?: number
        currency?: string
        status?: string
        notes?: Record<string, string>
      }
    }
  }
}

export interface RazorpayPaymentsClient {
  isConfigured(): boolean
  fetchPaymentsForSchool(schoolId: string): Promise<RazorpayPaymentRecord[]>
}
