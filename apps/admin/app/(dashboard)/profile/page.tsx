import type { Metadata } from "next"

import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"

export const metadata: Metadata = {
  title: "My Profile - Orvantaa",
  description: "View and manage your Orvantaa profile",
}

export default async function ProfilePage() {
  const profile = await loadDashboardUserProfile()

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        My Profile
      </h2>
      <dl className="divide-y divide-border rounded-xl border border-border/60 bg-white">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-muted-foreground">First name</dt>
          <dd className="text-sm font-medium">{profile.firstName}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-muted-foreground">Last name</dt>
          <dd className="text-sm font-medium">{profile.lastName || "—"}</dd>
        </div>
        {profile.role === "student" ? (
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">Class</dt>
            <dd className="text-sm font-medium">
              {profile.classLabel ?? "Not assigned"}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-muted-foreground">Role</dt>
          <dd className="text-sm font-medium capitalize">{profile.role}</dd>
        </div>
      </dl>
    </div>
  )
}
