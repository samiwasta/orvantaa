export function getSuperAdminUsername(): string {
  return process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase() ?? ""
}

export function isSuperAdminUsername(username: string): boolean {
  const superAdminUsername = getSuperAdminUsername()
  if (!superAdminUsername) return false
  return username.trim().toLowerCase() === superAdminUsername
}
