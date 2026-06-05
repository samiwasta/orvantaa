import { cn } from "@workspace/ui/lib/utils"

type StatusBadgeProps = {
  ok: boolean
  okLabel: string
  failLabel: string
}

export function StatusBadge({ ok, okLabel, failLabel }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ok
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-900"
      )}
    >
      {ok ? okLabel : failLabel}
    </span>
  )
}

import type { IntegrationStatus } from "../model/platform-settings"

type IntegrationStatusPanelProps = {
  status: IntegrationStatus
}

export function IntegrationStatusPanel({ status }: IntegrationStatusPanelProps) {
  const items = [
    {
      label: "Email delivery",
      detail: `${status.email.provider}${status.email.fromAddress ? ` · ${status.email.fromAddress}` : ""}`,
      ok: status.email.configured,
      okLabel: "Connected",
      failLabel: "Not configured",
    },
    {
      label: "Razorpay payments",
      detail: status.razorpay.webhookConfigured
        ? "Webhook secret set"
        : "Webhook secret missing",
      ok: status.razorpay.enabled,
      okLabel: "Enabled",
      failLabel: "Disabled",
    },
    {
      label: "File storage (R2)",
      detail: status.storage.publicUrl ?? "No public URL set",
      ok: status.storage.configured,
      okLabel: "Configured",
      failLabel: "Not configured",
    },
    {
      label: "Admin sessions",
      detail: `${status.auth.sessionDays} day${status.auth.sessionDays === 1 ? "" : "s"} (from env)`,
      ok: true,
      okLabel: "Active",
      failLabel: "Inactive",
    },
  ]

  return (
    <section className="rounded-2xl border border-border/60 bg-muted/10 p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Integrations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Server credentials are managed via environment variables. Status is
          read-only here.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-2 rounded-xl border border-border/50 bg-white px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <StatusBadge
                ok={item.ok}
                okLabel={item.okLabel}
                failLabel={item.failLabel}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
