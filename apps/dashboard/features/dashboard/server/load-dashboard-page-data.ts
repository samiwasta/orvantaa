import { cache } from "react"

import { loadDashboardQuickLinks } from "@/features/dashboard/server/load-dashboard-quick-links"
import { loadDashboardUserProfile } from "@/features/user/server/load-dashboard-user-profile"
import { requireStudentSession } from "@/lib/auth/session"

import { dashboardRepository } from "../repository/dashboard.repository"

export const loadDashboardPageData = cache(async () => {
  const session = await requireStudentSession()

  const [profile, quickLinks, hasLearningActivity] = await Promise.all([
    loadDashboardUserProfile(),
    loadDashboardQuickLinks(),
    dashboardRepository.hasLearningActivity(session.sub),
  ])

  return {
    firstName: profile.firstName,
    userGender: profile.gender,
    quickLinks,
    hasLearningActivity,
  }
})
