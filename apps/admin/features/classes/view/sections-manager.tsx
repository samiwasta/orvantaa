"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Check, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { ClassSectionItem } from "../model/class-list-item"
import {
  createSectionAction,
  deleteSectionAction,
  updateSectionAction,
} from "../server/actions"

type SectionsManagerProps = {
  classId: string
  sections: ClassSectionItem[]
}

export function SectionsManager({ classId, sections }: SectionsManagerProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const { run: runCreate, pending: creating } = useActionRunner(
    createSectionAction,
    { successMessage: "Section added", onSuccess: () => {
        setNewName("")
        setAdding(false)
      } }
  )
  const { run: runUpdate, pending: updating } = useActionRunner(
    updateSectionAction,
    { successMessage: "Section updated", onSuccess: () => setEditingId(null) }
  )
  const { run: runDelete, pending: deleting } = useActionRunner(deleteSectionAction, {
    successMessage: "Section removed",
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Sections
        </p>
        {!adding ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="rounded-lg text-[#6C5CE7] hover:bg-[#6C5CE7]/10"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </Button>
        ) : null}
      </div>

      {sections.length === 0 && !adding ? (
        <p className="text-xs text-muted-foreground">No sections yet.</p>
      ) : null}

      <ul className="flex flex-col gap-1.5">
        {sections.map((section) => (
          <li
            key={section.id}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-white px-2.5 py-1.5"
          >
            {editingId === section.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 flex-1 rounded-md text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runUpdate(section.id, editName)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-[#10b981]"
                  disabled={updating}
                  onClick={() => runUpdate(section.id, editName)}
                  aria-label="Save section name"
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setEditingId(null)}
                  aria-label="Cancel"
                >
                  <X className="size-3.5" />
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="flex-1 text-left text-sm font-medium text-foreground"
                  onClick={() => {
                    setEditingId(section.id)
                    setEditName(section.name)
                  }}
                >
                  Section {section.name}
                </button>
                <span className="text-[11px] text-muted-foreground">
                  {section.studentCount} st
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deleting}
                  onClick={() => runDelete(section.id)}
                  aria-label={`Remove section ${section.name}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Section name (e.g. A)"
            className="h-8 flex-1 rounded-lg text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") runCreate({ classId, name: newName })
              if (e.key === "Escape") {
                setAdding(false)
                setNewName("")
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            className="rounded-lg bg-[#6C5CE7] text-white hover:bg-[#6C5CE7]/90"
            disabled={creating}
            onClick={() => runCreate({ classId, name: newName })}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setAdding(false)
              setNewName("")
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  )
}
