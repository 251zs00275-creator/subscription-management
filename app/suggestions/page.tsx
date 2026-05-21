'use client'

import { useEffect, useMemo, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SuggestionCard } from '@/components/Dashboard/SuggestionCard'
import { EmptyState } from '@/components/Common/EmptyState'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { generateSuggestions } from '@/lib/suggestions'
import { useToast } from '@/hooks/use-toast'
import type { Suggestion } from '@/types'

export default function SuggestionsPage() {
  const { subscriptions, load, remove } = useSubscriptions()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    load()
  }, [load])

  const suggestions = useMemo(
    () => generateSuggestions(subscriptions),
    [subscriptions]
  )

  const visible = suggestions.filter((s) => !dismissed.has(s.id))
  const hasRisk = visible.some((s) => s.type === 'spike' || s.type === 'inactive')
  const advisorMessage = useMemo(() => {
    const inactive = visible.filter((s) => s.type === 'inactive').length
    const spike = visible.filter((s) => s.type === 'spike').length
    const savings = visible.find((s) => s.type === 'savings')?.potentialSavings ?? 0

    if (inactive > 0 && spike > 0) {
      return `未使用候補が${inactive}件、支出増加の警告が${spike}件あります。まずは解約しやすいものから触りましょう。年間では${savings.toLocaleString()}円の余地も見えています。`
    }
    if (inactive > 0) {
      return `眠っているサブスクが${inactive}件あります。必要だった頃の契約でも、今のあなたに必要とは限りません。静かに切れるものから減らしましょう。`
    }
    if (spike > 0) {
      return `支出が急に増えたカテゴリが${spike}件あります。一時的な出費なら問題ありません。続く支出なら、ここで止める価値があります。`
    }
    if (savings > 0) {
      return `年間${savings.toLocaleString()}円ほど、整えられる余地があります。大きな我慢より、小さな固定費を消す方が長く効きます。`
    }
    return '今のところ大きな警告はありません。ですが、定額支出は静かに増えます。月に一度だけ、私と一緒に確認しましょう。'
  }, [visible])

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return
    await remove(cancelTarget)
    setCancelTarget(null)
    toast({ title: '解約しました', description: 'サブスクを削除しました' })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">改善提案</h1>
        <p className="text-muted-foreground">
          支出パターンから節約機会を提案します
        </p>
      </div>

      <VisualNovelPanel
        characterId="advisor-danger"
        tone={hasRisk ? 'alert' : 'calm'}
        message={advisorMessage}
      />

      <MiniCharacterGuide
        characterId="advisor-danger"
        label="Risk Coach"
        message="警告は強めに出します。まずは解約候補と増加カテゴリだけ見れば十分です。"
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="提案はありません"
          description="現在、改善提案はありません。サブスクを追加すると分析が始まります。"
        />
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {visible.map((suggestion: Suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
              >
                <SuggestionCard
                  suggestion={suggestion}
                  onDismiss={handleDismiss}
                  onCancelSubscription={(subId) => setCancelTarget(subId)}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        title="サブスクを解約"
        description="このサブスクを解約（削除）します。この操作は取り消せません。"
        confirmLabel="解約する"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
