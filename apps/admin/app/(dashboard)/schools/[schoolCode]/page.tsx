import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { schoolDetailPageMetadata } from "@/features/dashboard/model/page-metadata"
import { loadSchoolDetail } from "@/features/schools/server/load-school-detail"
import { SchoolDetailView } from "@/features/schools/view/school-detail-view"

type PageProps = {
  params: Promise<{ schoolCode: string }>
  searchParams: Promise<{ tab?: string; class?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { schoolCode } = await params
  const data = await loadSchoolDetail(schoolCode, "all")

  return data
    ? schoolDetailPageMetadata(data.school.name, schoolCode)
    : schoolDetailPageMetadata("School", schoolCode)
}

export default async function SchoolDetailPage({ params, searchParams }: PageProps) {
  const { schoolCode } = await params
  const { tab, class: classFilter } = await searchParams

  const activeTab =
    tab === "classes" ||
    tab === "syllabus" ||
    tab === "subscription" ||
    tab === "management" ||
    tab === "students"
      ? tab
      : "students"
  const activeClassId = classFilter ?? "all"

  const data = await loadSchoolDetail(schoolCode, activeClassId)
  if (!data) notFound()

  return (
    <Suspense>
      <SchoolDetailView
        school={data.school}
        students={data.students}
        classTabs={data.classTabs}
        sectionOptions={data.sectionOptions}
        syllabusRows={data.syllabusRows}
        boardClassOptions={data.boardClassOptions}
        subscriptionPayments={data.subscriptionPayments}
        subscriptionPaymentsConfig={data.subscriptionPaymentsConfig}
        recurringSubscription={data.recurringSubscription}
        recurringConfig={data.recurringConfig}
        managementContacts={data.managementContacts}
        billingEmail={data.billingEmail}
        schoolClasses={data.schoolClasses}
        initialTab={activeTab}
        initialClassId={activeClassId}
      />
    </Suspense>
  )
}
