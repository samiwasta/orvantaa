import { prisma } from "@/lib/db"

export class DashboardRepository {
  async hasLearningActivity(userId: string): Promise<boolean> {
    const [noteProgress, quizAttempt] = await Promise.all([
      prisma.noteProgress.findFirst({
        where: { userId },
        select: { id: true },
      }),
      prisma.quizAttempt.findFirst({
        where: { userId },
        select: { id: true },
      }),
    ])

    return Boolean(noteProgress || quizAttempt)
  }
}

export const dashboardRepository = new DashboardRepository()
