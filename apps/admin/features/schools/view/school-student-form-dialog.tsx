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
  SchoolSectionOption,
  SchoolStudentListItem,
} from "../model/school-student-list-item"
import {
  createSchoolStudentAction,
  updateSchoolStudentAction,
} from "../server/student-actions"

type SchoolStudentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolCode: string
  sectionOptions: SchoolSectionOption[]
  student?: SchoolStudentListItem | null
}

export function SchoolStudentFormDialog({
  open,
  onOpenChange,
  schoolId,
  schoolCode,
  sectionOptions,
  student,
}: SchoolStudentFormDialogProps) {
  const isEdit = Boolean(student)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [sectionId, setSectionId] = useState("")
  const [password, setPassword] = useState("")

  const { run, pending, fieldErrors, formError, reset } = useActionRunner(
    ((...args: unknown[]) =>
      isEdit
        ? updateSchoolStudentAction(
            schoolId,
            schoolCode,
            args[0] as string,
            args[1] as Record<string, unknown>
          )
        : createSchoolStudentAction(schoolId, schoolCode, args[0])) as never,
    {
      successMessage: isEdit ? "Student updated" : "Student created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setFirstName(student?.firstName ?? "")
    setLastName(student?.lastName ?? "")
    setEmail(student?.email ?? "")
    setPhone(student?.phone ?? "")
    setSectionId(student?.sectionId ?? sectionOptions[0]?.id ?? "")
    setPassword("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student, sectionOptions])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const payload = {
      firstName,
      lastName,
      email,
      phone,
      sectionId,
      ...(isEdit
        ? { password: password.trim() === "" ? undefined : password }
        : {}),
    }
    if (isEdit && student) {
      run(student.id, payload)
    } else {
      run(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update student" : "Add student"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update student details. Leave password blank to keep the current one."
              : "Student code and password are generated automatically. Use Send credentials to email login details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="student-first-name" required>
                First name
              </FieldLabel>
              <Input
                id="student-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <FieldError>{fieldErrors.firstName?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="student-last-name">Last name</FieldLabel>
              <Input
                id="student-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <FieldError>{fieldErrors.lastName?.[0]}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel required>Class & section</FieldLabel>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.classDisplayName} · {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.sectionId?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="student-email" required>
              Email
            </FieldLabel>
            <Input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldError>{fieldErrors.email?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="student-phone">Phone number</FieldLabel>
            <Input
              id="student-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
            <FieldError>{fieldErrors.phone?.[0]}</FieldError>
          </Field>

          {isEdit ? (
            <Field>
              <FieldLabel htmlFor="student-password">Password</FieldLabel>
              <Input
                id="student-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
              />
              <FieldError>{fieldErrors.password?.[0]}</FieldError>
            </Field>
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
