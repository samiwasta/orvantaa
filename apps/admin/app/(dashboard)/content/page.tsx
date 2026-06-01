import type { Metadata } from "next"

import { loadContentBoards } from "@/features/content/server/load-content-boards"
import { ContentBoardsView } from "@/features/content/view/content-boards-view"

export const metadata: Metadata = {
  title: "Content - Orvantaa Admin",
  description: "Manage subjects, chapters, notes, and quizzes",
}

export default async function ContentPage() {
  const { boards } = await loadContentBoards()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBoardsView boards={boards} />
    </div>
  )
}
