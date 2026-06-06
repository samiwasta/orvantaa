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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type {
  ClassInput,
  ClassListItem,
  SchoolOption,
} from "../model/class-list-item"
import {
  createClassAction,
  createClassCatalogAction,
  updateClassAction,
} from "../server/actions"

type ClassFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classItem?: ClassListItem | null
  mode?: "school" | "catalog"
  schoolOptions?: SchoolOption[]
  defaultSchoolId?: string
  defaultSchoolName?: string
  revalidateSchoolCode?: string
}

export function ClassFormDialog({
  open,
  onOpenChange,
  classItem,
  mode = "school",
  schoolOptions = [],
  defaultSchoolId,
  defaultSchoolName,
  revalidateSchoolCode,
}: ClassFormDialogProps) {
  const isEdit = Boolean(classItem)
  const isCatalog = mode === "catalog"
  const schoolLocked = Boolean(defaultSchoolId && !isEdit && !isCatalog)

  const [schoolId, setSchoolId] = useState("")
  const [name, setName] = useState("")

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [ClassInput] | [string, string] | [{ name: string }],
    undefined
  >(
    ((...args: unknown[]) => {
      if (isEdit) {
        return updateClassAction(
          args[0] as string,
          args[1] as string,
          revalidateSchoolCode
        )
      }
      if (isCatalog) {
        return createClassCatalogAction(args[0])
      }
      return createClassAction(args[0] as ClassInput, revalidateSchoolCode)
    }) as never,
    {
      successMessage: isEdit ? "Class updated" : "Class created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setSchoolId(classItem?.schoolId ?? defaultSchoolId ?? "")
    setName(classItem?.className ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, classItem])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (isEdit && classItem) {
      run(classItem.id, name)
    } else if (isCatalog) {
      run({ name })
    } else {
      run({ schoolId, name })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit class" : "Add class"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename this class (grade) for its school."
              : isCatalog
                ? "Add a grade (e.g. 6, 10). It becomes available across schools."
                : "Add a grade (e.g. 6, 10) to a school. Sections are managed inside the class."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isCatalog && isEdit ? (
            <Field>
              <FieldLabel>School</FieldLabel>
              <Input value={classItem?.schoolName ?? ""} disabled />
            </Field>
          ) : null}

          {!isCatalog && !isEdit && schoolLocked ? (
            <Field>
              <FieldLabel>School</FieldLabel>
              <Input value={defaultSchoolName ?? ""} disabled />
            </Field>
          ) : null}

          {!isCatalog && !isEdit && !schoolLocked ? (
            <Field>
              <FieldLabel required>School</FieldLabel>
              <Select value={schoolId} onValueChange={setSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schoolOptions.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{fieldErrors.schoolId?.[0]}</FieldError>
            </Field>
          ) : null}

          <Field>
            <FieldLabel htmlFor="class-name" required>
              Class / grade
            </FieldLabel>
            <Input
              id="class-name"
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
              disabled={pending}
            >
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
