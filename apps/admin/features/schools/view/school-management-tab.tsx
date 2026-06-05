"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Plus, Trash2, Pencil } from "lucide-react"
import { useEffect, useState } from "react"

import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { SchoolContactListItem } from "../model/school-contact"
import {
  deleteSchoolContactAction,
  updateSchoolBillingEmailAction,
} from "../server/management-actions"
import { SchoolContactFormDialog } from "./school-contact-form-dialog"

type SchoolManagementTabProps = {
  schoolId: string
  schoolCode: string
  contacts: SchoolContactListItem[]
  billingEmail: string | null
}

export function SchoolManagementTab({
  schoolId,
  schoolCode,
  contacts,
  billingEmail,
}: SchoolManagementTabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolContactListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SchoolContactListItem | null>(null)
  const [billingEmailValue, setBillingEmailValue] = useState(billingEmail ?? "")

  const { run: runDelete, pending: deletePending } = useActionRunner(
    (id: string) => deleteSchoolContactAction(schoolId, schoolCode, id),
    {
      successMessage: "Contact removed",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  const {
    run: runSaveBilling,
    pending: billingPending,
    fieldErrors: billingFieldErrors,
    formError: billingFormError,
    reset: resetBilling,
  } = useActionRunner(
    (email: string) =>
      updateSchoolBillingEmailAction(schoolId, schoolCode, {
        billingEmail: email,
      }),
    { successMessage: "Billing email updated" }
  )

  useEffect(() => {
    setBillingEmailValue(billingEmail ?? "")
    resetBilling()
  }, [billingEmail, resetBilling])

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Management contacts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              People responsible for this school on the platform.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="h-9 shrink-0 rounded-lg bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
          >
            <Plus className="size-4" aria-hidden />
            Add contact
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Full name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Designation
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Phone number
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-white">
                {contacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      No management contacts yet. Add a contact to get started.
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {contact.fullName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {contact.designation}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {contact.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {contact.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                            aria-label={`Edit ${contact.fullName}`}
                            onClick={() => {
                              setEditing(contact)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${contact.fullName}`}
                            onClick={() => setDeleteTarget(contact)}
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
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-foreground">
            Subscription billing email
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used for Razorpay payment notifications (due, success, failed, and
            overdue).
          </p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-6 sm:pb-6 sm:pt-5">
          <Field className="max-w-md">
            <FieldLabel htmlFor="school-billing-email">Billing email</FieldLabel>
            <Input
              id="school-billing-email"
              type="email"
              value={billingEmailValue}
              onChange={(e) => setBillingEmailValue(e.target.value)}
              placeholder="billing@school.example.com"
              className="h-10 rounded-lg bg-white"
            />
            <FieldHint>
              Leave empty to use the fallback from environment configuration.
            </FieldHint>
            <FieldError>{billingFieldErrors.billingEmail?.[0]}</FieldError>
          </Field>
          <Button
            type="button"
            className="h-10 shrink-0 rounded-lg bg-[#6C5CE7] px-5 font-semibold text-white hover:bg-[#6C5CE7]/90"
            disabled={
              billingPending ||
              billingEmailValue.trim() === (billingEmail ?? "").trim()
            }
            onClick={() => runSaveBilling(billingEmailValue)}
          >
            {billingPending ? "Saving..." : "Save billing email"}
          </Button>
        </div>
        {billingFormError ? (
          <p className="px-5 pb-5 text-sm font-medium text-destructive sm:px-6">
            {billingFormError}
          </p>
        ) : null}
      </section>

      <SchoolContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schoolId={schoolId}
        schoolCode={schoolCode}
        contact={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Remove contact"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.fullName} from this school?`
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
