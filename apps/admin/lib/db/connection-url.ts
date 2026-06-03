export function getPrismaDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    throw new Error("DATABASE_URL is not set")
  }
  return withPrismaConnectionParams(raw)
}

function withPrismaConnectionParams(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl)
    const defaults: Record<string, string> = {
      connect_timeout: process.env.PRISMA_CONNECT_TIMEOUT ?? "30",
      pool_timeout: process.env.PRISMA_POOL_TIMEOUT ?? "30",
      connection_limit: process.env.PRISMA_CONNECTION_LIMIT ?? "5",
    }

    for (const [key, value] of Object.entries(defaults)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value)
      }
    }

    return url.toString()
  } catch {
    return databaseUrl
  }
}
