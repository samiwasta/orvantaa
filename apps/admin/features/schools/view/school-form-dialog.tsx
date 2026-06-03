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
  BoardOption,
  SchoolInput,
  SchoolListItem,
} from "../model/school-list-item"
import { createSchoolAction, updateSchoolAction } from "../server/actions"

type SchoolFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  school?: SchoolListItem | null
  boardOptions: BoardOption[]
}

export function SchoolFormDialog({
  open,
  onOpenChange,
  school,
  boardOptions,
}: SchoolFormDialogProps) {
  const isEdit = Boolean(school)

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [boardId, setBoardId] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    SchoolListItem["subscriptionStatus"]
  >("active")

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [SchoolInput] | [string, SchoolInput],
    undefined
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateSchoolAction(args[0] as string, args[1] as SchoolInput)
        : createSchoolAction(args[0] as SchoolInput)) as never,
    {
      successMessage: isEdit ? "School updated" : "School created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setName(school?.name ?? "")
    setCode(school?.code ?? "")
    setBoardId(school?.boardId ?? "")
    setSubscriptionStatus(school?.subscriptionStatus ?? "active")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, school])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const input: SchoolInput = {
      name,
      code: code.trim() === "" ? null : code.trim(),
      boardId,
      subscriptionStatus,
    }
    if (isEdit && school) {
      run(school.id, input)
    } else {
      run(input)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit school" : "Add school"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this school's details."
              : "Create a school and assign it to a board."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="school-name" required>
              School name
            </FieldLabel>
            <Input
              id="school-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Orvantaa Public School"
              autoFocus
            />
            <FieldError>{fieldErrors.name?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel required>Board</FieldLabel>
            <Select value={boardId} onValueChange={setBoardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a board" />
              </SelectTrigger>
              <SelectContent>
                {boardOptions.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                    <span className="text-muted-foreground"> · {board.kindLabel}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.boardId?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="school-code">School code</FieldLabel>
            <Input
              id="school-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Optional unique code"
            />
            <FieldHint>Leave blank to auto-display a short id.</FieldHint>
            <FieldError>{fieldErrors.code?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel required>Subscription</FieldLabel>
            <Select
              value={subscriptionStatus}
              onValueChange={(value) =>
                setSubscriptionStatus(value as SchoolListItem["subscriptionStatus"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.subscriptionStatus?.[0]}</FieldError>
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create school"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
