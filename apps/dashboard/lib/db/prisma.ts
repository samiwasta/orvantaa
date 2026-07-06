import { PrismaClient } from "@prisma/client"

import { getPrismaDatabaseUrl } from "./connection-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaRevision: string | undefined
}

const PRISMA_CLIENT_REVISION = "20260707140000_student_goals"

const REQUIRED_PRISMA_DELEGATES = [
  "aiTutorChatSession",
  "quizAttempt",
  "studentReportCard",
  "studentNotification",
  "adminNotification",
  "supportTicket",
  "studentExamTarget",
  "studentGoal",
] as const

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getPrismaDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

function clientHasRequiredDelegates(client: PrismaClient): boolean {
  return REQUIRED_PRISMA_DELEGATES.every((key) => {
    const delegate = client[key as keyof PrismaClient]
    return (
      delegate != null &&
      typeof delegate === "object" &&
      "findMany" in delegate &&
      typeof (delegate as { findMany?: unknown }).findMany === "function"
    )
  })
}

function cachedClientIsCurrent(client: PrismaClient): boolean {
  if (globalForPrisma.prismaRevision !== PRISMA_CLIENT_REVISION) {
    return false
  }
  return clientHasRequiredDelegates(client)
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma
  if (cached && cachedClientIsCurrent(cached)) {
    return cached
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined)
  }

  const client = createPrismaClient()
  if (!clientHasRequiredDelegates(client)) {
    throw new Error(
      "Prisma client is out of date (missing required models). Run `pnpm db:generate` in apps/dashboard, then restart the dev server."
    )
  }

  globalForPrisma.prisma = client
  globalForPrisma.prismaRevision = PRISMA_CLIENT_REVISION
  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})
