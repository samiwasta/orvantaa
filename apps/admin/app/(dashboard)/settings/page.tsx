import { redirect } from "next/navigation"

export default function SettingsPage() {
  redirect("/management?tab=subscription-settings")
}
