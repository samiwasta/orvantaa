import { proctorReportService } from "../service/proctor-report.service"

export async function loadQuizSessionReport(rawToken: string) {
  return proctorReportService.getReportByRawToken(rawToken)
}
