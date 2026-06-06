import type { SchoolSubscriptionStatus } from "../model/school-list-item"
import type { SubscriptionPaymentStatus } from "../model/subscription-payment"

export function subscriptionStatusFromPayment(
  paymentStatus: SubscriptionPaymentStatus
): SchoolSubscriptionStatus | null {
  switch (paymentStatus) {
    case "success":
      return "active"
    case "failed":
      return "hold"
    case "late":
      return "hold"
    case "due":
      return "inactive"
    default:
      return null
  }
}

export function subscriptionStatusLabelForPayment(
  paymentStatus: SubscriptionPaymentStatus
): string {
  switch (paymentStatus) {
    case "success":
      return "Active"
    case "failed":
      return "Hold"
    case "late":
      return "Hold"
    case "due":
      return "Inactive"
    default:
      return "Unchanged"
  }
}
