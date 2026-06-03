import { PrismaClient } from "@prisma/client"

import { getPrismaDatabaseUrl } from "../lib/db/connection-url"

function databaseHost(connectionUrl: string): string {
  try {
    return new URL(connectionUrl).hostname
  } catch {
    return "(invalid DATABASE_URL)"
  }
}

async function main() {
  const url = getPrismaDatabaseUrl()
  const host = databaseHost(url)

  console.log(`Checking Neon connection (${host})...`)

  const prisma = new PrismaClient({
    datasources: { db: { url } },
  })

  try {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`
    console.log("Database connection OK.", result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Database connection failed.")
    console.error(message)
    console.error("")
    console.error("This is usually not an app bug. Check:")
    console.error("  1. Neon project is active (not deleted or archived) in https://console.neon.tech")
    console.error("  2. DATABASE_URL uses the pooled host (-pooler in the hostname)")
    console.error("  3. Copy a fresh connection string from Neon and update apps/admin/.env")
    console.error("  4. Restart the dev server after changing .env")
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()
