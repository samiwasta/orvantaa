export type DashboardCounts = {
  totalStudents: number
  totalAdmins: number
  totalSchools: number
  totalClasses: number
  totalSubjects: number
  totalChapters: number
  totalBoards: number
  unassignedStudents: number
  signupsThisWeek: number
  signupsPriorWeek: number
}

export type SignupDataPoint = {
  date: string
  students: number
}

export type GenderBreakdown = {
  male: number
  female: number
}

export type RecentUser = {
  id: string
  fullName: string
  email: string
  role: "ADMIN" | "STUDENT"
  createdAt: string
  classLabel: string | null
}

export type AdminDashboardStats = {
  counts: DashboardCounts
  signupsLast14Days: SignupDataPoint[]
  genderBreakdown: GenderBreakdown
  recentUsers: RecentUser[]
}
