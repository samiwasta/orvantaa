"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@workspace/ui/lib/utils"
import { GripVertical } from "lucide-react"
import type { ReactNode } from "react"

export type DraggableSortableCardProps = {
  id: string
  children: ReactNode
  className?: string
  dragHandleLabel?: string
  disabled?: boolean
}

export function DraggableSortableCard({
  id,
  children,
  className,
  dragHandleLabel = "Drag to reorder",
  disabled = false,
}: DraggableSortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-2xl border border-border/60 bg-white p-3 shadow-sm ring-1 ring-black/[0.04] transition-[box-shadow,border-color,opacity]",
        isDragging &&
          "z-10 border-[#6C5CE7]/50 shadow-md ring-[#6C5CE7]/20 opacity-95",
        !isDragging && "hover:border-[#6C5CE7]/35 hover:shadow-md",
        disabled && "opacity-70",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex size-9 shrink-0 touch-none items-center justify-center rounded-xl text-muted-foreground transition-colors",
          disabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/45"
        )}
        aria-label={dragHandleLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      {children}
    </li>
  )
}

export type DraggableSortableListProps<T extends { id: string }> = {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  disabled?: boolean
  getDragHandleLabel?: (item: T, index: number) => string
}

export function DraggableSortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  disabled = false,
  getDragHandleLabel,
}: DraggableSortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    if (disabled) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={cn("flex flex-col gap-2", className)}>
          {items.map((item, index) => (
            <DraggableSortableCard
              key={item.id}
              id={item.id}
              disabled={disabled}
              dragHandleLabel={
                getDragHandleLabel?.(item, index) ?? `Reorder item ${index + 1}`
              }
            >
              {renderItem(item, index)}
            </DraggableSortableCard>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
