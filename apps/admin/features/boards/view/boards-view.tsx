"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Landmark, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"
import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"

import type { BoardListItem } from "../model/board-list-item"
import { deleteBoardAction } from "../server/actions"
import { BoardFormDialog } from "./board-form-dialog"

type BoardsViewProps = {
  boards: BoardListItem[]
}

function filterBoards(boards: BoardListItem[], query: string): BoardListItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return boards
  return boards.filter((b) =>
    [b.name, b.slug, b.kindLabel, b.code ?? ""].join(" ").toLowerCase().includes(q)
  )
}

export function BoardsView({ boards }: BoardsViewProps) {
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BoardListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BoardListItem | null>(null)

  const filtered = useMemo(() => filterBoards(boards, search), [boards, search])

  const { run: runDelete, pending: deletePending } = useActionRunner(
    deleteBoardAction,
    {
      successMessage: "Board deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(board: BoardListItem) {
    setEditing(board)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search boards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
            aria-label="Search boards"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>
            {filtered.length === 1 ? " board" : " boards"}
            {search.trim() ? " found" : " total"}
          </p>
          <Button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-xl bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Plus className="size-4" aria-hidden />
            Add board
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Name
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Type
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Code
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Schools
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                  >
                    {search.trim()
                      ? "No boards match your search."
                      : "No boards yet. Add your first board to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((board) => (
                  <tr
                    key={board.id}
                    className="group transition-colors hover:bg-[#6C5CE7]/[0.03]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7]">
                          <Landmark className="size-4" aria-hidden />
                        </span>
                        <p className="font-medium text-foreground">{board.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={board.kind === "university" ? "secondary" : "default"}>
                        {board.kindLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {board.code ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {board.schoolCount}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                          aria-label={`Edit ${board.name}`}
                          onClick={() => openEdit(board)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${board.name}`}
                          onClick={() => setDeleteTarget(board)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BoardFormDialog open={formOpen} onOpenChange={setFormOpen} board={editing} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete board"
        description={
          deleteTarget
            ? `This permanently deletes "${deleteTarget.name}". This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (deleteTarget) runDelete(deleteTarget.id)
        }}
      />
    </div>
  )
}
