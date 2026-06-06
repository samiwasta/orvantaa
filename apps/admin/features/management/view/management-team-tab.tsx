"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Mail, Plus, Trash2, UserCog } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"
import { TeamMemberFormDialog } from "@/features/team/view/team-member-form-dialog"
import type { TeamMember } from "@/features/team/model/team-member"
import { deleteTeamMemberAction } from "@/features/team/server/team-actions"
import { useActionRunner } from "@/lib/actions/use-action-runner"

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatJoined(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

type ManagementTeamTabProps = {
  members: TeamMember[]
  currentAdminId: string
  currentUserIsSuperAdmin: boolean
}

export function ManagementTeamTab({
  members,
  currentAdminId,
  currentUserIsSuperAdmin,
}: ManagementTeamTabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteTeamMemberAction,
    {
      successMessage: "Admin removed",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Admin accounts with access to this portal.
        </p>
        <Button
          type="button"
          className="h-9 rounded-lg bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Add admin
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/50 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">
            {members.length} admin{members.length === 1 ? "" : "s"}
          </p>
        </div>

        {members.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No admin accounts found.
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {members.map((member) => {
              const isCurrentUser = member.id === currentAdminId
              const canDelete =
                currentUserIsSuperAdmin && !isCurrentUser && !member.isSuperAdmin
              const displayName = member.fullName || member.username

              return (
                <li
                  key={member.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#6C5CE7]/15 text-sm font-semibold text-[#6C5CE7]">
                      {initials(displayName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {displayName}
                        {isCurrentUser ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        @{member.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:items-center">
                    <div className="flex flex-col gap-2 sm:items-end">
                      <div className="flex flex-wrap gap-1.5 sm:justify-end">
                        {member.isSuperAdmin ? (
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            Super admin
                          </span>
                        ) : null}
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#6C5CE7]/10 px-2.5 py-0.5 text-xs font-medium text-[#6C5CE7]">
                          <UserCog className="size-3.5" aria-hidden />
                          Admin
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="size-3.5 shrink-0" aria-hidden />
                        {member.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined {formatJoined(member.createdAt)}
                      </span>
                    </div>

                    {canDelete ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-9 shrink-0 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        )}
                        aria-label={`Remove ${displayName}`}
                        onClick={() => setDeleteTarget(member)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <TeamMemberFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Remove admin"
        description={
          deleteTarget
            ? `This permanently removes "${deleteTarget.fullName || deleteTarget.username}" from the admin team. They will no longer be able to sign in.`
            : undefined
        }
        confirmLabel="Remove"
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (deleteTarget) runDelete(deleteTarget.id)
        }}
      />
    </div>
  )
}
