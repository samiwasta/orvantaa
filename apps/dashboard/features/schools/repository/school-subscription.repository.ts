import { prisma } from "@/lib/db"

import {
  mapPrismaSubscriptionStatus,
  type StudentSchoolAccess,
} from "../model/school-subscription"

export class SchoolSubscriptionRepository {
  async findStudentSchoolAccess(userId: string): Promise<StudentSchoolAccess> {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        section: {
          select: {
            class: {
              select: {
                school: {
                  select: {
                    name: true,
                    subscriptionStatus: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const school = row?.section?.class?.school
    if (!school) {
      return {
        allowed: true,
        status: "unassigned",
        schoolName: null,
      }
    }

    const status = mapPrismaSubscriptionStatus(school.subscriptionStatus)

    return {
      allowed: status === "active",
      status,
      schoolName: school.name,
    }
  }
}

export const schoolSubscriptionRepository = new SchoolSubscriptionRepository()
