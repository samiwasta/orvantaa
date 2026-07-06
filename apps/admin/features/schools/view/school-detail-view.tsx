"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import type { ClassListItem } from "@/features/classes/model/class-list-item"
import {
  pageSectionBodyClass,
  pageSectionClass,
} from "@/features/shared/view/page-layout"
import { ScrollableTabs } from "@/features/shared/view/scrollable-tabs"
import { schoolDetailHref, type SchoolListItem } from "../model/school-list-item"
import type { BoardClassOption } from "../model/board-class-option"
import type {
  RecurringSubscriptionConfig,
  RecurringSubscriptionListItem,
} from "../model/recurring-subscription"
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
import { SchoolClassesAddButton, SchoolClassesTab } from "./school-classes-tab"
import { SchoolManagementTab } from "./school-management-tab"
import { SchoolStudentsTable } from "./school-students-table"
import { SchoolSubscriptionTab } from "./school-subscription-tab"
import { SchoolSyllabusTab } from "./school-syllabus-tab"
import { ChevronRight } from "lucide-react"

type SchoolDetailViewProps = {
  school: SchoolListItem
  students: SchoolStudentListItem[]
  classTabs: SchoolClassTab[]
  sectionOptions: SchoolSectionOption[]
  syllabusRows: SchoolSyllabusClassRow[]
  boardClassOptions: BoardClassOption[]
  subscriptionPayments: SubscriptionPaymentListItem[]
  subscriptionPaymentsConfig: SubscriptionPaymentsConfig
  recurringSubscription: RecurringSubscriptionListItem | null
  recurringConfig: RecurringSubscriptionConfig
  managementContacts: SchoolContactListItem[]
  billingEmail: string | null
  schoolClasses: ClassListItem[]
  initialTab: string
  initialClassId: string
}

const MAIN_TABS = [
  { id: "students", label: "Students" },
  { id: "classes", label: "Classes" },
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
  recurringSubscription,
  recurringConfig,
  managementContacts,
  billingEmail,
  schoolClasses,
  initialTab,
  initialClassId,
}: SchoolDetailViewProps) {
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab")
  const tab: MainTabId =
    tabParam === "classes" ||
    tabParam === "syllabus" ||
    tabParam === "subscription" ||
    tabParam === "management" ||
    tabParam === "students"
      ? tabParam
      : initialTab === "classes" ||
          initialTab === "syllabus" ||
          initialTab === "subscription" ||
          initialTab === "management"
        ? (initialTab as MainTabId)
        : "students"

  const activeClassId = searchParams.get("class") ?? initialClassId
  const baseHref = schoolDetailHref(school.schoolCode)

  const tabItems = MAIN_TABS.map(({ id, label }) => ({
    id,
    label,
    href: tabHref(baseHref, id, activeClassId),
  }))

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

      <div className={pageSectionClass}>
        <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
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

        <div className="border-y border-border/60 bg-muted/20">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:justify-between">
            <ScrollableTabs
              items={tabItems}
              activeId={tab}
              ariaLabel="School sections"
              className="min-w-0 flex-1"
            />
            {tab === "classes" ? (
              <div className="flex shrink-0 items-center border-t border-border/60 px-3 py-2 lg:border-t-0 lg:px-4 lg:py-0">
                <SchoolClassesAddButton
                  schoolId={school.id}
                  schoolCode={school.schoolCode}
                  schoolName={school.name}
                  boardId={school.boardId}
                  boardName={school.boardName}
                  boardClassOptions={boardClassOptions}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className={pageSectionBodyClass}>
          {tab === "students" ? (
            <SchoolStudentsTable
              school={school}
              students={students}
              classTabs={classTabs}
              sectionOptions={sectionOptions}
              activeClassId={activeClassId}
            />
          ) : null}
          {tab === "classes" ? (
            <SchoolClassesTab
              schoolId={school.id}
              schoolCode={school.schoolCode}
              schoolName={school.name}
              classes={schoolClasses}
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
              recurringSubscription={recurringSubscription}
              recurringConfig={recurringConfig}
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
