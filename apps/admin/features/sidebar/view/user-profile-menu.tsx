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
import { LogOut, UserRound } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  type DashboardUserProfile,
  formatRoleLabel,
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
  const roleLabel = formatRoleLabel(profile.role)
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
            "flex items-center gap-2 rounded-lg px-1 py-1 text-left outline-none",
            "transition-colors hover:bg-muted/80",
            "focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/40"
          )}
          aria-label="Open account menu"
        >
          <Avatar className="size-9">
            <AvatarImage src={avatarSrc} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start justify-center sm:flex">
            <p className="text-sm font-medium leading-tight">{displayName}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-48 gap-0 p-1 shadow-lg"
      >
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
