"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { SchoolListItem } from "../model/school-list-item"
import { updateSchoolSubscriptionAction } from "../server/student-actions"
import { SubscriptionStatusBadge } from "./school-status-badges"

type SchoolSubscriptionTabProps = {
  school: SchoolListItem
}

export function SchoolSubscriptionTab({ school }: SchoolSubscriptionTabProps) {
  const [status, setStatus] = useState(school.subscriptionStatus)

  const { run, pending, fieldErrors, formError } = useActionRunner(
    (subscriptionStatus: SchoolListItem["subscriptionStatus"]) =>
      updateSchoolSubscriptionAction(school.id, school.schoolCode, {
        subscriptionStatus,
      }),
    { successMessage: "Subscription updated" }
  )

  return (
    <div className="max-w-md rounded-xl border border-border/60 bg-muted/15 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Subscription status</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Controls platform access for this school.
          </p>
        </div>
        <SubscriptionStatusBadge school={{ ...school, subscriptionStatus: status }} />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <Field>
          <FieldLabel required>Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as SchoolListItem["subscriptionStatus"])
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
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

        <Button
          type="button"
          className="w-full rounded-lg bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90 sm:w-auto"
          disabled={pending || status === school.subscriptionStatus}
          onClick={() => run(status)}
        >
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
