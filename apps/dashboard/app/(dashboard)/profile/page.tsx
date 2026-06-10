import type { Metadata } from "next"

import { loadProfilePageData } from "@/features/user/server/load-profile-page-data"
import { ProfileView } from "@/features/user/view/profile-view"

export const metadata: Metadata = {
  title: "My Profile - Orvantaa",
  description: "View and manage your Orvantaa profile",
}

export default async function ProfilePage() {
  const profile = await loadProfilePageData()
  return <ProfileView profile={profile} />
}
