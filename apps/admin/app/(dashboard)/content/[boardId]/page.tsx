import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { contentHref } from "@/features/content/model/content-nav"
import { loadContentBoardClasses } from "@/features/content/server/load-content-board-classes"
import { ContentBreadcrumbs } from "@/features/content/view/content-breadcrumbs"
import { ContentClassesView } from "@/features/content/view/content-classes-view"

type PageProps = {
  params: Promise<{ boardId: string }>
}

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
}

export default async function ContentBoardClassesPage({ params }: PageProps) {
  const { boardId } = await params
  const data = await loadContentBoardClasses(boardId)

  if (!data) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBreadcrumbs
        items={[
          { label: "Content", href: contentHref.root() },
          { label: data.board.name, href: contentHref.board(boardId) },
        ]}
      />
      <ContentClassesView board={data.board} classes={data.classes} />
    </div>
  )
}
