"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { CircleHelp, LogOut, UserRound } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  type DashboardUserProfile,
  formatUserFullName,
} from "@/features/user/model/user"

import { avatarSrcForUserGender } from "../model/user-gender"

type UserProfileMenuProps = {
  profile: DashboardUserProfile
}

export function UserProfileMenu({ profile }: UserProfileMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const avatarSrc = avatarSrcForUserGender(profile.gender)
  const displayName =
    profile.fullName || formatUserFullName(profile.firstName, profile.lastName)
  const subtitle = profile.role === "student" ? profile.classLabel : null
  const initials = displayName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setOpen(false)
      router.push("/auth")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-left outline-none sm:px-3 sm:py-2",
            "transition-colors hover:bg-[#F8FAFF]",
            "focus-visible:ring-2 focus-visible:ring-[#4169E1]/30"
          )}
          aria-label="Open account menu"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={avatarSrc} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-col items-start justify-center pr-1 sm:flex">
            <p className="max-w-[9rem] truncate text-sm font-semibold text-foreground md:max-w-[11rem]">
              {displayName}
            </p>
            {subtitle ? (
              <p className="max-w-[9rem] truncate text-xs text-muted-foreground md:max-w-[11rem]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-48 gap-0 p-1 shadow-lg"
      >
        <Link
          href="/help"
          onClick={() => setOpen(false)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            "text-foreground transition-colors hover:bg-muted"
          )}
        >
          <CircleHelp className="size-4 text-[#6C5CE7]" strokeWidth={2} />
          Help
        </Link>
        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            "text-foreground transition-colors hover:bg-muted"
          )}
        >
          <UserRound className="size-4 text-[#6C5CE7]" strokeWidth={2} />
          My Profile
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            "text-foreground transition-colors hover:bg-muted",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          <LogOut className="size-4 text-[#6C5CE7]" strokeWidth={2} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </PopoverContent>
    </Popover>
  )
}
