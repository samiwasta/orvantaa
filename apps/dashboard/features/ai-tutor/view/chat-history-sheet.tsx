"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { Loader2, MessageSquare, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import type { ChatSession } from "../model/chat-data"

type ChatHistorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => Promise<void>
}

function formatSessionDate(date: Date) {
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  if (isToday) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })
  }
  return date.toLocaleDateString("en-IN", {
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
  onDeleteSession,
}: ChatHistorySheetProps) {
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!sessionToDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await onDeleteSession(sessionToDelete.id)
      setSessionToDelete(null)
    } catch (error) {
      console.error("[ai-tutor] Failed to delete chat:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
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
                    <li key={session.id} className="group mb-1">
                      <div
                        className={cn(
                          "flex items-stretch gap-0.5 rounded-lg transition-colors",
                          isActive
                            ? "bg-[#4169E1]/10 ring-1 ring-[#4169E1]/25"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSession(session.id)
                            onOpenChange(false)
                          }}
                          className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-2.5 text-left"
                        >
                          <span className="flex items-center gap-2">
                            <MessageSquare
                              className={cn(
                                "size-3.5 shrink-0",
                                isActive
                                  ? "text-[#4169E1]"
                                  : "text-muted-foreground"
                              )}
                              strokeWidth={2}
                            />
                            <span
                              className={cn(
                                "truncate text-sm font-medium",
                                isActive ? "text-[#4169E1]" : "text-foreground"
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

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${session.title}`}
                          className="my-auto mr-1 size-8 shrink-0 rounded-lg text-muted-foreground opacity-100 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSessionToDelete(session)
                          }}
                        >
                          <Trash2 className="size-4" strokeWidth={2} />
                        </Button>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={sessionToDelete !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isDeleting) {
            setSessionToDelete(null)
          }
        }}
      >
        <DialogContent showCloseButton={!isDeleting} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{sessionToDelete?.title}
              &rdquo; and all of its messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setSessionToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
