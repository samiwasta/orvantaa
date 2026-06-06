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

import type { ClassSectionItem } from "../model/class-list-item"
import { createSectionAction, updateSectionAction } from "../server/actions"

type SectionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  classDisplayName: string
  section?: ClassSectionItem | null
  schoolCode?: string
}

export function SectionFormDialog({
  open,
  onOpenChange,
  classId,
  classDisplayName,
  section,
  schoolCode,
}: SectionFormDialogProps) {
  const isEdit = Boolean(section)
  const [name, setName] = useState("")

  const {
    run: runCreate,
    pending: createPending,
    fieldErrors: createFieldErrors,
    formError: createFormError,
    reset: resetCreate,
  } = useActionRunner(
    (input: { classId: string; name: string }) =>
      createSectionAction(input, schoolCode),
    {
      successMessage: "Section added",
      onSuccess: () => onOpenChange(false),
    }
  )

  const {
    run: runUpdate,
    pending: updatePending,
    fieldErrors: updateFieldErrors,
    formError: updateFormError,
    reset: resetUpdate,
  } = useActionRunner(
    (sectionName: string) =>
      updateSectionAction(section!.id, sectionName, schoolCode),
    {
      successMessage: "Section updated",
      onSuccess: () => onOpenChange(false),
    }
  )

  const pending = createPending || updatePending
  const fieldErrors = isEdit ? updateFieldErrors : createFieldErrors
  const formError = isEdit ? updateFormError : createFormError

  useEffect(() => {
    if (!open) return
    resetCreate()
    resetUpdate()
    setName(section?.name ?? "")
  }, [open, section, resetCreate, resetUpdate])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (isEdit) {
      runUpdate(name)
    } else {
      runCreate({ classId, name })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Rename this section in ${classDisplayName}.`
              : `Add a section to ${classDisplayName}, e.g. A or B.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="section-name" required>
              Section name
            </FieldLabel>
            <Input
              id="section-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. A"
              autoFocus
            />
            <FieldHint>Use short labels like A, B, or Science.</FieldHint>
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
              disabled={pending}
            >
              {pending ? "Saving..." : isEdit ? "Save section" : "Add section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
