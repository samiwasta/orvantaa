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

function isStalePrismaClient(client: PrismaClient): boolean {
  return (
    !("aiTutorChatSession" in client) ||
    !("quizAttempt" in client) ||
    !("studentReportCard" in client)
  )
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma

  if (existing && !isStalePrismaClient(existing)) {
    return existing
  }

  if (existing) {
    void existing.$disconnect()
  }

  const client = createPrismaClient()

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
  }

  return client
}

export const prisma = getPrismaClient()
