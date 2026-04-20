# Backend TODO – Orvantaa auth and API integration

This list is for backend engineers wiring the dashboard auth UI to real services. The frontend currently uses **mock delays** and **client-only sessionStorage gates** for UX; production must replace these with secure server-side behavior.

## 1. Authentication API

- [ ] **POST `/api/auth/login` (or equivalent)**
  - Accept: username (or email) + password.
  - Return: session token / HTTP-only cookie / refresh strategy aligned with product security policy.
  - Replace the mock `setTimeout` in `use-login-controller.ts` with this call; handle 401/422 with field-safe or generic errors.

- [ ] **Session management**
  - Define how the dashboard knows the user is logged in (Next.js middleware, cookie session, Bearer token, etc.).
  - Redirect authenticated users away from `/auth` if already logged in (optional product rule).

- [ ] **“Remember for 30 days”**
  - UI checkbox exists; persist preference only if backend supports longer-lived refresh tokens or cookie max-age. Wire checkbox to login payload or follow-up preference API.

## 2. Forgot password (email reset)

- [ ] **POST `/api/auth/forgot-password` (or equivalent)**
  - Accept: email.
  - Behavior: always return generic success to avoid email enumeration (or follow explicit product decision).
  - Trigger transactional email with **time-limited, single-use token** link to reset page, e.g. `/reset-password?token=...`.

- [ ] **Email provider**
  - Integrate SendGrid, Resend, SES, etc.; templates for reset link; from-address and branding.

- [ ] **Rate limiting**
  - Per IP and/or per email on forgot-password endpoint to reduce abuse.

- [ ] **Remove reliance on sessionStorage for “sent” screen**
  - Optional: after successful API response, still navigate to `/forgot-password/sent` (UX can stay).
  - Do **not** treat client `sessionStorage` as authorization; it is UI-only gating today.

## 3. Reset password

- [ ] **GET validation (or POST pre-check)**
  - Validate reset token from query string before showing form or on submit: not expired, not used, matches user.

- [ ] **POST `/api/auth/reset-password` (or equivalent)**
  - Accept: token + new password (and confirm can be client-only).
  - Enforce same password policy as registration (match Zod rules or stricter server rules).
  - Invalidate token after success; optionally invalidate other sessions.

- [ ] **Success flow**
  - After API success, navigate to `/reset-password/success` (or return JSON and let frontend route).
  - Replace mock delay in `use-reset-password-controller.ts`.

## 4. Security and compliance

- [ ] **HTTPS only** for auth and reset links in production.
- [ ] **Token storage**: reset tokens hashed at rest; short TTL (e.g. 15–60 minutes).
- [ ] **Password hashing**: Argon2/bcrypt on server; never log passwords.
- [ ] **CSRF** for cookie-based POSTs if applicable.
- [ ] **CORS** if API is on a separate origin from the Next app.

## 5. Database (if applicable)

- [ ] User table: email uniqueness, password hash, optional username.
- [ ] Password reset tokens table: user id, token hash, expiry, used flag.
- [ ] Audit log for password changes and login failures (optional).

## 6. Observability

- [ ] Structured logging for auth failures (without PII secrets).
- [ ] Metrics: login success/failure, reset requests, email send failures.

## 7. Frontend integration checklist (coordination)

- [ ] Agree on **error shape** (e.g. `{ fieldErrors: { email: string[] } }` vs `message`).
- [ ] Update Zod schemas or API client types in `features/auth/model/` if server rules differ.
- [ ] Replace `FormData` + fetch in controllers with a shared `api` client module when ready.
- [ ] Middleware: protect app routes that require auth; public routes for `/auth`, `/forgot-password`, `/reset-password` (+ query token).

## 8. Out of scope for current UI (confirm with product)

- OAuth / SSO.
- MFA.
- Account registration screen (not present in described dashboard auth set).

---

_Prioritize items 1–3 for a minimal end-to-end auth loop with the existing screens._
