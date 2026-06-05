"use client"

import { cn } from "@workspace/ui/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { schoolDetailHref, type SchoolListItem } from "../model/school-list-item"
import type { BoardClassOption } from "../model/board-class-option"
import type {
  SubscriptionPaymentListItem,
  SubscriptionPaymentsConfig,
} from "../model/subscription-payment"
import type {
  SchoolClassTab,
  SchoolSectionOption,
  SchoolStudentListItem,
  SchoolSyllabusClassRow,
} from "../model/school-student-list-item"
import { SubscriptionStatusBadge, SyllabusStatusBadge } from "./school-status-badges"
import type { SchoolContactListItem } from "../model/school-contact"
import { SchoolManagementTab } from "./school-management-tab"
import { SchoolStudentsTable } from "./school-students-table"
import { SchoolSubscriptionTab } from "./school-subscription-tab"
import { SchoolSyllabusAddClassButton, SchoolSyllabusTab } from "./school-syllabus-tab"

type SchoolDetailViewProps = {
  school: SchoolListItem
  students: SchoolStudentListItem[]
  classTabs: SchoolClassTab[]
  sectionOptions: SchoolSectionOption[]
  syllabusRows: SchoolSyllabusClassRow[]
  boardClassOptions: BoardClassOption[]
  subscriptionPayments: SubscriptionPaymentListItem[]
  subscriptionPaymentsConfig: SubscriptionPaymentsConfig
  managementContacts: SchoolContactListItem[]
  billingEmail: string | null
  initialTab: string
  initialClassId: string
}

const MAIN_TABS = [
  { id: "students", label: "Students" },
  { id: "syllabus", label: "Syllabus" },
  { id: "subscription", label: "Subscription" },
  { id: "management", label: "Management" },
] as const

type MainTabId = (typeof MAIN_TABS)[number]["id"]

function tabHref(baseHref: string, tab: MainTabId, classId: string) {
  const params = new URLSearchParams({ tab })
  if (tab === "students") {
    params.set("class", classId || "all")
  }
  return `${baseHref}?${params.toString()}`
}

export function SchoolDetailView({
  school,
  students,
  classTabs,
  sectionOptions,
  syllabusRows,
  boardClassOptions,
  subscriptionPayments,
  subscriptionPaymentsConfig,
  managementContacts,
  billingEmail,
  initialTab,
  initialClassId,
}: SchoolDetailViewProps) {
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab")
  const tab: MainTabId =
    tabParam === "syllabus" ||
    tabParam === "subscription" ||
    tabParam === "management" ||
    tabParam === "students"
      ? tabParam
      : initialTab === "syllabus" ||
          initialTab === "subscription" ||
          initialTab === "management"
        ? (initialTab as MainTabId)
        : "students"

  const activeClassId = searchParams.get("class") ?? initialClassId
  const baseHref = schoolDetailHref(school.schoolCode)

  return (
    <div className="flex flex-1 flex-col gap-4">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/schools" className="transition-colors hover:text-[#6C5CE7]">
          Schools
        </Link>
        <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
        <span className="font-medium text-foreground">{school.name}</span>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                {school.name}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                <span className="font-mono text-xs font-semibold text-[#6C5CE7]">
                  {school.schoolCode}
                </span>
                <span className="mx-2 text-border">·</span>
                {school.boardName}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <SyllabusStatusBadge school={school} />
              <SubscriptionStatusBadge school={school} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-y border-border/60 bg-muted/20">
          <nav className="flex min-w-0" aria-label="School sections">
            {MAIN_TABS.map(({ id, label }) => {
              const active = tab === id
              return (
                <Link
                  key={id}
                  href={tabHref(baseHref, id, activeClassId)}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-5",
                    active
                      ? "border-[#6C5CE7] bg-white text-[#6C5CE7]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
          {tab === "syllabus" ? (
            <SchoolSyllabusAddClassButton
              schoolId={school.id}
              schoolCode={school.schoolCode}
              schoolName={school.name}
              boardId={school.boardId}
              boardName={school.boardName}
              boardClassOptions={boardClassOptions}
            />
          ) : null}
        </div>

        <div className="p-5 sm:p-6">
          {tab === "students" ? (
            <SchoolStudentsTable
              school={school}
              students={students}
              classTabs={classTabs}
              sectionOptions={sectionOptions}
              activeClassId={activeClassId}
            />
          ) : null}
          {tab === "syllabus" ? (
            <SchoolSyllabusTab
              boardId={school.boardId}
              schoolCode={school.schoolCode}
              rows={syllabusRows}
            />
          ) : null}
          {tab === "subscription" ? (
            <SchoolSubscriptionTab
              school={school}
              payments={subscriptionPayments}
              paymentsConfig={subscriptionPaymentsConfig}
            />
          ) : null}
          {tab === "management" ? (
            <SchoolManagementTab
              schoolId={school.id}
              schoolCode={school.schoolCode}
              contacts={managementContacts}
              billingEmail={billingEmail}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
