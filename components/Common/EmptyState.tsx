import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="anime-frame flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center"
      style={{
        background: 'var(--anime-surface)',
        border: '1px dashed var(--anime-card-border)',
      }}
    >
      {/* Icon orb */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(20,85,180,0.12), rgba(217,162,227,0.12))',
          border: '1px solid var(--anime-card-border)',
          boxShadow: '0 0 20px rgba(20,85,180,0.08)',
        }}
      >
        <Icon className="h-7 w-7" style={{ color: 'var(--anime-primary)' }} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--anime-text)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--anime-muted)]">{description}</p>

      {actionLabel && onAction && (
        <Button
          className="mt-6 font-semibold transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #1455B4, #2A52BE)',
            color: 'white',
            boxShadow: '0 0 12px rgba(20,85,180,0.3)',
            border: 'none',
          }}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
