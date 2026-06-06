export type RazorpayCheckoutHandlerResponse = {
  razorpay_payment_id: string
  razorpay_subscription_id: string
  razorpay_signature: string
}

export type RazorpayCheckoutOptions = {
  key: string
  subscription_id: string
  name: string
  description: string
  image?: string
  callback_url?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  handler?: (response: RazorpayCheckoutHandlerResponse) => void | Promise<void>
}

export type RazorpayCheckoutInstance = {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}

export {}
