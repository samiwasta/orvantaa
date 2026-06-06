import { PrismaClient } from "@prisma/client"

import { getPrismaDatabaseUrl } from "./connection-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaRevision: string | undefined
}

const PRISMA_CLIENT_REVISION = "20260606190000_platform_classes_inactive_school_default"

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getPrismaDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const REQUIRED_PRISMA_DELEGATES = [
  "schoolContact",
  "schoolRecurringSubscription",
  "platformSettings",
  "adminNotification",
  "platformClass",
] as const

function prismaClientIsCurrent(client: PrismaClient): boolean {
  if (globalForPrisma.prismaRevision !== PRISMA_CLIENT_REVISION) {
    return false
  }
  return REQUIRED_PRISMA_DELEGATES.every((key) => key in client)
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma
  if (cached && prismaClientIsCurrent(cached)) {
    return cached
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined)
  }

  const client = createPrismaClient()
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
    globalForPrisma.prismaRevision = PRISMA_CLIENT_REVISION
  }
  return client
}

export const prisma = getPrismaClient()
