"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { SchoolListItem } from "../model/school-list-item"
import type {
  SubscriptionPaymentListItem,
  SubscriptionPaymentsConfig,
} from "../model/subscription-payment"
import { syncSchoolSubscriptionPaymentsAction } from "../server/subscription-actions"
import { updateSchoolSubscriptionAction } from "../server/student-actions"
import { SubscriptionStatusBadge } from "./school-status-badges"
import { SubscriptionPaymentStatusChip } from "./subscription-payment-status-chip"

type SchoolSubscriptionTabProps = {
  school: SchoolListItem
  payments: SubscriptionPaymentListItem[]
  paymentsConfig: SubscriptionPaymentsConfig
}

export function SchoolSubscriptionTab({
  school,
  payments,
  paymentsConfig,
}: SchoolSubscriptionTabProps) {
  const [status, setStatus] = useState(school.subscriptionStatus)

  const { run: runSaveStatus, pending: savePending, fieldErrors, formError } =
    useActionRunner(
      (subscriptionStatus: SchoolListItem["subscriptionStatus"]) =>
        updateSchoolSubscriptionAction(school.id, school.schoolCode, {
          subscriptionStatus,
        }),
      { successMessage: "Subscription updated" }
    )

  const { run: runSync, pending: syncPending } = useActionRunner(
    () => syncSchoolSubscriptionPaymentsAction(school.id, school.schoolCode),
    { successMessage: "Payments synced" }
  )

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Subscription status
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Controls platform access for this school. Payment events from
                Razorpay update the history table below.
              </p>
            </div>
            <SubscriptionStatusBadge
              school={{ ...school, subscriptionStatus: status }}
            />
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-6 sm:pb-6 sm:pt-5">
          <Field className="max-w-xs">
            <FieldLabel required>Status</FieldLabel>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as SchoolListItem["subscriptionStatus"])
              }
            >
              <SelectTrigger className="h-10 rounded-lg bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.subscriptionStatus?.[0]}</FieldError>
          </Field>

          <Button
            type="button"
            className="h-10 shrink-0 rounded-lg bg-[#6C5CE7] px-5 font-semibold text-white hover:bg-[#6C5CE7]/90"
            disabled={savePending || status === school.subscriptionStatus}
            onClick={() => runSaveStatus(status)}
          >
            {savePending ? "Saving..." : "Save changes"}
          </Button>
        </div>

        {formError ? (
          <p className="px-5 pb-5 text-sm font-medium text-destructive sm:px-6">
            {formError}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Subscription history
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Transaction ID, date, service, payment method, and invoice from
              Razorpay.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-lg border-border/60 bg-white"
            disabled={!paymentsConfig.razorpayEnabled || syncPending}
            onClick={() => runSync()}
          >
            <RefreshCw
              className={cn("size-4", syncPending && "animate-spin")}
              aria-hidden
            />
            Sync from Razorpay
          </Button>
        </div>

        {!paymentsConfig.razorpayConfigured ? (
          <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
            Razorpay is not connected yet. Add{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
              RAZORPAY_KEY_ID
            </code>{" "}
            and{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
              RAZORPAY_KEY_SECRET
            </code>{" "}
            to your environment, then use Sync or configure the webhook at{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
              /api/webhooks/razorpay
            </code>
            . Payment emails send automatically for due, success, failed, and
            late events.
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Transaction date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Service name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Payment method
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-white">
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      No subscription payments yet.
                      {paymentsConfig.razorpayConfigured
                        ? " Sync from Razorpay or wait for webhook events."
                        : " Connect Razorpay to start recording payments."}
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-[#6C5CE7]">
                          {payment.transactionId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {payment.transactionDate}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {payment.serviceName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {payment.paymentMethod ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <SubscriptionPaymentStatusChip
                          label={payment.statusLabel}
                          status={payment.status}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.invoiceUrl ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 rounded-lg text-[#6C5CE7] hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7]"
                            asChild
                          >
                            <Link
                              href={payment.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                              <ExternalLink className="size-3.5" aria-hidden />
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
