import { prisma } from "@/lib/db"

import type {
  CompleteOnboardingInput,
  OnboardingBoardOption,
  OnboardingSchoolSuggestion,
} from "../model/types"

export type {
  CompleteOnboardingInput,
  OnboardingBoardOption,
  OnboardingSchoolSuggestion,
} from "../model/types"

export class OnboardingRepository {
  async listBoards(): Promise<OnboardingBoardOption[]> {
    const rows = await prisma.board.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true },
    })
    return rows
  }

  async searchSchools(
    query: string,
    limit = 8
  ): Promise<OnboardingSchoolSuggestion[]> {
    const q = query.trim()
    if (q.length < 1) return []

    const rows = await prisma.school.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        boardId: true,
        board: { select: { name: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      state: row.state,
      boardId: row.boardId,
      boardName: row.board.name,
    }))
  }

  async findSchoolById(schoolId: string) {
    return prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        boardId: true,
      },
    })
  }

  async findBoardById(boardId: string) {
    return prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true, name: true },
    })
  }

  async completeOnboarding(input: CompleteOnboardingInput) {
    const board = await this.findBoardById(input.boardId)
    if (!board) {
      throw new Error("BOARD_NOT_FOUND")
    }

    let schoolId = input.schoolId?.trim() || null
    let schoolName = input.schoolName.trim()

    if (schoolId) {
      const existing = await this.findSchoolById(schoolId)
      if (!existing) {
        throw new Error("SCHOOL_NOT_FOUND")
      }
      schoolName = existing.name
      await prisma.school.update({
        where: { id: schoolId },
        data: {
          city: input.city,
          state: input.state,
          boardId: input.boardId,
        },
      })
    } else {
      const created = await prisma.school.create({
        data: {
          name: schoolName,
          boardId: input.boardId,
          city: input.city,
          state: input.state,
          subscriptionStatus: "INACTIVE",
        },
        select: { id: true },
      })
      schoolId = created.id
    }

    const user = await prisma.user.update({
      where: { id: input.userId },
      data: {
        onboardingCompleted: true,
        onboardingSchoolId: schoolId,
        onboardingBoardId: input.boardId,
        onboardingCity: input.city,
        onboardingState: input.state,
        onboardingStandard: input.standard,
        onboardingSection: input.section.trim(),
      },
      select: {
        id: true,
        username: true,
        role: true,
        mustChangePassword: true,
        onboardingCompleted: true,
      },
    })

    return { user, schoolId }
  }

  async getOnboardingStatus(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    })
  }
}

export const onboardingRepository = new OnboardingRepository()
