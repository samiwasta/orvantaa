"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { Copy, ExternalLink, RefreshCw, Repeat } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type {
  RecurringSubscriptionConfig,
  RecurringSubscriptionListItem,
} from "../model/recurring-subscription"
import type { SchoolListItem } from "../model/school-list-item"
import type {
  SubscriptionPaymentListItem,
  SubscriptionPaymentsConfig,
} from "../model/subscription-payment"
import { formatAmountLabel } from "../model/subscription-payment"
import {
  cancelSchoolRecurringSubscriptionAction,
  startSchoolRecurringSubscriptionAction,
  syncSchoolRecurringSubscriptionAction,
  syncSchoolSubscriptionPaymentsAction,
} from "../server/subscription-actions"
import { updateSchoolSubscriptionAction } from "../server/student-actions"
import { SubscriptionStatusBadge } from "./school-status-badges"
import { SubscriptionPaymentStatusChip } from "./subscription-payment-status-chip"

type SchoolSubscriptionTabProps = {
  school: SchoolListItem
  payments: SubscriptionPaymentListItem[]
  paymentsConfig: SubscriptionPaymentsConfig
  recurringSubscription: RecurringSubscriptionListItem | null
  recurringConfig: RecurringSubscriptionConfig
}

function RecurringStatusChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#6C5CE7]/10 px-2.5 py-0.5 text-xs font-semibold text-[#6C5CE7]">
      {label}
    </span>
  )
}

export function SchoolSubscriptionTab({
  school,
  payments,
  paymentsConfig,
  recurringSubscription,
  recurringConfig,
}: SchoolSubscriptionTabProps) {
  const [status, setStatus] = useState(school.subscriptionStatus)
  const [sendSetupEmail, setSendSetupEmail] = useState(true)

  const quotedMonthlyLabel =
    recurringConfig.principalAmountLabel && school.studentCount > 0
      ? `${recurringConfig.principalAmountLabel} × ${school.studentCount} students`
      : null

  const quotedTotalLabel =
    recurringConfig.principalAmountPaise > 0 && school.studentCount > 0
      ? formatAmountLabel(
          recurringConfig.principalAmountPaise * school.studentCount,
          "INR"
        )
      : null

  const canStartRecurring =
    recurringConfig.configured &&
    paymentsConfig.razorpayEnabled &&
    school.studentCount > 0 &&
    (!recurringSubscription ||
      recurringSubscription.status === "cancelled" ||
      recurringSubscription.status === "completed" ||
      recurringSubscription.status === "expired")

  const canManageRecurring =
    recurringSubscription &&
    recurringSubscription.status !== "cancelled" &&
    recurringSubscription.status !== "completed" &&
    recurringSubscription.status !== "expired"

  const { run: runSaveStatus, pending: savePending, fieldErrors, formError } =
    useActionRunner(
      (subscriptionStatus: SchoolListItem["subscriptionStatus"]) =>
        updateSchoolSubscriptionAction(school.id, school.schoolCode, {
          subscriptionStatus,
        }),
      { successMessage: "Subscription updated" }
    )

  const { run: runSyncPayments, pending: syncPaymentsPending } = useActionRunner(
    () => syncSchoolSubscriptionPaymentsAction(school.id, school.schoolCode),
    { successMessage: "Payments synced" }
  )

  const {
    run: runStartRecurring,
    pending: startRecurringPending,
    formError: startRecurringError,
  } = useActionRunner(
    () =>
      startSchoolRecurringSubscriptionAction(school.id, school.schoolCode, {
        sendEmail: sendSetupEmail,
      }),
    { successMessage: "Recurring subscription started" }
  )

  const { run: runCancelRecurring, pending: cancelRecurringPending } =
    useActionRunner(
      () =>
        cancelSchoolRecurringSubscriptionAction(school.id, school.schoolCode),
      { successMessage: "Recurring subscription cancelled" }
    )

  const { run: runSyncRecurring, pending: syncRecurringPending } =
    useActionRunner(
      () =>
        syncSchoolRecurringSubscriptionAction(school.id, school.schoolCode),
      { successMessage: "Subscription synced" }
    )

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Platform access
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Controls whether students at this school can use the platform.
                Recurring billing updates this automatically via Razorpay
                webhooks.
              </p>
            </div>
            <SubscriptionStatusBadge
              school={{ ...school, subscriptionStatus: status }}
            />
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-6 sm:pb-6 sm:pt-5">
          <Field className="max-w-xs">
            <FieldLabel required>Manual override</FieldLabel>
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
            {savePending ? "Saving..." : "Save override"}
          </Button>
        </div>

        {formError ? (
          <p className="px-5 pb-5 text-sm font-medium text-destructive sm:px-6">
            {formError}
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Monthly recurring subscription
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {recurringSubscription ? (
                  <>
                    {recurringSubscription.principalAmountLabel &&
                    recurringSubscription.studentCount > 0
                      ? `${recurringSubscription.principalAmountLabel} × ${recurringSubscription.studentCount} students = ${recurringSubscription.amountLabel}`
                      : recurringSubscription.amountLabel}{" "}
                    charged every month after mandate setup.
                  </>
                ) : quotedMonthlyLabel && quotedTotalLabel ? (
                  <>
                    Estimated monthly charge: {quotedMonthlyLabel} ={" "}
                    {quotedTotalLabel}. Billing updates automatically when
                    students are added or removed.
                  </>
                ) : (
                  <>
                    Set the principal amount per student in Subscription
                    Settings. Billing is calculated as principal × student
                    count.
                  </>
                )}
              </p>
            </div>
            {recurringSubscription ? (
              <RecurringStatusChip label={recurringSubscription.statusLabel} />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 sm:px-6 sm:pb-6 sm:pt-5">
          {!recurringConfig.configured ? (
            <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
              Set the principal amount per student in{" "}
              <Link
                href="/management?tab=subscription-settings"
                className="font-medium underline"
              >
                Subscription Settings
              </Link>{" "}
              and connect Razorpay before starting subscriptions.
            </div>
          ) : school.studentCount === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
              Add students to this school before starting a subscription. Billing
              is calculated as principal amount × student count.
            </div>
          ) : null}

          {recurringSubscription ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Plan
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {recurringSubscription.planName}
                  {recurringSubscription.principalAmountLabel &&
                  recurringSubscription.studentCount > 0 ? (
                    <>
                      {" "}
                      · {recurringSubscription.principalAmountLabel} ×{" "}
                      {recurringSubscription.studentCount} ={" "}
                      {recurringSubscription.amountLabel}
                    </>
                  ) : (
                    <> · {recurringSubscription.amountLabel}</>
                  )}
                  /month
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Razorpay subscription
                </dt>
                <dd className="mt-1 font-mono text-xs text-[#6C5CE7]">
                  {recurringSubscription.razorpaySubscriptionId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Next charge
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {recurringSubscription.nextChargeAt ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Current period
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {recurringSubscription.currentPeriodStart ?? "—"}
                  {recurringSubscription.currentPeriodEnd
                    ? ` → ${recurringSubscription.currentPeriodEnd}`
                    : ""}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recurring subscription yet.
              {recurringConfig.autoStartEnabled
                ? " New schools start automatically when billing is configured."
                : " Start one manually below."}
            </p>
          )}

          {recurringSubscription?.authUrl &&
          (recurringSubscription.status === "created" ||
            recurringSubscription.status === "pending") ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg"
                asChild
              >
                <Link
                  href={recurringSubscription.authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Complete setup
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => copyLink(recurringSubscription.authUrl!)}
              >
                <Copy className="size-3.5" aria-hidden />
                Copy setup page link
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {canStartRecurring ? (
              <>
                <div className="flex w-full items-center gap-2">
                  <Checkbox
                    id="send-setup-email"
                    checked={sendSetupEmail}
                    onCheckedChange={(checked) =>
                      setSendSetupEmail(checked === true)
                    }
                  />
                  <Label htmlFor="send-setup-email" className="text-sm font-normal">
                    Email setup page link to billing address
                  </Label>
                </div>
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-[#6C5CE7] px-5 font-semibold text-white hover:bg-[#6C5CE7]/90"
                  disabled={startRecurringPending}
                  onClick={() => runStartRecurring()}
                >
                  <Repeat className="size-4" aria-hidden />
                  {startRecurringPending
                    ? "Starting..."
                    : "Start monthly subscription"}
                </Button>
              </>
            ) : null}

            {canManageRecurring ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg"
                  disabled={syncRecurringPending}
                  onClick={() => runSyncRecurring()}
                >
                  <RefreshCw
                    className={cn("size-4", syncRecurringPending && "animate-spin")}
                    aria-hidden
                  />
                  Sync subscription
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg text-destructive hover:text-destructive"
                  disabled={cancelRecurringPending}
                  onClick={() => runCancelRecurring()}
                >
                  {cancelRecurringPending ? "Cancelling..." : "Cancel subscription"}
                </Button>
              </>
            ) : null}
          </div>

          {startRecurringError ? (
            <p className="text-sm font-medium text-destructive">
              {startRecurringError}
            </p>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Billing history
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Monthly charges and payment events recorded from Razorpay.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-lg border-border/60 bg-white"
            disabled={!paymentsConfig.razorpayEnabled || syncPaymentsPending}
            onClick={() => runSyncPayments()}
          >
            <RefreshCw
              className={cn("size-4", syncPaymentsPending && "animate-spin")}
              aria-hidden
            />
            Sync payments
          </Button>
        </div>

        {!paymentsConfig.razorpayConfigured ? (
          <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
            Connect Razorpay and enable subscription webhooks at{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
              /api/webhooks/razorpay
            </code>
            . Enable events:{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
              subscription.*
            </code>
            .
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Service
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Amount
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
                      No billing events yet. Charges appear here after mandate
                      setup and monthly renewals.
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
                        {payment.amountLabel ?? "—"}
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
