import { cn } from "@workspace/ui/lib/utils"

import type { SubscriptionPaymentStatus } from "../model/subscription-payment"

const styles: Record<SubscriptionPaymentStatus, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  due: "border-amber-200 bg-amber-50 text-amber-800",
  late: "border-orange-200 bg-orange-50 text-orange-800",
  failed: "border-red-200 bg-red-50 text-red-700",
  pending: "border-slate-200 bg-slate-100 text-slate-600",
}

export function SubscriptionPaymentStatusChip({
  label,
  status,
}: {
  label: string
  status: SubscriptionPaymentStatus
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {label}
    </span>
  )
}
