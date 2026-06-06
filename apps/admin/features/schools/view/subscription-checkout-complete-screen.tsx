"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const CLOSE_SECONDS = 10

type SubscriptionCheckoutCompleteScreenProps = {
  schoolName: string | null
}

export function SubscriptionCheckoutCompleteScreen({
  schoolName,
}: SubscriptionCheckoutCompleteScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(CLOSE_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.close()
      return
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f4f4f8] px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl border border-border/60 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-10">
        <Image
          src="/orvantaa-logo.png"
          alt="Orvantaa"
          width={140}
          height={36}
          className="mx-auto h-8 w-auto object-contain"
          priority
        />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
          Congratulations!
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {schoolName
            ? `Your subscription for ${schoolName} has been received.`
            : "Your subscription has been received."}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Student platform access will be activated soon once payment is
          confirmed.
        </p>
        <p className="mt-8 text-sm font-medium text-foreground">
          This window closes in {secondsLeft} second
          {secondsLeft === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  )
}
