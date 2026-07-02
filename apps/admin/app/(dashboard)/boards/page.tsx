import { boardsPageMetadata } from "@/features/dashboard/model/page-metadata"
import { loadBoards } from "@/features/boards/server/load-boards"
import { BoardsView } from "@/features/boards/view/boards-view"

export const metadata = boardsPageMetadata

export default async function BoardsPage() {
  const { boards } = await loadBoards()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <BoardsView boards={boards} />
    </div>
  )
}
