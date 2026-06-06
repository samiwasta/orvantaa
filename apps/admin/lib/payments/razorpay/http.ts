import { getRazorpayConfig } from "./config"

export function razorpayAuthHeader(keyId: string, keySecret: string): string {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  return `Basic ${token}`
}

export async function razorpayRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
    body?: Record<string, unknown>
  } = {}
): Promise<T> {
  const config = getRazorpayConfig()
  if (!config.enabled) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    )
  }

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: razorpayAuthHeader(config.keyId, config.keySecret),
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `[Razorpay] ${options.method ?? "GET"} ${path} failed (${response.status}): ${errorBody.slice(0, 320)}`
    )
  }

  return (await response.json()) as T
}
