"use client"

import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import Link from "next/link"

import type { StudentNotificationSummary } from "@/features/notifications/model/notification"
import { NotificationBell } from "@/features/notifications/view/notification-bell"
import type { DashboardUserProfile } from "@/features/user/model/user"

import { UserProfileMenu } from "./user-profile-menu"

export function SidebarInsetHeader({
  pageTitle,
  userProfile,
  notifications,
}: {
  pageTitle: string
  userProfile: DashboardUserProfile
  notifications: StudentNotificationSummary
}) {
  return (
    <header className="flex shrink-0 items-center border-b border-[#E8EEFF]/80 bg-white px-4 py-2.5 md:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="shrink-0">
            <Image
              src="/orvantaa-logo.png"
              alt="Orvantaa"
              width={120}
              height={32}
              className="h-7 w-auto max-w-[108px] object-contain sm:max-w-[120px]"
              priority
            />
          </Link>
          <div className="hidden h-5 w-px bg-[#E8EEFF] sm:block" />
          <h1
            className={cn(
              "m-0 hidden min-w-0 shrink items-center sm:flex",
              "font-heading text-lg leading-none font-semibold tracking-tight text-foreground"
            )}
          >
            {pageTitle}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <h1
            className={cn(
              "m-0 flex min-w-0 shrink items-center sm:hidden",
              "font-heading text-base leading-none font-semibold tracking-tight text-foreground"
            )}
          >
            {pageTitle}
          </h1>
          <NotificationBell initialSummary={notifications} />
          <UserProfileMenu profile={userProfile} />
        </div>
      </div>
    </header>
  )
}
