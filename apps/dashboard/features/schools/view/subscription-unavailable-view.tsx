"use client"

import { Button } from "@workspace/ui/components/button"
import { AlertCircle, MoveLeft } from "lucide-react"
import Link from "next/link"

import {
  AuthBrandMark,
  AuthCard,
  AuthPageShell,
} from "@/features/auth/view/auth-page-shell"
import type { SchoolSubscriptionStatus } from "@/features/schools/model/school-subscription"
import {
  subscriptionAccessMessage,
  subscriptionAccessTitle,
} from "@/features/schools/model/school-subscription"

type SubscriptionUnavailableViewProps = {
  status: SchoolSubscriptionStatus
  schoolName: string | null
  message: string | null
}

export function SubscriptionUnavailableView({
  status,
  schoolName,
  message,
}: SubscriptionUnavailableViewProps) {
  const title = subscriptionAccessTitle(status)
  const body =
    message?.trim() ||
    (status === "inactive" || status === "hold" || status === "blocked"
      ? subscriptionAccessMessage(status)
      : "Platform access is unavailable for your school.")

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthBrandMark className="mb-6" />
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <AlertCircle className="size-8" strokeWidth={2} aria-hidden />
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
              {schoolName ? (
                <p className="text-sm font-medium text-slate-700">
                  {schoolName}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              asChild
              className="h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold text-white hover:bg-[#3558C8]"
            >
              <Link href="/auth">Back to login</Link>
            </Button>

            <div className="flex items-center justify-center gap-2">
              <MoveLeft className="size-4 shrink-0 text-slate-400" />
              <Link
                href="/auth"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline"
              >
                Sign in with a different account
              </Link>
            </div>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
