'use client'

import { X, AlertTriangle, TrendingDown, PiggyBank, Trash2, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Suggestion } from '@/types'

const ICONS = {
  inactive: TrendingDown,
  spike: AlertTriangle,
  savings: PiggyBank,
  'llm-insight': Lightbulb,
}

const COLORS = {
  inactive: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30',
  spike: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30',
  savings: 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30',
  'llm-insight': 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/30',
}

const ICON_COLORS = {
  inactive: 'text-blue-500',
  spike: 'text-amber-500',
  savings: 'text-green-500',
  'llm-insight': 'text-purple-500',
}

interface SuggestionCardProps {
  suggestion: Suggestion
  onDismiss: (id: string) => void
  onCancelSubscription?: (subscriptionId: string) => void
}

export function SuggestionCard({ suggestion, onDismiss, onCancelSubscription }: SuggestionCardProps) {
  const Icon = ICONS[suggestion.type]

  return (
    <Card className={`border ${COLORS[suggestion.type]}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${ICON_COLORS[suggestion.type]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold">{suggestion.title}</p>
            {suggestion.source === 'llm' && (
              <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                AI分析
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{suggestion.description}</p>
          {suggestion.type === 'inactive' && suggestion.subscriptionId && onCancelSubscription && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              onClick={() => onCancelSubscription(suggestion.subscriptionId!)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              解約（削除）する
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => onDismiss(suggestion.id)}
          aria-label="この提案を閉じる"
        >
          <X className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
