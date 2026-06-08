export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string }

export function actionOk<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message }
}

export function actionError(error: string): ActionResult<never> {
  return { ok: false, error }
}
