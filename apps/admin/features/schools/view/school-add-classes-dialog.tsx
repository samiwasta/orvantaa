"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { BoardClassOption } from "../model/board-class-option"
import { createSchoolClassesAction } from "../server/school-class-actions"

type SchoolAddClassesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolCode: string
  schoolName: string
  boardId: string
  boardName: string
  options: BoardClassOption[]
}

export function SchoolAddClassesDialog({
  open,
  onOpenChange,
  schoolId,
  schoolCode,
  schoolName,
  boardId,
  boardName,
  options,
}: SchoolAddClassesDialogProps) {
  const [selected, setSelected] = useState<string[]>([])

  const { run, pending, formError, reset } = useActionRunner(
    (names: string[]) =>
      createSchoolClassesAction(schoolId, boardId, schoolCode, { names }),
    {
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setSelected([])
  }, [open, reset])

  function toggleOption(name: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, name] : current.filter((value) => value !== name)
    )
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    run(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add class</DialogTitle>
          <DialogDescription>
            Select grades linked to {boardName} that are not yet added to{" "}
            {schoolName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Classes for {boardName}</legend>
            {options.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
                No board-linked classes are available to add. Grades appear here
                once they exist on another school under {boardName}, or add a
                class from the Classes page first.
              </p>
            ) : (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
                {options.map((option) => {
                  const checked = selected.includes(option.name)
                  return (
                    <label
                      key={option.name}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                        checked
                          ? "border-[#6C5CE7] bg-[#6C5CE7]/[0.06]"
                          : "border-border/60 hover:bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleOption(option.name, value === true)
                        }
                        aria-label={option.displayName}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {option.displayName}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </fieldset>

          {formError ? (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
              disabled={pending || options.length === 0 || selected.length === 0}
            >
              {pending
                ? "Adding..."
                : selected.length > 0
                  ? `Add ${selected.length} class${selected.length === 1 ? "" : "es"}`
                  : "Add classes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
