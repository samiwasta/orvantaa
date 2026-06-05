import { PrismaClient } from "@prisma/client"

import { getPrismaDatabaseUrl } from "./connection-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getPrismaDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const REQUIRED_PRISMA_DELEGATES = ["schoolContact", "platformSettings"] as const

function prismaClientIsCurrent(client: PrismaClient): boolean {
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
  }
  return client
}

export const prisma = getPrismaClient()
