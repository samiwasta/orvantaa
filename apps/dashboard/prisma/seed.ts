import bcrypt from "bcryptjs"

import {
  BoardKind,
  Gender,
  PrismaClient,
  QuizDifficulty,
  UserRole,
} from "@/lib/generated/prisma"

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

async function seedCurriculum(classId: string) {
  await prisma.subject.deleteMany({ where: { classId } })

  const mathematics = await prisma.subject.create({
    data: {
      classId,
      title: "Mathematics",
      slug: "mathematics",
      orderIndex: 0,
    },
  })

  const linearEquations = await prisma.chapter.create({
    data: {
      subjectId: mathematics.id,
      title: "Linear Equations",
      slug: "linear-equations",
      number: 1,
    },
  })

  const introTopic = await prisma.topic.create({
    data: {
      chapterId: linearEquations.id,
      title: "Introduction to Linear Equations",
      slug: "introduction",
      orderIndex: 0,
    },
  })

  await prisma.note.create({
    data: {
      topicId: introTopic.id,
      title: "What is a Linear Equation?",
      orderIndex: 0,
      blocks: [
        {
          type: "heading",
          text: "Understanding Linear Equations",
        },
        {
          type: "paragraph",
          text: "A linear equation is an equation in which the highest power of the variable is always 1. It represents a straight line when plotted on a graph.",
        },
        {
          type: "definition",
          title: "Linear Equation",
          content:
            "An equation of the form ax + b = 0, where a and b are constants and a is not equal to 0.",
        },
        {
          type: "example",
          title: "Solving 2x + 4 = 10",
          steps: [
            "Subtract 4 from both sides: 2x = 6",
            "Divide both sides by 2: x = 3",
          ],
          tip: "Always perform the same operation on both sides to keep the equation balanced.",
        },
        {
          type: "list",
          items: [
            "One variable: ax + b = 0",
            "Two variables: ax + by + c = 0",
            "Graph is always a straight line",
          ],
        },
        {
          type: "callout",
          text: "Linear equations are the foundation for algebra and coordinate geometry.",
        },
      ],
    },
  })

  const basicsQuiz = await prisma.quiz.create({
    data: {
      chapterId: linearEquations.id,
      title: "Linear Equations Basics",
      difficulty: QuizDifficulty.EASY,
      orderIndex: 0,
    },
  })

  await prisma.question.create({
    data: {
      quizId: basicsQuiz.id,
      prompt: "What is the value of x in 2x + 4 = 10?",
      explanation: "2x = 6, so x = 3.",
      orderIndex: 0,
      options: {
        create: [
          { label: "2", isCorrect: false, orderIndex: 0 },
          { label: "3", isCorrect: true, orderIndex: 1 },
          { label: "4", isCorrect: false, orderIndex: 2 },
          { label: "5", isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  })

  await prisma.question.create({
    data: {
      quizId: basicsQuiz.id,
      prompt: "A linear equation in one variable has a highest power of?",
      explanation: "By definition the highest power of the variable is 1.",
      orderIndex: 1,
      options: {
        create: [
          { label: "0", isCorrect: false, orderIndex: 0 },
          { label: "1", isCorrect: true, orderIndex: 1 },
          { label: "2", isCorrect: false, orderIndex: 2 },
          { label: "3", isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  })

  const science = await prisma.subject.create({
    data: {
      classId,
      title: "Science",
      slug: "science",
      orderIndex: 1,
    },
  })

  const lightChapter = await prisma.chapter.create({
    data: {
      subjectId: science.id,
      title: "Light - Reflection and Refraction",
      slug: "light-reflection-refraction",
      number: 1,
    },
  })

  const reflectionTopic = await prisma.topic.create({
    data: {
      chapterId: lightChapter.id,
      title: "Reflection of Light",
      slug: "reflection-of-light",
      orderIndex: 0,
    },
  })

  await prisma.note.create({
    data: {
      topicId: reflectionTopic.id,
      title: "Laws of Reflection",
      orderIndex: 0,
      blocks: [
        {
          type: "paragraph",
          text: "Reflection is the bouncing back of light when it strikes a polished surface like a mirror.",
        },
        {
          type: "list",
          items: [
            "The angle of incidence equals the angle of reflection.",
            "The incident ray, reflected ray, and normal all lie in the same plane.",
          ],
        },
        {
          type: "quote",
          text: "Light always travels in a straight line until it meets a surface.",
        },
      ],
    },
  })

  await prisma.subject.create({
    data: {
      classId,
      title: "English",
      slug: "english",
      orderIndex: 2,
    },
  })
}

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

  const class10 = await prisma.class.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "10" } },
    update: {},
    create: { schoolId: school.id, name: "10" },
  })

  const sectionA = await prisma.section.upsert({
    where: { classId_name: { classId: class10.id, name: "A" } },
    update: {},
    create: { classId: class10.id, name: "A" },
  })

  await seedCurriculum(class10.id)

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
        sectionId: sectionA.id,
      },
      create: {
        username: user.username,
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: UserRole.STUDENT,
        sectionId: sectionA.id,
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
