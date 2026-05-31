"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useState, useTransition } from "react"

import type { ActionResult, FieldErrors } from "./action-result"

type UseActionRunnerOptions<T> = {
  successMessage?: string
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export function useActionRunner<Args extends unknown[], T>(
  action: (...args: Args) => Promise<ActionResult<T>>,
  options?: UseActionRunnerOptions<T>
) {
  const [pending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  function run(...args: Args) {
    startTransition(async () => {
      const result = await action(...args)
      if (result.ok) {
        setFieldErrors({})
        setFormError(null)
        toast.success(options?.successMessage ?? result.message ?? "Saved")
        options?.onSuccess?.(result.data)
      } else {
        setFieldErrors(result.fieldErrors ?? {})
        setFormError(result.error)
        toast.error(result.error)
        options?.onError?.(result.error)
      }
    })
  }

  function reset() {
    setFieldErrors({})
    setFormError(null)
  }

  return { run, pending, fieldErrors, formError, reset }
}
