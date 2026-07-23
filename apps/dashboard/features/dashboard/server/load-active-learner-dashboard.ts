import { cache } from "react"

import { loadStudentClassId } from "@/features/curriculum/server/load-student-class-id"
import { loadDashboardQuickLinks } from "@/features/dashboard/server/load-dashboard-quick-links"
import { requireStudentSession } from "@/lib/auth/session"

import type { ActiveLearnerDashboardData } from "../model/active-learner-dashboard-data"
import { activeLearnerDashboardRepository } from "../repository/active-learner-dashboard.repository"

export const loadActiveLearnerDashboard = cache(
  async (): Promise<ActiveLearnerDashboardData> => {
    const session = await requireStudentSession()
    const classId = await loadStudentClassId()
    const quickLinks = await loadDashboardQuickLinks()

    const data = classId
      ? await activeLearnerDashboardRepository.getDashboardData(
          session.sub,
          classId
        )
      : null

    if (data) return data

    return {
      currentLesson: {
        subjectTitle: "Subjects",
        chapterLabel: "Start your first chapter",
        completedItems: 0,
        totalItems: 0,
        progressPercent: 0,
        isCompleted: false,
        continueHref: quickLinks.firstReadingHref,
      },
      performance: {
        gradePaceLabel: "Start Strong",
        stats: [
          { label: "Accuracy", value: "0%", tone: "purple" },
          { label: "Tests Taken", value: "0", tone: "orange" },
          { label: "Study Streak", value: "0 days", tone: "amber" },
          { label: "Time Spent", value: "0m", tone: "teal" },
        ],
      },
      actionCards: [
        {
          badge: "Based on your progress",
          title: "Take your first quiz",
          buttonLabel: "Start",
          href: quickLinks.firstQuizHref,
          imageSrc: "/quiz.svg",
          imageAlt: "Quiz illustration",
          variant: "purple",
        },
        {
          badge: "Today's Goal",
          title: "Complete 2 chapters",
          buttonLabel: "Continue",
          href: "/dashboard/goals",
          secondaryButtonLabel: "View All Goals",
          secondaryHref: "/dashboard/goals",
          imageSrc: "/open-book.svg",
          imageAlt: "Book illustration",
          variant: "white",
        },
        {
          badge: "Weak area in recent tests",
          title: "Revise your chapters",
          buttonLabel: "Practice",
          href: quickLinks.subjectsHref,
          imageSrc: "/graph.svg",
          imageAlt: "Calculator illustration",
          variant: "blue",
        },
      ],
      performanceInsights: {
        strength: {
          label: "STRENGTH",
          subject: "—",
        },
        growthArea: {
          label: "GROWTH AREA",
          subject: "—",
        },
        tip: "Complete quizzes and lessons to unlock personalized performance insights.",
      },
    }
  }
)
