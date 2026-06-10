"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Eye, EyeOff, GraduationCap, LockKeyhole, School } from "lucide-react"
import { useState } from "react"

import { avatarSrcForUserGender } from "@/features/sidebar/model/user-gender"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { ProfilePageData } from "../model/profile"
import { formatUserFullName } from "../model/user"
import {
  changeProfilePasswordAction,
  updateProfileAction,
} from "../server/profile-actions"

type ProfileViewProps = {
  profile: ProfilePageData
}

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileView({ profile: initialProfile }: ProfileViewProps) {
  const [firstName, setFirstName] = useState(initialProfile.firstName)
  const [lastName, setLastName] = useState(initialProfile.lastName)
  const [email, setEmail] = useState(initialProfile.email)
  const [phone, setPhone] = useState(initialProfile.phone ?? "")
  const [gender, setGender] = useState(initialProfile.gender)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const displayName =
    formatUserFullName(firstName, lastName) || initialProfile.username
  const avatarSrc = avatarSrcForUserGender(gender)

  const {
    run: runUpdateProfile,
    pending: profilePending,
    fieldErrors: profileFieldErrors,
    formError: profileFormError,
  } = useActionRunner(updateProfileAction, {
    successMessage: "Profile updated",
  })

  const {
    run: runChangePassword,
    pending: passwordPending,
    fieldErrors: passwordFieldErrors,
    formError: passwordFormError,
    reset: resetPasswordForm,
  } = useActionRunner(changeProfilePasswordAction, {
    successMessage: "Password updated",
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      resetPasswordForm()
    },
  })

  function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    runUpdateProfile({
      firstName,
      lastName,
      email,
      phone,
      gender,
    })
  }

  function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    runChangePassword({
      currentPassword,
      newPassword,
      confirmNewPassword,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details, school account, and password.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center gap-4 border-b border-border/50 px-5 py-5 sm:px-6">
          <Avatar className="size-14">
            <AvatarImage src={avatarSrc} alt="" />
            <AvatarFallback className="bg-[#6C5CE7]/15 text-[#6C5CE7]">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              @{initialProfile.username}
            </p>
            {initialProfile.classLabel ? (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {initialProfile.classLabel}
              </p>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="flex flex-col gap-5 p-5 sm:px-6 sm:pt-5 sm:pb-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="profile-first-name" required>
                First name
              </FieldLabel>
              <Input
                id="profile-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
              <FieldError>{profileFieldErrors.firstName?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-last-name">Last name</FieldLabel>
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
              <FieldError>{profileFieldErrors.lastName?.[0]}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="profile-email" required>
              Email
            </FieldLabel>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <FieldError>{profileFieldErrors.email?.[0]}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
              <Input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="Optional"
              />
              <FieldError>{profileFieldErrors.phone?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel required>Gender</FieldLabel>
              <Select
                value={gender}
                onValueChange={(value) =>
                  setGender(value as ProfilePageData["gender"])
                }
              >
                <SelectTrigger id="profile-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
              <FieldHint>Updates your avatar across the dashboard.</FieldHint>
              <FieldError>{profileFieldErrors.gender?.[0]}</FieldError>
            </Field>
          </div>

          {profileFormError ? (
            <p className="text-sm font-medium text-destructive">
              {profileFormError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
              disabled={profilePending}
            >
              {profilePending ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="border-b border-border/50 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-foreground">
            School account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These details are managed by your school and cannot be changed here.
          </p>
        </div>
        <dl className="divide-y divide-border/50">
          <div className="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <School className="size-4 shrink-0 text-[#6C5CE7]" aria-hidden />
              School
            </dt>
            <dd className="text-right text-sm font-medium">
              {initialProfile.schoolName ?? "Not assigned"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap
                className="size-4 shrink-0 text-[#6C5CE7]"
                aria-hidden
              />
              Class
            </dt>
            <dd className="text-right text-sm font-medium">
              {initialProfile.classLabel ?? "Not assigned"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6">
            <dt className="text-sm text-muted-foreground">Username</dt>
            <dd className="text-right text-sm font-medium">
              @{initialProfile.username}
            </dd>
          </div>
          {initialProfile.studentCode ? (
            <div className="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6">
              <dt className="text-sm text-muted-foreground">Student ID</dt>
              <dd className="text-right text-sm font-medium">
                {initialProfile.studentCode}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="border-b border-border/50 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-foreground">
            Change password
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a strong password with at least 8 characters.
          </p>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="flex flex-col gap-4 p-5 sm:px-6 sm:pt-5 sm:pb-6"
        >
          <Field>
            <FieldLabel htmlFor="profile-current-password" required>
              Current password
            </FieldLabel>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="profile-current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <FieldError>{passwordFieldErrors.currentPassword?.[0]}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="profile-new-password" required>
                New password
              </FieldLabel>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="profile-new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldError>{passwordFieldErrors.newPassword?.[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-confirm-password" required>
                Confirm new password
              </FieldLabel>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="profile-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldError>
                {passwordFieldErrors.confirmNewPassword?.[0]}
              </FieldError>
            </Field>
          </div>

          {passwordFormError ? (
            <p className="text-sm font-medium text-destructive">
              {passwordFormError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              className="rounded-xl"
              disabled={passwordPending}
            >
              {passwordPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
