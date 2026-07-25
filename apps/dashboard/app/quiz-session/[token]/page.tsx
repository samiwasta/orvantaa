import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BrandLogo } from "@/features/brand/view/brand-logo"
import { loadQuizSessionReport } from "@/features/proctoring/server/load-quiz-session-report"
import { QuizSessionReportView } from "@/features/proctoring/view/quiz-session-report-view"

type QuizSessionPageProps = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({
  params,
}: QuizSessionPageProps): Promise<Metadata> {
  const { token } = await params
  const report = await loadQuizSessionReport(token)

  if (!report) {
    return { title: "Session not found" }
  }

  return {
    title: `${report.quiz.title} · Session report`,
    description: "Proctored quiz session proof and activity log",
  }
}

export default async function QuizSessionPage({
  params,
}: QuizSessionPageProps) {
  const { token } = await params
  const report = await loadQuizSessionReport(token)
  if (!report) notFound()

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,#EEF0FF,transparent_42%),linear-gradient(#F7F8FC,#F3F5FA)]">
      <header className="border-b border-[#E8EEFF]/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <Link
            href="/help"
            className="text-sm font-semibold text-[#4169E1] hover:text-[#5B4BD6]"
          >
            Help and Support
          </Link>
        </div>
      </header>
      <QuizSessionReportView report={report} />
    </div>
  )
}
