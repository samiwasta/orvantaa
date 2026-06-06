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
import { Field, FieldError, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { ClassListItem } from "../model/class-list-item"
import { renameClassCatalogAction, updateClassAction } from "../server/actions"

type ClassManageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classItem: ClassListItem | null
  catalogMode?: boolean
}

export function ClassManageDialog({
  open,
  onOpenChange,
  classItem,
  catalogMode = false,
}: ClassManageDialogProps) {
  const [name, setName] = useState("")

  const catalogRunner = useActionRunner(renameClassCatalogAction, {
    successMessage: "Class updated",
    onSuccess: () => onOpenChange(false),
  })

  const schoolRunner = useActionRunner(updateClassAction, {
    successMessage: "Class updated",
    onSuccess: () => onOpenChange(false),
  })

  const pending = catalogMode ? catalogRunner.pending : schoolRunner.pending
  const fieldErrors = catalogMode
    ? catalogRunner.fieldErrors
    : schoolRunner.fieldErrors
  const formError = catalogMode ? catalogRunner.formError : schoolRunner.formError
  const reset = catalogMode ? catalogRunner.reset : schoolRunner.reset

  useEffect(() => {
    if (!open) return
    reset()
    setName(classItem?.className ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, classItem])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!classItem) return

    if (catalogMode) {
      catalogRunner.run({
        currentName: classItem.className,
        name,
      })
      return
    }

    schoolRunner.run(classItem.id, name)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit class</DialogTitle>
          <DialogDescription>
            {catalogMode
              ? "Rename this grade across all schools that use it."
              : "Update the class name."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="manage-class-name" required>
              Class / grade
            </FieldLabel>
            <Input
              id="manage-class-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 6"
              autoFocus
            />
            <FieldHint>Enter just the grade, e.g. 6 or 10.</FieldHint>
            <FieldError>{fieldErrors.name?.[0]}</FieldError>
          </Field>

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
              disabled={pending || !classItem}
            >
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
