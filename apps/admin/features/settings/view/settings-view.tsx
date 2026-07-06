"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Field, FieldError, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import { type ReactNode,useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type {
  IntegrationStatus,
  PlatformSettingsData,
} from "../model/platform-settings"
import { TIMEZONE_OPTIONS } from "../model/platform-settings"
import { savePlatformSettingsAction } from "../server/settings-actions"
import { IntegrationStatusPanel } from "./integration-status-panel"
import { CreditCard, Globe, Mail, Save, Settings2, Shield } from "lucide-react"

type SettingsViewProps = {
  initialSettings: PlatformSettingsData
  integrationStatus: IntegrationStatus
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Settings2
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm ring-1 ring-black/[0.04] sm:p-6">
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

export function SettingsView({
  initialSettings,
  integrationStatus,
}: SettingsViewProps) {
  const [settings, setSettings] = useState(initialSettings)

  const { run: runSave, pending, fieldErrors, formError } = useActionRunner(
    savePlatformSettingsAction,
    {
      successMessage: "Settings saved",
      onSuccess: (data) => setSettings(data),
    }
  )

  function update<K extends keyof PlatformSettingsData>(
    key: K,
    value: PlatformSettingsData[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform preferences, email defaults, and student-facing behaviour.
        </p>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          runSave(settings)
        }}
      >
        <SettingsSection
          icon={Settings2}
          title="General"
          description="Core platform identity and support contacts."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="platform-name" required>
                Platform name
              </FieldLabel>
              <Input
                id="platform-name"
                value={settings.platformName}
                onChange={(e) => update("platformName", e.target.value)}
                className="h-10 rounded-xl"
              />
              <FieldError>{fieldErrors.platformName?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="timezone" required>
                Timezone
              </FieldLabel>
              <Select
                value={settings.timezone}
                onValueChange={(value) => update("timezone", value)}
              >
                <SelectTrigger id="timezone" className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{fieldErrors.timezone?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="support-email">Support email</FieldLabel>
              <Input
                id="support-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => update("supportEmail", e.target.value)}
                placeholder="support@orvantaa.com"
                className="h-10 rounded-xl"
              />
              <FieldHint>Shown to admins and used in support communications.</FieldHint>
              <FieldError>{fieldErrors.supportEmail?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-email">Default billing email</FieldLabel>
              <Input
                id="billing-email"
                type="email"
                value={settings.billingEmail}
                onChange={(e) => update("billingEmail", e.target.value)}
                placeholder="billing@school.example.com"
                className="h-10 rounded-xl"
              />
              <FieldHint>
                Fallback when a school has no billing contact on file.
              </FieldHint>
              <FieldError>{fieldErrors.billingEmail?.[0]}</FieldError>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Globe}
          title="Application URLs"
          description="Links embedded in emails and redirects for students and admins."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="student-app-url">Student app URL</FieldLabel>
              <Input
                id="student-app-url"
                type="url"
                value={settings.studentAppUrl}
                onChange={(e) => update("studentAppUrl", e.target.value)}
                placeholder="https://app.orvantaa.com"
                className="h-10 rounded-xl"
              />
              <FieldHint>Used in student login and credential emails.</FieldHint>
              <FieldError>{fieldErrors.studentAppUrl?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-app-url">Admin app URL</FieldLabel>
              <Input
                id="admin-app-url"
                type="url"
                value={settings.adminAppUrl}
                onChange={(e) => update("adminAppUrl", e.target.value)}
                placeholder="https://admin.orvantaa.com"
                className="h-10 rounded-xl"
              />
              <FieldHint>Used in password reset links for admins.</FieldHint>
              <FieldError>{fieldErrors.adminAppUrl?.[0]}</FieldError>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={CreditCard}
          title="Subscription billing"
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
                  update(
                    "subscriptionPrincipalAmountRupees",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                placeholder="e.g. 50"
                className="h-10 rounded-xl"
              />
              <FieldHint>
                Monthly charge per school = principal amount × number of
                students in that school.
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
                onChange={(e) => update("subscriptionPlanName", e.target.value)}
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
                  update(
                    "subscriptionBillingCycles",
                    e.target.value === "" ? 120 : Number(e.target.value)
                  )
                }
                className="h-10 rounded-xl"
              />
              <FieldHint>
                Number of monthly charges per subscription (120 ≈ 10 years).
              </FieldHint>
              <FieldError>
                {fieldErrors.subscriptionBillingCycles?.[0]}
              </FieldError>
            </Field>
          </div>
          <ToggleRow
            id="auto-start-subscriptions"
            label="Auto-start subscriptions for new schools"
            description="When a school is created with a billing email, start a Razorpay subscription and email the setup link automatically."
            checked={settings.autoStartSchoolSubscriptions}
            onCheckedChange={(checked) =>
              update("autoStartSchoolSubscriptions", checked)
            }
          />
        </SettingsSection>

        <SettingsSection
          icon={Mail}
          title="Email"
          description="Default sender details and notification toggles."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="email-from-name" required>
                Sender name
              </FieldLabel>
              <Input
                id="email-from-name"
                value={settings.emailFromName}
                onChange={(e) => update("emailFromName", e.target.value)}
                className="h-10 rounded-xl"
              />
              <FieldError>{fieldErrors.emailFromName?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="email-from-address">Sender email</FieldLabel>
              <Input
                id="email-from-address"
                type="email"
                value={settings.emailFromAddress}
                onChange={(e) => update("emailFromAddress", e.target.value)}
                placeholder="noreply@orvantaa.com"
                className="h-10 rounded-xl"
              />
              <FieldHint>
                Must match your verified domain in{" "}
                {integrationStatus.email.provider}.
              </FieldHint>
              <FieldError>{fieldErrors.emailFromAddress?.[0]}</FieldError>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              id="send-student-credentials"
              label="Student credential emails"
              description="Send login details when admins create or import students."
              checked={settings.sendStudentCredentialEmails}
              onCheckedChange={(checked) =>
                update("sendStudentCredentialEmails", checked)
              }
            />
            <ToggleRow
              id="send-subscription-emails"
              label="Subscription payment emails"
              description="Notify schools when subscription payments are recorded."
              checked={settings.sendSubscriptionEmails}
              onCheckedChange={(checked) =>
                update("sendSubscriptionEmails", checked)
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Shield}
          title="Maintenance"
          description="Temporarily limit student access during updates."
        >
          <ToggleRow
            id="maintenance-mode"
            label="Maintenance mode"
            description="When enabled, show a maintenance message to students on the dashboard."
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => update("maintenanceMode", checked)}
          />
          <Field className={cn(!settings.maintenanceMode && "opacity-60")}>
            <FieldLabel htmlFor="maintenance-message">
              Maintenance message
            </FieldLabel>
            <Textarea
              id="maintenance-message"
              value={settings.maintenanceMessage}
              onChange={(e) => update("maintenanceMessage", e.target.value)}
              placeholder="We are performing scheduled maintenance. Please check back shortly."
              rows={3}
              disabled={!settings.maintenanceMode}
              className="rounded-xl"
            />
            <FieldError>{fieldErrors.maintenanceMessage?.[0]}</FieldError>
          </Field>
        </SettingsSection>

        <IntegrationStatusPanel status={integrationStatus} />

        {formError ? (
          <p className="text-sm font-medium text-destructive">{formError}</p>
        ) : null}

        <div className="flex justify-end border-t border-border/50 pt-4">
          <Button
            type="submit"
            disabled={pending}
            className="h-10 rounded-xl bg-[#6C5CE7] px-5 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Save className="size-4" aria-hidden />
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}
