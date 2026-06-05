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
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { SchoolContactListItem } from "../model/school-contact"
import {
  createSchoolContactAction,
  updateSchoolContactAction,
} from "../server/management-actions"

type SchoolContactFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolCode: string
  contact?: SchoolContactListItem | null
}

export function SchoolContactFormDialog({
  open,
  onOpenChange,
  schoolId,
  schoolCode,
  contact,
}: SchoolContactFormDialogProps) {
  const isEdit = Boolean(contact)

  const [fullName, setFullName] = useState("")
  const [designation, setDesignation] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const { run, pending, fieldErrors, formError, reset } = useActionRunner(
    ((...args: unknown[]) =>
      isEdit
        ? updateSchoolContactAction(
            schoolId,
            schoolCode,
            args[0] as string,
            args[1] as Record<string, unknown>
          )
        : createSchoolContactAction(schoolId, schoolCode, args[0])) as never,
    {
      successMessage: isEdit ? "Contact updated" : "Contact added",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setFullName(contact?.fullName ?? "")
    setDesignation(contact?.designation ?? "")
    setEmail(contact?.email ?? "")
    setPhone(contact?.phone ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const payload = { fullName, designation, email, phone }
    if (isEdit && contact) {
      run(contact.id, payload)
    } else {
      run(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update contact" : "Add contact"}</DialogTitle>
          <DialogDescription>
            School management contact for billing and administration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="contact-full-name" required>
              Full name
            </FieldLabel>
            <Input
              id="contact-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoFocus
            />
            <FieldError>{fieldErrors.fullName?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="contact-designation" required>
              Designation
            </FieldLabel>
            <Input
              id="contact-designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Principal, Admin Officer"
            />
            <FieldError>{fieldErrors.designation?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="contact-email" required>
              Email
            </FieldLabel>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldError>{fieldErrors.email?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="contact-phone">Phone number</FieldLabel>
            <Input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
            <FieldError>{fieldErrors.phone?.[0]}</FieldError>
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
