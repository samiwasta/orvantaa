import { cn } from "@workspace/ui/lib/utils"
import { GraduationCap, UserCog } from "lucide-react"
import Link from "next/link"

import type { RecentUser } from "../model/admin-dashboard-stats"

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

const AVATAR_COLORS = [
  "bg-[#6C5CE7]/15 text-[#6C5CE7]",
  "bg-[#3b82f6]/15 text-[#3b82f6]",
  "bg-[#10b981]/15 text-[#10b981]",
  "bg-[#f59e0b]/15 text-[#f59e0b]",
  "bg-[#ec4899]/15 text-[#ec4899]",
  "bg-[#8b5cf6]/15 text-[#8b5cf6]",
]

type Props = { users: RecentUser[] }

export function AdminRecentUsers({ users }: Props) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/[0.04] lg:col-span-2">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div>
          <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
            Recent signups
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest {users.length} registered students
          </p>
        </div>
        <Link
          href="/users"
          className="text-xs font-medium text-[#6C5CE7] hover:underline"
        >
          View all
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <p className="text-sm text-muted-foreground">No users yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/50">
          {users.map((user, i) => (
            <li
              key={user.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                )}
              >
                {initials(user.fullName)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>

              <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    user.role === "ADMIN"
                      ? "bg-[#6C5CE7]/10 text-[#6C5CE7]"
                      : "bg-emerald-50 text-emerald-700"
                  )}
                >
                  {user.role === "ADMIN" ? (
                    <UserCog className="size-3" />
                  ) : (
                    <GraduationCap className="size-3" />
                  )}
                  {user.role === "ADMIN" ? "Admin" : user.classLabel ?? "Student"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(user.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
