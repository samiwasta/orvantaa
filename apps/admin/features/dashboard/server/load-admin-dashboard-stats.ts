import { cache } from "react"

import { prisma } from "@/lib/db"

import type { AdminDashboardStats, RecentUser } from "../model/admin-dashboard-stats"

export const loadAdminDashboardStats = cache(
  async (): Promise<AdminDashboardStats> => {
    const start = new Date()
    start.setDate(start.getDate() - 13)
    start.setHours(0, 0, 0, 0)

    const [
      totalStudents,
      totalAdmins,
      totalSchools,
      totalClasses,
      totalSubjects,
      totalChapters,
      totalBoards,
      unassignedStudents,
      recentSignupRows,
      maleCount,
      femaleCount,
      recentUserRows,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.school.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.chapter.count(),
      prisma.board.count(),
      prisma.user.count({ where: { role: "STUDENT", classId: null } }),
      prisma.user.findMany({
        where: { role: "STUDENT", createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      prisma.user.count({ where: { gender: "MALE" } }),
      prisma.user.count({ where: { gender: "FEMALE" } }),
      prisma.user.findMany({
        take: 6,
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          class: { select: { name: true, section: true } },
        },
      }),
    ])

    // Build 14-day signup buckets + weekly breakdown
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    let signupsThisWeek = 0
    let signupsPriorWeek = 0
    const signupsMap: Record<string, number> = {}
    for (let i = 0; i <= 13; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      signupsMap[key] = 0
    }
    for (const u of recentSignupRows) {
      const key = u.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      if (key in signupsMap) signupsMap[key] = (signupsMap[key] ?? 0) + 1
      if (u.createdAt >= sevenDaysAgo) {
        signupsThisWeek++
      } else {
        signupsPriorWeek++
      }
    }

    const recentUsers: RecentUser[] = recentUserRows.map((u) => ({
      id: u.id,
      fullName: [u.firstName, u.lastName].filter(Boolean).join(" "),
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      classLabel: u.class
        ? `Class ${u.class.name}${u.class.section ? ` - ${u.class.section}` : ""}`
        : null,
    }))

    return {
      counts: {
        totalStudents,
        totalAdmins,
        totalSchools,
        totalClasses,
        totalSubjects,
        totalChapters,
        totalBoards,
        unassignedStudents,
        signupsThisWeek,
        signupsPriorWeek,
      },
      signupsLast14Days: Object.entries(signupsMap).map(([date, students]) => ({
        date,
        students,
      })),
      genderBreakdown: { male: maleCount, female: femaleCount },
      recentUsers,
    }
  }
)
