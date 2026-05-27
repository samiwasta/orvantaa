"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { MessageSquare, Plus } from "lucide-react"

import type { ChatSession } from "../model/chat-data"

type ChatHistorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
}

function formatSessionDate(date: Date) {
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function ChatHistorySheet({
  open,
  onOpenChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(100vw-2rem,20rem)] gap-0 p-0 sm:max-w-xs"
      >
        <SheetHeader className="border-b border-border/50 px-4 py-4 text-left">
          <SheetTitle className="font-heading text-base font-semibold">
            Chat history
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border/40 px-3 py-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start gap-2 rounded-lg border-dashed text-sm font-medium"
              onClick={() => {
                onNewChat()
                onOpenChange(false)
              }}
            >
              <Plus className="size-4" />
              New chat
            </Button>
          </div>

          <ul className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
            {sessions.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                No conversations yet. Start a new chat to see it here.
              </li>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId
                const preview =
                  session.messages.find((m) => m.role === "user")?.content ??
                  session.messages[0]?.content ??
                  ""

                return (
                  <li key={session.id} className="mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession(session.id)
                        onOpenChange(false)
                      }}
                      className={cn(
                        "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-[#6C5CE7]/10 ring-1 ring-[#6C5CE7]/25"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare
                          className={cn(
                            "size-3.5 shrink-0",
                            isActive
                              ? "text-[#6C5CE7]"
                              : "text-muted-foreground"
                          )}
                          strokeWidth={2}
                        />
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            isActive ? "text-[#6C5CE7]" : "text-foreground"
                          )}
                        >
                          {session.title}
                        </span>
                      </span>
                      {preview ? (
                        <span className="line-clamp-1 pl-5.5 text-xs text-muted-foreground">
                          {preview}
                        </span>
                      ) : null}
                      <span className="pl-5.5 text-[10px] text-muted-foreground/70">
                        {formatSessionDate(session.updatedAt)}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
