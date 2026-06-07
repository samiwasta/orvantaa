import type { ReportCard } from "../model/performance-data"

const fetchOptions: RequestInit = {
  credentials: "same-origin",
}

export async function saveReportCard(
  reportCard: ReportCard
): Promise<ReportCard> {
  const response = await fetch("/api/report-card", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: reportCard.title,
      exams: reportCard.exams,
      subjects: reportCard.subjects.map((subject) => ({
        subjectId: subject.subjectId,
        scores: subject.scores,
      })),
    }),
    ...fetchOptions,
  })

  const payload = (await response.json().catch(() => null)) as {
    reportCard?: ReportCard
    error?: string
  } | null

  if (!response.ok || !payload?.reportCard) {
    throw new Error(payload?.error ?? "Could not save report card.")
  }

  return payload.reportCard
}
