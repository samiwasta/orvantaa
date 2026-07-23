export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid username or password.")
    this.name = "InvalidCredentialsError"
  }
}

export class SchoolSubscriptionBlockedError extends Error {
  readonly status: "inactive" | "hold" | "blocked"

  constructor(status: "inactive" | "hold" | "blocked", message: string) {
    super(message)
    this.name = "SchoolSubscriptionBlockedError"
    this.status = status
  }
}

export class LoginModeMismatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LoginModeMismatchError"
  }
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("An account with this email already exists.")
    this.name = "EmailAlreadyRegisteredError"
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super("This reset link is invalid or has expired.")
    this.name = "InvalidResetTokenError"
  }
}
