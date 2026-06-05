export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid username or password.")
    this.name = "InvalidCredentialsError"
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super("This reset link is invalid or has expired.")
    this.name = "InvalidResetTokenError"
  }
}
