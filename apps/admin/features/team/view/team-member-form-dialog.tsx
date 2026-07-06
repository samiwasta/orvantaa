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

import type { UserGender } from "@/features/user/model/user"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import { RefreshCw } from "lucide-react"
import {
  createTeamMemberAction,
  generateTeamPasswordAction,
} from "../server/team-actions"

type TeamMemberFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamMemberFormDialog({
  open,
  onOpenChange,
}: TeamMemberFormDialogProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState<UserGender>("female")
  const [password, setPassword] = useState("")
  const [regenerating, setRegenerating] = useState(false)

  const { run, pending, fieldErrors, formError, reset } = useActionRunner(
    createTeamMemberAction,
    {
      successMessage: "Admin created and invite email sent",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setFirstName("")
    setLastName("")
    setUsername("")
    setEmail("")
    setGender("female")
    void loadPassword()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function loadPassword() {
    setRegenerating(true)
    const result = await generateTeamPasswordAction()
    if (result.ok) {
      setPassword(result.data.password)
    }
    setRegenerating(false)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    run({
      firstName,
      lastName,
      username,
      email,
      gender,
      password,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add admin</DialogTitle>
          <DialogDescription>
            Create an admin account. They will receive an email with login
            credentials and a link to set their password on the admin portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="team-first-name" required>
                First name
              </FieldLabel>
              <Input
                id="team-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <FieldError>{fieldErrors.firstName?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="team-last-name">Last name</FieldLabel>
              <Input
                id="team-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <FieldError>{fieldErrors.lastName?.[0]}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="team-username" required>
              Username
            </FieldLabel>
            <Input
              id="team-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
            <FieldError>{fieldErrors.username?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="team-email" required>
              Email
            </FieldLabel>
            <Input
              id="team-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldError>{fieldErrors.email?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel required>Gender</FieldLabel>
            <Select
              value={gender}
              onValueChange={(value) => setGender(value as UserGender)}
            >
              <SelectTrigger id="team-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.gender?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="team-password" required>
              Temporary password
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="team-password"
                value={password}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl"
                onClick={() => void loadPassword()}
                disabled={regenerating || pending}
                aria-label="Generate new password"
              >
                <RefreshCw
                  className={regenerating ? "size-4 animate-spin" : "size-4"}
                  aria-hidden
                />
              </Button>
            </div>
            <FieldHint>Generated automatically and included in the invite email.</FieldHint>
            <FieldError>{fieldErrors.password?.[0]}</FieldError>
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
              disabled={pending || regenerating || !password}
            >
              {pending ? "Creating..." : "Add admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
