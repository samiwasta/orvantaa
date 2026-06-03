"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Mail, Pencil, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/features/shared/view/confirm-dialog"
import { useActionRunner } from "@/lib/actions/use-action-runner"

import { schoolDetailHref, type SchoolListItem } from "../model/school-list-item"
import type {
  SchoolClassTab,
  SchoolSectionOption,
  SchoolStudentListItem,
} from "../model/school-student-list-item"
import {
  deleteSchoolStudentAction,
  sendSchoolStudentCredentialsAction,
} from "../server/student-actions"
import { SchoolAddStudentMenu } from "./school-add-student-menu"
import { MailStatusBadge } from "./school-status-badges"
import { SchoolStudentCsvImportDialog } from "./school-student-csv-import-dialog"
import { SchoolStudentFormDialog } from "./school-student-form-dialog"

type SchoolStudentsTableProps = {
  school: SchoolListItem
  students: SchoolStudentListItem[]
  classTabs: SchoolClassTab[]
  sectionOptions: SchoolSectionOption[]
  activeClassId: string
}

function filterStudents(
  students: SchoolStudentListItem[],
  query: string
): SchoolStudentListItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return students

  return students.filter((s) =>
    [
      s.studentCode,
      s.fullName,
      s.email,
      s.phone ?? "",
      s.classDisplayName ?? "",
      s.sectionName ?? "",
      s.mailStatusLabel,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q)
  )
}

const classPillClass = (active: boolean) =>
  cn(
    "inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors",
    active
      ? "bg-[#6C5CE7] text-white shadow-sm"
      : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
  )

export function SchoolStudentsTable({
  school,
  students,
  classTabs,
  sectionOptions,
  activeClassId,
}: SchoolStudentsTableProps) {
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolStudentListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SchoolStudentListItem | null>(null)
  const [sendCredentialsOpen, setSendCredentialsOpen] = useState(false)

  const pendingCredentialsCount = useMemo(
    () => students.filter((s) => s.mailStatus === "not_sent").length,
    [students]
  )

  const filtered = useMemo(
    () => filterStudents(students, search),
    [students, search]
  )

  const { run: runDelete, pending: deletePending } = useActionRunner(
    (id: string) => deleteSchoolStudentAction(school.id, school.schoolCode, id),
    {
      successMessage: "Student deleted",
      onSuccess: () => setDeleteTarget(null),
    }
  )

  const { run: runSendCredentials, pending: sendCredentialsPending } =
    useActionRunner(
      () =>
        sendSchoolStudentCredentialsAction(
          school.id,
          school.schoolCode,
          activeClassId
        ),
      {
        onSuccess: () => setSendCredentialsOpen(false),
      }
    )

  const baseHref = schoolDetailHref(school.schoolCode)

  function classTabHref(classId: string) {
    const params = new URLSearchParams({ tab: "students", class: classId })
    return `${baseHref}?${params.toString()}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Class
          </span>
          <Link href={classTabHref("all")} className={classPillClass(activeClassId === "all")}>
            All
          </Link>
          {classTabs.map((tab) => (
            <Link
              key={tab.id}
              href={classTabHref(tab.id)}
              className={classPillClass(activeClassId === tab.id)}
            >
              {tab.classDisplayName}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border-border/60 bg-white pl-9"
              aria-label="Search students"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-lg border-border/60 bg-white"
            disabled={pendingCredentialsCount === 0 || sendCredentialsPending}
            onClick={() => setSendCredentialsOpen(true)}
          >
            <Mail className="size-4" aria-hidden />
            Send credentials
            {pendingCredentialsCount > 0 ? (
              <span className="ml-1.5 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {pendingCredentialsCount}
              </span>
            ) : null}
          </Button>
          <SchoolAddStudentMenu
            disabled={sectionOptions.length === 0}
            onAddManually={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            onAddViaCsv={() => setCsvOpen(true)}
          />
        </div>
      </div>

      {sectionOptions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
          Add classes and sections to this school before enrolling students.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Student code
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Student name
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Class
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Section
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Phone
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Password
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Mail status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-sm text-muted-foreground">
                    {search.trim()
                      ? "No students match your search."
                      : "No students in this view yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-[#6C5CE7]/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[#6C5CE7]">
                        {student.studentCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {student.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {student.classDisplayName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {student.sectionName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {student.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs tracking-widest text-muted-foreground">
                        ••••••••
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <MailStatusBadge
                        label={student.mailStatusLabel}
                        status={student.mailStatus}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:bg-muted"
                          aria-label={`Update ${student.fullName}`}
                          onClick={() => {
                            setEditing(student)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${student.fullName}`}
                          onClick={() => setDeleteTarget(student)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SchoolStudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schoolId={school.id}
        schoolCode={school.schoolCode}
        sectionOptions={sectionOptions}
        student={editing}
      />

      <SchoolStudentCsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        schoolId={school.id}
        schoolCode={school.schoolCode}
      />

      <ConfirmDialog
        open={sendCredentialsOpen}
        onOpenChange={setSendCredentialsOpen}
        title="Send credentials"
        description={
          pendingCredentialsCount > 0
            ? `Email login credentials to ${pendingCredentialsCount} student${
                pendingCredentialsCount === 1 ? "" : "s"
              } with mail status Not Sent${
                activeClassId !== "all" ? " in this class" : ""
              }? Each student receives a new password.`
            : undefined
        }
        confirmLabel="Send emails"
        pending={sendCredentialsPending}
        onConfirm={() => runSendCredentials()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete student"
        description={
          deleteTarget
            ? `This permanently deletes ${deleteTarget.fullName}. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        pending={deletePending}
        onConfirm={() => {
          if (deleteTarget) runDelete(deleteTarget.id)
        }}
      />
    </div>
  )
}
