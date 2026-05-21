import { GripVertical } from 'lucide-react'

interface DragHandleProps {
  // dnd-kit listener/attribute spreads — intentionally broad
  sortableProps?: object
}

export function DragHandle({ sortableProps }: DragHandleProps) {
  return (
    <button
      type="button"
      className="touch-none cursor-grab p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100 active:cursor-grabbing"
      aria-label="ドラッグして並び替え"
      {...(sortableProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
}
