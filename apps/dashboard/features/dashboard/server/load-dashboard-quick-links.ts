import { cache } from "react"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { curriculumService } from "@/features/curriculum/service/curriculum.service"

import {
  type DashboardQuickLinks,
  defaultDashboardQuickLinks,
} from "../model/dashboard-quick-links"

export const loadDashboardQuickLinks = cache(
  async (): Promise<DashboardQuickLinks> => {
    const classId = await loadStudentClassId()
    if (!classId) return defaultDashboardQuickLinks

    return curriculumService.getDashboardQuickLinks(classId)
  }
)
