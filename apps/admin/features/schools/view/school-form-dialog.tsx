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
  SchoolCreateInput,
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
  const [billingEmail, setBillingEmail] = useState("")
  const [contactFullName, setContactFullName] = useState("")
  const [contactDesignation, setContactDesignation] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [SchoolInput | SchoolCreateInput] | [string, SchoolInput],
    undefined
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateSchoolAction(args[0] as string, args[1] as SchoolInput)
        : createSchoolAction(args[0] as SchoolCreateInput)) as never,
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
    setBillingEmail("")
    setContactFullName("")
    setContactDesignation("")
    setContactEmail("")
    setContactPhone("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, school])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (isEdit && school) {
      const input: SchoolInput = {
        name,
        code: code.trim() === "" ? null : code.trim(),
        boardId,
        subscriptionStatus,
      }
      run(school.id, input)
      return
    }

    const input: SchoolCreateInput = {
      name,
      code: code.trim() === "" ? null : code.trim(),
      boardId,
      subscriptionStatus,
      billingEmail: billingEmail.trim() === "" ? null : billingEmail.trim(),
      contact: {
        fullName: contactFullName,
        designation: contactDesignation,
        email: contactEmail,
        phone: contactPhone.trim() === "" ? null : contactPhone.trim(),
      },
    }
    run(input)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit school" : "Add school"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this school's details."
              : "Create a school, assign a board, and add billing and management details."}
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

          {!isEdit ? (
            <>
              <div className="border-t border-border/60 pt-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Billing email
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Used for subscription invoices and payment links.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="school-billing-email">
                  Billing email
                </FieldLabel>
                <Input
                  id="school-billing-email"
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="billing@school.edu"
                  autoComplete="email"
                />
                <FieldHint>Optional. Can be updated later on the Management tab.</FieldHint>
                <FieldError>{fieldErrors.billingEmail?.[0]}</FieldError>
              </Field>

              <div className="border-t border-border/60 pt-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Management contact
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Primary contact for billing and administration.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="contact-full-name" required>
                  Full name
                </FieldLabel>
                <Input
                  id="contact-full-name"
                  value={contactFullName}
                  onChange={(e) => setContactFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
                <FieldError>{fieldErrors["contact.fullName"]?.[0]}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-designation" required>
                  Designation
                </FieldLabel>
                <Input
                  id="contact-designation"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                  placeholder="e.g. Principal"
                />
                <FieldError>{fieldErrors["contact.designation"]?.[0]}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-email" required>
                  Email
                </FieldLabel>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  autoComplete="email"
                />
                <FieldError>{fieldErrors["contact.email"]?.[0]}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-phone">Phone number</FieldLabel>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Optional"
                  autoComplete="tel"
                />
                <FieldError>{fieldErrors["contact.phone"]?.[0]}</FieldError>
              </Field>
            </>
          ) : null}

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
