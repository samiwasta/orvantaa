import type { Metadata } from "next"

import { ProfileView } from "@/features/user/view/profile-view"
import { loadProfilePageData } from "@/features/user/server/load-profile-page-data"

export const metadata: Metadata = {
  title: "My Profile - Orvantaa Admin",
  description: "View and manage your Orvantaa admin profile",
}

export default async function ProfilePage() {
  const profile = await loadProfilePageData()
  return <ProfileView profile={profile} />
}
