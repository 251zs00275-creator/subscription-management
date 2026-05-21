'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const SHORTCUTS = [
  { key: 'N', label: '新しいサブスクを追加' },
  { key: '/', label: '検索にフォーカス' },
  { key: '?', label: 'このヘルプを表示' },
]

interface KeyboardHelpProps {
  open: boolean
  onClose: () => void
}

export function KeyboardHelp({ open, onClose }: KeyboardHelpProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {SHORTCUTS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
