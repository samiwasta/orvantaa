import type { Metadata } from "next"

import { loadBoards } from "@/features/boards/server/load-boards"
import { BoardsView } from "@/features/boards/view/boards-view"

export const metadata: Metadata = {
  title: "Boards - Orvantaa Admin",
  description: "Manage boards and universities",
}

export default async function BoardsPage() {
  const { boards } = await loadBoards()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <BoardsView boards={boards} />
    </div>
  )
}
