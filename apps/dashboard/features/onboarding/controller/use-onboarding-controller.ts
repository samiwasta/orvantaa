"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { ACADEMIC_STANDARDS, INDIAN_STATES } from "../model/academic-options"
import {
  fieldErrorsFromZod,
  onboardingSchema,
  type OnboardingValues,
} from "../model/schemas"
import type {
  OnboardingBoardOption,
  OnboardingSchoolSuggestion,
} from "../model/types"

export type OnboardingFieldName = keyof OnboardingValues

export function useOnboardingController() {
  const router = useRouter()
  const [boards, setBoards] = React.useState<OnboardingBoardOption[]>([])
  const [schoolQuery, setSchoolQuery] = React.useState("")
  const [schoolId, setSchoolId] = React.useState<string | null>(null)
  const [suggestions, setSuggestions] = React.useState<
    OnboardingSchoolSuggestion[]
  >([])
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false)
  const [isLoadingBoards, setIsLoadingBoards] = React.useState(true)
  const [isSearching, setIsSearching] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<OnboardingFieldName, string>>
  >({})
  const [values, setValues] = React.useState({
    boardId: "",
    city: "",
    state: "",
    standard: "",
    section: "",
  })

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch("/api/onboarding/boards")
        if (!response.ok) return
        const data = (await response.json()) as {
          boards?: OnboardingBoardOption[]
        }
        if (!cancelled) {
          setBoards(data.boards ?? [])
        }
      } finally {
        if (!cancelled) setIsLoadingBoards(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (schoolId) return
    const q = schoolQuery.trim()
    if (q.length < 1) {
      setSuggestions([])
      return
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true)
        try {
          const response = await fetch(
            `/api/onboarding/schools?q=${encodeURIComponent(q)}`
          )
          if (!response.ok) return
          const data = (await response.json()) as {
            schools?: OnboardingSchoolSuggestion[]
          }
          setSuggestions(data.schools ?? [])
          setSuggestionsOpen(true)
        } finally {
          setIsSearching(false)
        }
      })()
    }, 220)

    return () => window.clearTimeout(handle)
  }, [schoolQuery, schoolId])

  const clearFieldError = React.useCallback((field: OnboardingFieldName) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(null)
  }, [])

  const updateValue = React.useCallback(
    <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }))
      clearFieldError(key)
    },
    [clearFieldError]
  )

  const selectSchool = React.useCallback(
    (school: OnboardingSchoolSuggestion) => {
      setSchoolId(school.id)
      setSchoolQuery(school.name)
      setSuggestions([])
      setSuggestionsOpen(false)
      setValues((prev) => ({
        ...prev,
        boardId: school.boardId,
        city: school.city ?? prev.city,
        state: school.state ?? prev.state,
      }))
      clearFieldError("schoolName")
      clearFieldError("boardId")
      clearFieldError("city")
      clearFieldError("state")
    },
    [clearFieldError]
  )

  const onSchoolQueryChange = React.useCallback(
    (value: string) => {
      setSchoolId(null)
      setSchoolQuery(value)
      clearFieldError("schoolName")
    },
    [clearFieldError]
  )

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isSubmitting) return

      const parsed = onboardingSchema.safeParse({
        schoolId,
        schoolName: schoolQuery,
        boardId: values.boardId,
        city: values.city,
        state: values.state,
        standard: values.standard,
        section: values.section,
      })

      if (!parsed.success) {
        setFieldErrors(fieldErrorsFromZod(parsed.error))
        setFormError(null)
        return
      }

      setIsSubmitting(true)
      setFormError(null)
      setFieldErrors({})

      void (async () => {
        try {
          const response = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          })
          const data = (await response.json()) as {
            message?: string
            fieldErrors?: Partial<Record<OnboardingFieldName, string>>
          }

          if (!response.ok) {
            if (data.fieldErrors) setFieldErrors(data.fieldErrors)
            setFormError(data.message ?? "Could not save your details.")
            return
          }

          router.push("/dashboard")
          router.refresh()
        } catch {
          setFormError("Unable to reach the server. Please try again.")
        } finally {
          setIsSubmitting(false)
        }
      })()
    },
    [isSubmitting, router, schoolId, schoolQuery, values]
  )

  const exactSchoolMatch = suggestions.some(
    (school) =>
      school.name.trim().toLowerCase() === schoolQuery.trim().toLowerCase()
  )

  return {
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
    states: INDIAN_STATES,
    standards: ACADEMIC_STANDARDS,
    canCreateSchool:
      schoolQuery.trim().length >= 2 && !schoolId && !exactSchoolMatch,
    clearFieldError,
    updateValue,
    selectSchool,
    onSchoolQueryChange,
    onSubmit,
  }
}

export type OnboardingController = ReturnType<typeof useOnboardingController>
