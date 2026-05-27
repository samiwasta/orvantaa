import { Gender, PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in apps/admin/.env (see .env.example).`
    )
  }
  return value
}

function parseAdminGender(): Gender {
  const raw = process.env.SEED_ADMIN_GENDER?.trim().toUpperCase()
  if (raw === "MALE") return Gender.MALE
  if (raw === "FEMALE") return Gender.FEMALE
  return Gender.FEMALE
}

async function seedAdminFromEnv() {
  const username = requireEnv("SEED_ADMIN_USERNAME")
  const email = requireEnv("SEED_ADMIN_EMAIL")
  const password = requireEnv("SEED_ADMIN_PASSWORD")
  const firstName = process.env.SEED_ADMIN_FIRST_NAME?.trim() || "Admin"
  const lastName = process.env.SEED_ADMIN_LAST_NAME?.trim() || ""
  const gender = parseAdminGender()

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      passwordHash,
      firstName,
      lastName,
      gender,
      role: UserRole.ADMIN,
      classId: null,
    },
    create: {
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      gender,
      role: UserRole.ADMIN,
    },
  })

  console.log(`Seeded admin user: ${user.username} (${user.email})`)
}

async function main() {
  await seedAdminFromEnv()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
