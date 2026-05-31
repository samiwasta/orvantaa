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
  SectionOption,
  StudentCreateInput,
  StudentListItem,
} from "../model/student-list-item"
import { createStudentAction, updateStudentAction } from "../server/actions"

const UNASSIGNED = "__unassigned__"

type StudentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: StudentListItem | null
  sectionOptions: SectionOption[]
}

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  sectionOptions,
}: StudentFormDialogProps) {
  const isEdit = Boolean(student)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [sectionId, setSectionId] = useState(UNASSIGNED)

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [StudentCreateInput] | [string, StudentCreateInput],
    undefined
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateStudentAction(args[0] as string, args[1] as StudentCreateInput)
        : createStudentAction(args[0] as StudentCreateInput)) as never,
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
    setUsername(student?.username ?? "")
    setEmail(student?.email ?? "")
    setPassword("")
    setGender(student?.gender ?? "male")
    setSectionId(student?.sectionId ?? UNASSIGNED)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const input = {
      firstName,
      lastName,
      username,
      email,
      password,
      gender,
      sectionId: sectionId === UNASSIGNED ? null : sectionId,
    }
    if (isEdit && student) {
      run(student.id, input as StudentCreateInput)
    } else {
      run(input as StudentCreateInput)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit student" : "Add student"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this student's profile and section."
              : "Create a student account and assign them to a section."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="student-first" required>
                First name
              </FieldLabel>
              <Input
                id="student-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <FieldError>{fieldErrors.firstName?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="student-last">Last name</FieldLabel>
              <Input
                id="student-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <FieldError>{fieldErrors.lastName?.[0]}</FieldError>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="student-username" required>
                Username
              </FieldLabel>
              <Input
                id="student-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FieldError>{fieldErrors.username?.[0]}</FieldError>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel required={!isEdit} htmlFor="student-password">
                Password
              </FieldLabel>
              <Input
                id="student-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current" : ""}
              />
              <FieldError>{fieldErrors.password?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel required>Gender</FieldLabel>
              <Select
                value={gender}
                onValueChange={(v) => setGender(v as "male" | "female")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>{fieldErrors.gender?.[0]}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel>Section</FieldLabel>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {sectionOptions.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Students see content for their assigned section.</FieldHint>
            <FieldError>{fieldErrors.sectionId?.[0]}</FieldError>
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
