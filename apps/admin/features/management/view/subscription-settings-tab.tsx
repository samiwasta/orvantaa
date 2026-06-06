"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Field, FieldError, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { CreditCard, Mail, Save } from "lucide-react"
import { type ReactNode, useState } from "react"

import { StatusBadge } from "@/features/settings/view/integration-status-panel"
import type {
  IntegrationStatus,
  PlatformSettingsData,
} from "@/features/settings/model/platform-settings"
import { savePlatformSettingsAction } from "@/features/settings/server/settings-actions"
import { useActionRunner } from "@/lib/actions/use-action-runner"

type SubscriptionSettingsTabProps = {
  initialSettings: PlatformSettingsData
  integrationStatus: IntegrationStatus
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof CreditCard
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-muted/10 px-4 py-3"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  )
}

export function SubscriptionSettingsTab({
  initialSettings,
  integrationStatus,
}: SubscriptionSettingsTabProps) {
  const [settings, setSettings] = useState(initialSettings)

  const { run: runSave, pending, fieldErrors, formError } = useActionRunner(
    savePlatformSettingsAction,
    {
      successMessage: "Subscription settings saved",
      onSuccess: (data) => setSettings(data),
    }
  )

  function updateSubscriptionField<K extends keyof PlatformSettingsData>(
    key: K,
    value: PlatformSettingsData[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        runSave(settings)
      }}
    >
      <section className="rounded-xl border border-border/60 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Razorpay integration
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Required for automatic monthly school subscriptions.
            </p>
          </div>
          <StatusBadge
            ok={integrationStatus.razorpay.enabled}
            okLabel="Connected"
            failLabel="Not configured"
          />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Payments</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {integrationStatus.razorpay.enabled ? "Enabled" : "Disabled"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Webhook secret</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {integrationStatus.razorpay.webhookConfigured
                ? "Configured"
                : "Missing"}
            </dd>
          </div>
        </dl>
      </section>

      <SettingsSection
        icon={CreditCard}
        title="Monthly subscription plan"
        description="Per-student principal amount multiplied by each school's student count."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="subscription-principal-amount" required>
              Principal amount per student (INR)
            </FieldLabel>
            <Input
              id="subscription-principal-amount"
              type="number"
              min="0"
              step="0.01"
              value={settings.subscriptionPrincipalAmountRupees || ""}
              onChange={(e) =>
                updateSubscriptionField(
                  "subscriptionPrincipalAmountRupees",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder="e.g. 50"
              className="h-10 rounded-xl"
            />
            <FieldHint>
              Monthly charge per school = principal amount × number of students
              in that school.
            </FieldHint>
            <FieldError>
              {fieldErrors.subscriptionPrincipalAmountRupees?.[0]}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="subscription-plan-name" required>
              Plan name
            </FieldLabel>
            <Input
              id="subscription-plan-name"
              value={settings.subscriptionPlanName}
              onChange={(e) =>
                updateSubscriptionField("subscriptionPlanName", e.target.value)
              }
              className="h-10 rounded-xl"
            />
            <FieldError>{fieldErrors.subscriptionPlanName?.[0]}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="subscription-billing-cycles" required>
              Billing cycles
            </FieldLabel>
            <Input
              id="subscription-billing-cycles"
              type="number"
              min="1"
              max="999"
              value={settings.subscriptionBillingCycles}
              onChange={(e) =>
                updateSubscriptionField(
                  "subscriptionBillingCycles",
                  e.target.value === "" ? 120 : Number(e.target.value)
                )
              }
              className="h-10 rounded-xl"
            />
            <FieldHint>
              Number of monthly charges per subscription (120 ≈ 10 years).
            </FieldHint>
            <FieldError>{fieldErrors.subscriptionBillingCycles?.[0]}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="billing-email">Default billing email</FieldLabel>
            <Input
              id="billing-email"
              type="email"
              value={settings.billingEmail}
              onChange={(e) =>
                updateSubscriptionField("billingEmail", e.target.value)
              }
              placeholder="billing@school.example.com"
              className="h-10 rounded-xl"
            />
            <FieldHint>
              Fallback when a school has no billing contact on file.
            </FieldHint>
            <FieldError>{fieldErrors.billingEmail?.[0]}</FieldError>
          </Field>
        </div>
        <ToggleRow
          id="auto-start-subscriptions"
          label="Auto-start subscriptions for new schools"
          description="When a school is created with a billing email, start a Razorpay subscription and email the setup link automatically."
          checked={settings.autoStartSchoolSubscriptions}
          onCheckedChange={(checked) =>
            updateSubscriptionField("autoStartSchoolSubscriptions", checked)
          }
        />
      </SettingsSection>

      <SettingsSection
        icon={Mail}
        title="Subscription emails"
        description="Notifications sent to schools for billing events."
      >
        <ToggleRow
          id="send-subscription-emails"
          label="Subscription payment emails"
          description="Notify schools when subscription payments are due, succeed, fail, or when setup is required."
          checked={settings.sendSubscriptionEmails}
          onCheckedChange={(checked) =>
            updateSubscriptionField("sendSubscriptionEmails", checked)
          }
        />
      </SettingsSection>

      {formError ? (
        <p className="text-sm font-medium text-destructive">{formError}</p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="h-10 rounded-xl bg-[#6C5CE7] px-5 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Save className="size-4" aria-hidden />
          {pending ? "Saving..." : "Save subscription settings"}
        </Button>
      </div>
    </form>
  )
}
