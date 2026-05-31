import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { prisma } from "@/lib/db"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"

type PageProps = {
  params: Promise<{
    schoolId: string
    classId: string
    subjectId: string
    chapterId: string
    topicId: string
  }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentTopicPage({ params }: PageProps) {
  const { schoolId, classId, subjectId, chapterId, topicId } = await params

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: {
      id: true,
      title: true,
      chapter: {
        select: {
          id: true,
          title: true,
          subject: {
            select: {
              id: true,
              title: true,
              class: {
                select: {
                  id: true,
                  name: true,
                  school: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (
    !topic ||
    topic.chapter.id !== chapterId ||
    topic.chapter.subject.id !== subjectId ||
    topic.chapter.subject.class.id !== classId ||
    topic.chapter.subject.class.school.id !== schoolId
  ) {
    notFound()
  }

  const schoolName = topic.chapter.subject.class.school.name
  const classDisplay = topic.chapter.subject.class.name.match(/^class\s/i)
    ? topic.chapter.subject.class.name
    : `Class ${topic.chapter.subject.class.name}`

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Schools", href: contentHref.root() },
          { label: schoolName, href: contentHref.school(schoolId) },
          {
            label: classDisplay,
            href: contentHref.class(schoolId, classId),
          },
          {
            label: topic.chapter.subject.title,
            href: contentHref.subject(schoolId, classId, subjectId),
          },
          {
            label: topic.chapter.title,
            href: contentHref.chapter(
              schoolId,
              classId,
              subjectId,
              chapterId
            ),
          },
          {
            label: topic.title,
            href: contentHref.topic(
              schoolId,
              classId,
              subjectId,
              chapterId,
              topicId
            ),
          },
        ]}
      />
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">{topic.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Notes and quizzes for this topic are next in the content workflow.
        </p>
      </div>
    </div>
  )
}
