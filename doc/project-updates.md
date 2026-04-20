# Orvantaa dashboard – project updates

This document summarizes frontend and structural changes made to the dashboard auth area and related architecture. Use it for onboarding and handoff.

## Architecture (MVC-style)

Auth UI is organized under `apps/dashboard/features/auth/`:

| Layer          | Path                        | Purpose                                                                         |
| -------------- | --------------------------- | ------------------------------------------------------------------------------- |
| **Model**      | `features/auth/model/`      | Zod schemas, field-error helpers, client session flags for gated screens        |
| **Controller** | `features/auth/controller/` | React hooks: validation, submit flows, loading state, navigation, session gates |
| **View**       | `features/auth/view/`       | Presentational components (props only)                                          |
| **Screens**    | `features/auth/screens/`    | Composes controller + view; imported by App Router pages                        |

Next.js routes under `apps/dashboard/app/(auth)/` remain thin: `page.tsx` files set metadata and render the matching screen from `@/features/auth/screens/...`.

## Dependencies

- **`zod`** (`apps/dashboard`) – form validation and shared schemas in `features/auth/model/schemas.ts`.

Zustand was not added; form state lives in controller hooks.

## Auth routes and behavior

| Route                     | Screen                  | Notes                                                                                                             |
| ------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/auth`                   | Login                   | Username + password; Zod validation; mock delay on submit (no real API yet).                                      |
| `/forgot-password`        | Forgot password         | Email field; validation; mock “send link”; then navigates to sent screen. Session flag cleared on mount.          |
| `/forgot-password/sent`   | Email sent confirmation | Only shown if user arrived via successful submit (sessionStorage gate). Otherwise redirect to `/forgot-password`. |
| `/reset-password`         | New password            | Two fields + match validation; mock reset; then `/reset-password/success`. Session flag cleared on mount.         |
| `/reset-password/success` | Password updated        | Gated like forgot-password sent; otherwise redirect to `/reset-password`.                                         |

Session keys (client-only, not security boundaries for production APIs):

- Forgot flow: `orvantaa:forgot-password-link-sent`
- Reset flow: `orvantaa:reset-password-success`

## Validation rules (Zod)

- **Login:** username required, max 64 chars; password required, min 8 chars.
- **Forgot password:** email required, valid email format.
- **Reset password:** new password 8–128 chars; confirm required; passwords must match.

Errors render per field with `aria-invalid` / `aria-describedby` where applicable.

## UI notes

- Shared marketing column: `features/auth/view/auth-marketing-column.tsx` (used on several auth views).
- Login view keeps a distinct hero with floating feature chips; heading uses “Welcome back” (no emoji in current implementation).

## Removed / replaced locations

- Previous inline screens and `lib/auth-schemas.ts` under `apps/dashboard` were removed in favor of `features/auth/`.
- Old flow files (`forgot-password-flow.ts`, `reset-password-flow.ts`) next to routes were replaced by `features/auth/model/*-session.ts`.

## Related files (quick reference)

- Schemas: `apps/dashboard/features/auth/model/schemas.ts`
- App pages: `apps/dashboard/app/(auth)/auth/page.tsx`, `forgot-password/page.tsx`, `forgot-password/sent/page.tsx`, `reset-password/page.tsx`, `reset-password/success/page.tsx`

---

_Last updated to reflect auth feature structure, validation, gated screens, and MVC layout._
