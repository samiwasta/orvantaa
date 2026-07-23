"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import {
  Building2,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  Search,
} from "lucide-react"
import * as React from "react"

import {
  AuthBrandMark,
  AuthCard,
  AuthPageShell,
} from "@/features/auth/view/auth-page-shell"

import type { OnboardingController } from "../controller/use-onboarding-controller"
import { FieldSelect } from "./field-select"

const fieldInputClass =
  "h-11 rounded-xl border-0 bg-[#F3F4F8] text-sm shadow-none placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#4169E1]/30"

export function OnboardingView(controller: OnboardingController) {
  const {
    boards,
    isLoadingBoards,
    schoolQuery,
    schoolId,
    suggestions,
    suggestionsOpen,
    setSuggestionsOpen,
    isSearching,
    isSubmitting,
    formError,
    fieldErrors,
    values,
    states,
    standards,
    canCreateSchool,
    updateValue,
    selectSchool,
    onSchoolQueryChange,
    onSubmit,
  } = controller

  const schoolBoxRef = React.useRef<HTMLDivElement>(null)

  const boardOptions = React.useMemo(
    () => boards.map((board) => ({ value: board.id, label: board.name })),
    [boards]
  )
  const standardOptions = React.useMemo(
    () =>
      standards.map((standard) => ({
        value: standard,
        label: `Class ${standard}`,
      })),
    [standards]
  )
  const stateOptions = React.useMemo(
    () => states.map((state) => ({ value: state, label: state })),
    [states]
  )

  React.useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!schoolBoxRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [setSuggestionsOpen])

  return (
    <AuthPageShell>
      <AuthCard className="max-w-[32rem]">
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <AuthBrandMark />
            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
                Academic details
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                Tell us about your school so we can personalize your learning
                experience.
              </p>
            </div>
          </div>

          <form className="space-y-4" noValidate onSubmit={onSubmit}>
            {formError ? (
              <p
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
                role="alert"
              >
                {formError}
              </p>
            ) : null}

            <div className="space-y-1.5" ref={schoolBoxRef}>
              <Label
                htmlFor="schoolName"
                className="text-sm font-medium text-slate-700"
              >
                Name of school
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="schoolName"
                  name="schoolName"
                  autoComplete="organization"
                  placeholder="Start typing your school name"
                  value={schoolQuery}
                  onChange={(e) => onSchoolQueryChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setSuggestionsOpen(true)
                  }}
                  aria-invalid={fieldErrors.schoolName ? true : undefined}
                  aria-expanded={suggestionsOpen}
                  aria-controls="school-suggestions"
                  className={cn(fieldInputClass, "pr-10 pl-10")}
                />
                {isSearching ? (
                  <Loader2
                    className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-slate-400"
                    aria-hidden
                  />
                ) : (
                  <Building2
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                )}

                {suggestionsOpen &&
                (suggestions.length > 0 || canCreateSchool) ? (
                  <div
                    id="school-suggestions"
                    className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[#E4E9F5] bg-white py-1 shadow-[0_18px_40px_-24px_rgba(45,70,140,0.45)]"
                    role="listbox"
                  >
                    {suggestions.map((school) => (
                      <button
                        key={school.id}
                        type="button"
                        role="option"
                        aria-selected={schoolId === school.id}
                        className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition hover:bg-[#F5F7FF]"
                        onClick={() => selectSchool(school)}
                      >
                        <span className="text-sm font-medium text-slate-900">
                          {school.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {[school.boardName, school.city, school.state]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </button>
                    ))}
                    {canCreateSchool ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 border-t border-[#EEF1F8] px-3 py-2.5 text-left text-sm font-medium text-[#4169E1] transition hover:bg-[#F5F7FF]"
                        onClick={() => {
                          setSuggestionsOpen(false)
                        }}
                      >
                        <Plus className="size-4" aria-hidden />
                        Add &quot;{schoolQuery.trim()}&quot; as a new school
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {schoolId ? (
                <p className="text-xs text-emerald-600">School selected</p>
              ) : canCreateSchool ? (
                <p className="text-xs text-slate-500">
                  No exact match yet. Continue to add this school.
                </p>
              ) : null}
              {fieldErrors.schoolName ? (
                <p className="text-sm text-red-600" role="alert">
                  {fieldErrors.schoolName}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="boardId"
                className="text-sm font-medium text-slate-700"
              >
                Board
              </Label>
              <FieldSelect
                id="boardId"
                name="boardId"
                value={values.boardId}
                placeholder={
                  isLoadingBoards ? "Loading boards..." : "Select board"
                }
                options={boardOptions}
                disabled={isLoadingBoards}
                invalid={Boolean(fieldErrors.boardId)}
                onChange={(next) => updateValue("boardId", next)}
              />
              {fieldErrors.boardId ? (
                <p className="text-sm text-red-600" role="alert">
                  {fieldErrors.boardId}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="standard"
                  className="text-sm font-medium text-slate-700"
                >
                  Standard
                </Label>
                <FieldSelect
                  id="standard"
                  name="standard"
                  value={values.standard}
                  placeholder="Select standard"
                  options={standardOptions}
                  invalid={Boolean(fieldErrors.standard)}
                  leadingIcon={<GraduationCap aria-hidden />}
                  onChange={(next) => updateValue("standard", next)}
                />
                {fieldErrors.standard ? (
                  <p className="text-sm text-red-600" role="alert">
                    {fieldErrors.standard}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="section"
                  className="text-sm font-medium text-slate-700"
                >
                  Section
                </Label>
                <Input
                  id="section"
                  name="section"
                  placeholder="e.g. A"
                  value={values.section}
                  onChange={(e) => updateValue("section", e.target.value)}
                  aria-invalid={fieldErrors.section ? true : undefined}
                  className={fieldInputClass}
                />
                {fieldErrors.section ? (
                  <p className="text-sm text-red-600" role="alert">
                    {fieldErrors.section}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-slate-700"
                >
                  City
                </Label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    placeholder="City"
                    value={values.city}
                    onChange={(e) => updateValue("city", e.target.value)}
                    aria-invalid={fieldErrors.city ? true : undefined}
                    className={cn(fieldInputClass, "pl-10")}
                  />
                </div>
                {fieldErrors.city ? (
                  <p className="text-sm text-red-600" role="alert">
                    {fieldErrors.city}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="state"
                  className="text-sm font-medium text-slate-700"
                >
                  State
                </Label>
                <FieldSelect
                  id="state"
                  name="state"
                  value={values.state}
                  placeholder="Select state"
                  options={stateOptions}
                  searchable
                  searchPlaceholder="Search state"
                  invalid={Boolean(fieldErrors.state)}
                  onChange={(next) => updateValue("state", next)}
                />
                {fieldErrors.state ? (
                  <p className="text-sm text-red-600" role="alert">
                    {fieldErrors.state}
                  </p>
                ) : null}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoadingBoards}
              aria-busy={isSubmitting}
              className="mt-2 h-11 w-full rounded-xl bg-[#4169E1] text-sm font-semibold tracking-wide text-white uppercase hover:bg-[#3558C8] disabled:opacity-80"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2 normal-case">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
