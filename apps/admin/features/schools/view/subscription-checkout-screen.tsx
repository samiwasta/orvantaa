"use client"

import { Button } from "@workspace/ui/components/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

import type { SubscriptionCheckoutScreenProps } from "./subscription-checkout-types"

export function SubscriptionCheckoutScreen({
  session,
}: SubscriptionCheckoutScreenProps) {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCheckout = useCallback(async () => {
    if (!window.Razorpay) {
      setError("Payment checkout is still loading. Try again in a moment.")
      return
    }

    setPending(true)
    setError(null)

    const checkout = new window.Razorpay({
      key: session.keyId,
      subscription_id: session.subscriptionId,
      name: "Orvantaa",
      description: session.planName,
      image: `${window.location.origin}/orvantaa-logo.png`,
      callback_url: session.callbackUrl,
      prefill: session.prefill,
      theme: {
        color: "#6366f1",
      },
      handler: async (response) => {
        try {
          const verifyResponse = await fetch("/api/subscriptions/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          })

          if (!verifyResponse.ok) {
            const payload = (await verifyResponse.json().catch(() => null)) as
              | { error?: string }
              | null
            throw new Error(payload?.error ?? "Payment verification failed.")
          }

          router.push(session.callbackUrl)
        } catch (verifyError) {
          setPending(false)
          setError(
            verifyError instanceof Error
              ? verifyError.message
              : "Payment verification failed."
          )
        }
      },
    })

    checkout.on("payment.failed", () => {
      setPending(false)
      setError("Payment failed. Please try again or use a different method.")
    })

    checkout.open()
    setPending(false)
  }, [router, session])

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f4f4f8] px-4 py-10">
        <div className="w-full max-w-[440px] rounded-2xl border border-border/60 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/orvantaa-logo.png"
              alt="Orvantaa"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
              Complete subscription setup
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Authorize monthly billing for {session.schoolName}
            </p>
          </div>

          <dl className="space-y-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="text-right font-medium text-foreground">
                {session.planName}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Monthly amount</dt>
              <dd className="text-right font-medium text-foreground">
                {session.amountLabel}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Subscription</dt>
              <dd className="text-right font-mono text-xs text-foreground">
                {session.subscriptionId}
              </dd>
            </div>
          </dl>

          {session.statusMessage ? (
            <p
              role="status"
              className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900"
            >
              {session.statusMessage}
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          {session.status === "ready" ? (
            <Button
              type="button"
              className="mt-6 h-11 w-full rounded-lg"
              disabled={!scriptReady || pending}
              onClick={() => void openCheckout()}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Opening checkout…
                </>
              ) : (
                "Pay with Razorpay"
              )}
            </Button>
          ) : null}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Platform access activates after Razorpay confirms the first successful
            subscription payment.
          </p>
        </div>
      </div>
    </>
  )
}
