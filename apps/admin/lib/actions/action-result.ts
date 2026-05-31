import { z } from "zod"

export type FieldErrors = Record<string, string[]>

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors }

export function actionOk<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message }
}

export function actionError(
  error: string,
  fieldErrors?: FieldErrors
): ActionResult<never> {
  return { ok: false, error, fieldErrors }
}

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form"
    fieldErrors[key] ??= []
    fieldErrors[key].push(issue.message)
  }
  return fieldErrors
}

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; result: ActionResult<never> }

export function parseInput<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown
): ParseResult<z.infer<S>> {
  const parsed = schema.safeParse(raw)
  if (parsed.success) {
    return { success: true, data: parsed.data }
  }
  return {
    success: false,
    result: actionError(
      "Please fix the highlighted fields.",
      zodFieldErrors(parsed.error)
    ),
  }
}

export class UniqueConstraintError extends Error {
  constructor(message = "A record with these details already exists.") {
    super(message)
    this.name = "UniqueConstraintError"
  }
}
