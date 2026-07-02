import { contentPageMetadata } from "@/features/dashboard/model/page-metadata"
import { loadContentBoards } from "@/features/content/server/load-content-boards"
import { ContentBoardsView } from "@/features/content/view/content-boards-view"

export const metadata = contentPageMetadata

export default async function ContentPage() {
  const { boards } = await loadContentBoards()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ContentBoardsView boards={boards} />
    </div>
  )
}
