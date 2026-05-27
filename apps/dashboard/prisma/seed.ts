import { BoardKind, Gender, PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const SEED_USERS = [
  {
    username: "ananya",
    email: "ananya@gmail.com",
    password: "Ananya@123",
    firstName: "Ananya",
    lastName: "Sharma",
    gender: Gender.FEMALE,
  },
  {
    username: "sami",
    email: "samiwasta.11@gmail.com",
    password: "Sami@1102",
    firstName: "Sami",
    lastName: "Wasta",
    gender: Gender.MALE,
  },
] as const

const boards: Array<{
  name: string
  slug: string
  kind: BoardKind
  code?: string
}> = [
  { name: "CBSE", slug: "cbse", kind: BoardKind.BOARD, code: "CBSE" },
  { name: "State Board", slug: "state-board", kind: BoardKind.BOARD },
  { name: "ICSE", slug: "icse", kind: BoardKind.BOARD, code: "ICSE" },
  {
    name: "University of Mumbai",
    slug: "university-of-mumbai",
    kind: BoardKind.UNIVERSITY,
    code: "MU",
  },
]

async function main() {
  for (const board of boards) {
    await prisma.board.upsert({
      where: { slug: board.slug },
      update: {
        name: board.name,
        kind: board.kind,
        code: board.code ?? null,
      },
      create: {
        name: board.name,
        slug: board.slug,
        kind: board.kind,
        code: board.code ?? null,
      },
    })
  }

  const cbse = await prisma.board.findUniqueOrThrow({
    where: { slug: "cbse" },
  })

  const school = await prisma.school.upsert({
    where: { code: "orvantaa-demo-school" },
    update: { name: "Orvantaa Demo School", boardId: cbse.id },
    create: {
      name: "Orvantaa Demo School",
      code: "orvantaa-demo-school",
      boardId: cbse.id,
    },
  })

  let class10 = await prisma.class.findFirst({
    where: { schoolId: school.id, name: "10" },
  })

  if (!class10) {
    class10 = await prisma.class.create({
      data: {
        schoolId: school.id,
        name: "10",
        section: "A",
      },
    })
  }

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10)

    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: UserRole.STUDENT,
        classId: class10.id,
      },
      create: {
        username: user.username,
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: UserRole.STUDENT,
        classId: class10.id,
      },
    })
  }
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
