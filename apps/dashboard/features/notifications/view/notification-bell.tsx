"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { CheckCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import {
  formatRelativeNotificationTime,
  formatUnreadBadgeCount,
  notificationAccentClass,
  notificationIconForKind,
  type StudentNotificationItem,
  type StudentNotificationSummary,
} from "../model/notification"
import {
  markAllStudentNotificationsReadAction,
  markStudentNotificationReadAction,
  refreshStudentNotificationsAction,
} from "../server/notification-actions"

type NotificationBellProps = {
  initialSummary: StudentNotificationSummary
}

export function NotificationBell({ initialSummary }: NotificationBellProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState(initialSummary)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const [isMarkingAll, startMarkAll] = useTransition()

  useEffect(() => {
    setSummary(initialSummary)
  }, [initialSummary])

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const result = await refreshStudentNotificationsAction()
      if (result.ok) {
        setSummary(result.data)
      }
    })
  }, [])

  useEffect(() => {
    if (!open) return
    refresh()
  }, [open, refresh])

  const badgeLabel = formatUnreadBadgeCount(summary.unreadCount)
  const unreadItems = summary.items.filter((item) => !item.read)
  const readItems = summary.items.filter((item) => item.read)

  async function handleItemClick(item: StudentNotificationItem) {
    if (pendingId) return

    setPendingId(item.id)

    if (!item.read) {
      const result = await markStudentNotificationReadAction(item.id)
      if (result.ok) {
        setSummary(result.data)
      }
    }

    setOpen(false)
    setPendingId(null)

    if (item.href) {
      router.push(item.href)
    }
  }

  function handleMarkAllRead() {
    startMarkAll(async () => {
      const result = await markAllStudentNotificationsReadAction()
      if (result.ok) {
        setSummary(result.data)
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-none hover:bg-[#F8FAFF]"
          aria-label={
            summary.unreadCount > 0
              ? `Notifications, ${summary.unreadCount} unread`
              : "Notifications"
          }
        >
          <Image
            src="/notification.svg"
            alt=""
            width={24}
            height={24}
            className="size-5 shrink-0"
            aria-hidden
          />
          {badgeLabel ? (
            <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-[#4169E1] px-1 text-[10px] font-semibold text-white">
              {badgeLabel}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.unreadCount > 0
                ? `${summary.unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>
          {summary.unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-2 text-xs"
              disabled={isMarkingAll}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="mr-1 size-3.5" aria-hidden />
              Mark all read
            </Button>
          ) : null}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          {isRefreshing && summary.items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : summary.items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No notifications yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quiz results, completed lessons, and important updates will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {unreadItems.length > 0 ? (
                <NotificationGroup
                  label="New"
                  items={unreadItems}
                  pendingId={pendingId}
                  onItemClick={handleItemClick}
                />
              ) : null}
              {readItems.length > 0 ? (
                <NotificationGroup
                  label={unreadItems.length > 0 ? "Earlier" : "Recent"}
                  items={readItems}
                  pendingId={pendingId}
                  onItemClick={handleItemClick}
                  muted
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="border-t border-border/60 px-4 py-2.5">
          <Link
            href="/performance"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-[#4169E1] hover:underline"
          >
            View your performance
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationGroup({
  label,
  items,
  pendingId,
  onItemClick,
  muted = false,
}: {
  label: string
  items: StudentNotificationItem[]
  pendingId: string | null
  onItemClick: (item: StudentNotificationItem) => void
  muted?: boolean
}) {
  return (
    <div>
      <p className="bg-muted/30 px-4 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="list-none">
        {items.map((item) => {
          const Icon = notificationIconForKind(item.kind)
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => void onItemClick(item)}
                disabled={pendingId === item.id}
                className={cn(
                  "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  muted && "opacity-80",
                  !item.read && "bg-[#4169E1]/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                    notificationAccentClass(item.priority)
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm leading-snug",
                        item.read
                          ? "font-medium text-foreground"
                          : "font-semibold text-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                    {!item.read ? (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#4169E1]" />
                    ) : null}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {item.body}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground/80">
                    {formatRelativeNotificationTime(item.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
