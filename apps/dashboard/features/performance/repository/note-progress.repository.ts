import { prisma } from "@/lib/db"
import type { NoteProgressStatus } from "@/lib/generated/prisma"

export class NoteProgressRepository {
  async upsertProgress(
    userId: string,
    noteId: string,
    status: NoteProgressStatus
  ) {
    const now = new Date()

    return prisma.noteProgress.upsert({
      where: {
        userId_noteId: { userId, noteId },
      },
      create: {
        userId,
        noteId,
        status,
        completedAt: status === "COMPLETED" ? now : null,
      },
      update: {
        lastViewedAt: now,
        ...(status === "COMPLETED"
          ? { status: "COMPLETED", completedAt: now }
          : {}),
      },
    })
  }

  async verifyNoteAccess(userId: string, noteId: string, classId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, section: { classId } },
      select: { id: true },
    })
    if (!user) return null

    return prisma.note.findFirst({
      where: {
        id: noteId,
        topic: {
          notes: { some: {} },
          chapter: {
            OR: [
              { topics: { some: { notes: { some: {} } } } },
              { quizzes: { some: { questions: { some: {} } } } },
            ],
            subject: { classId },
          },
        },
      },
      select: { id: true },
    })
  }
}

export const noteProgressRepository = new NoteProgressRepository()
