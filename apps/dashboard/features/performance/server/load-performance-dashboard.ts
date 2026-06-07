import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { performanceRepository } from "@/features/performance/repository/performance.repository"
import { requireStudentSession } from "@/lib/auth/session"

export async function loadPerformanceDashboardForCurrentStudent() {
  const session = await requireStudentSession()
  const classId = await loadStudentClassId()

  if (!classId) {
    return performanceRepository.getDashboardForUser(session.sub, "")
  }

  return performanceRepository.getDashboardForUser(session.sub, classId)
}
