import type { Metadata } from "next"

import { loadHelpPageData } from "@/features/support/server/load-help-page-data"
import { HelpView } from "@/features/support/view/help-view"

export const metadata: Metadata = {
  title: "Help & Support - Orvantaa",
  description: "Get help and raise a support ticket",
}

export default async function HelpPage() {
  const data = await loadHelpPageData()
  return <HelpView data={data} />
}
