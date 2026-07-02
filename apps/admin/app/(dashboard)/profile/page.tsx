import { profilePageMetadata } from "@/features/dashboard/model/page-metadata"
import { ProfileView } from "@/features/user/view/profile-view"
import { loadProfilePageData } from "@/features/user/server/load-profile-page-data"

export const metadata = profilePageMetadata

export default async function ProfilePage() {
  const profile = await loadProfilePageData()
  return <ProfileView profile={profile} />
}
