'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Lightbulb, LogIn, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SuggestionCard } from '@/components/Dashboard/SuggestionCard'
import { EmptyState } from '@/components/Common/EmptyState'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { analyzeSuggestionsWithLLM } from '@/lib/llmAnalysis'
import { getPendingTask } from '@/lib/llmAnalysisQueue'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Suggestion } from '@/types'

type AnalysisStatus = 'requiresSignIn' | 'waiting' | 'analyzing' | 'done' | 'error'

const RETRY_INTERVAL_MS = 30000

export default function SuggestionsPage() {
  const { subscriptions, isLoading, load, remove } = useSubscriptions()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [status, setStatus] = useState<AnalysisStatus>('analyzing')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const hasAnalyzedRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    load()
  }, [load])

  const runAnalysis = useCallback(async () => {
    setStatus('analyzing')
    const result = await analyzeSuggestionsWithLLM(subscriptions)

    if ('requiresSignIn' in result) {
      setStatus('requiresSignIn')
      return
    }
    if ('pending' in result) {
      setStatus('waiting')
      return
    }
    if ('error' in result) {
      setErrorMessage(result.error)
      setStatus('error')
      return
    }
    setSuggestions(result.suggestions)
    setStatus('done')
  }, [subscriptions])

  useEffect(() => {
    if (isLoading || hasAnalyzedRef.current || subscriptions.length === 0) return
    hasAnalyzedRef.current = true
    let cancelled = false
    void (async () => {
      // 端末間で共有された保留タスクがあれば、新規分析を走らせず待機状態から再開する
      const pending = await getPendingTask()
      if (cancelled) return
      if (pending) {
        setStatus('waiting')
        return
      }
      await runAnalysis()
    })()
    return () => {
      cancelled = true
    }
  }, [isLoading, subscriptions, runAnalysis])

  // 待機中は Ollama の起動を見越して定期的に分析を再試行する
  useEffect(() => {
    if (status !== 'waiting') return
    const timer = setInterval(() => {
      void runAnalysis()
    }, RETRY_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [status, runAnalysis])

  async function handleSignIn() {
    const client = getSupabaseBrowserClient()
    if (!client) return
    setSigningIn(true)
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/suggestions` },
    })
    setSigningIn(false)
  }

  function handleRetry() {
    void runAnalysis()
  }

  const visible = suggestions.filter((s) => !dismissed.has(s.id))
  const totalSavings = visible.reduce((sum, s) => sum + (s.potentialSavings ?? 0), 0)

  const advisorMessage = (() => {
    if (status === 'requiresSignIn') {
      return 'ローカル LLM による分析には Google ログインが必要です。ログインすると、分析の進み具合を端末間で共有できます。'
    }
    if (status === 'waiting') {
      return 'Ollama の起動を待っています。準備ができたら自動的に分析を始めますので、少し時間を置いてからまた覗いてみてください。'
    }
    if (status === 'analyzing') {
      return 'ローカル LLM があなたのサブスクを読み解いています。少しだけ待っていてくださいね。'
    }
    if (status === 'error') {
      return '分析中に問題が起きました。もう一度試すか、しばらく時間をおいてから再度お試しください。'
    }
    if (visible.length === 0) {
      return '今のところ大きな警告はありません。ですが、定額支出は静かに増えます。月に一度だけ、私と一緒に確認しましょう。'
    }
    if (totalSavings > 0) {
      return `${visible.length}件の提案があります。実行できれば年間${totalSavings.toLocaleString()}円ほど見直せるかもしれません。`
    }
    return `${visible.length}件の提案があります。気になるものから見ていきましょう。`
  })()

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
          ローカル LLM（Ollama）がサブスクの利用状況を分析し、見直しの提案をお届けします
        </p>
      </div>

      <VisualNovelPanel
        characterId="advisor-danger"
        tone={status === 'error' ? 'alert' : 'calm'}
        message={advisorMessage}
      />

      <MiniCharacterGuide
        characterId="advisor-danger"
        label="Risk Coach"
        message="分析は Ollama が起動しているときだけ行えます。起動したら「今すぐ確認」を押してください。"
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={status === 'analyzing' || status === 'requiresSignIn'}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          今すぐ確認
        </Button>
      </div>

      {status === 'requiresSignIn' && (
        <div className="space-y-3">
          <EmptyState
            icon={LogIn}
            title="Google ログインが必要です"
            description="分析の保留状態をクラウドに保存して端末間で共有するため、この機能には Google ログインが必要です。"
          />
          <div className="flex justify-center">
            <Button type="button" onClick={handleSignIn} disabled={signingIn}>
              <LogIn className="mr-1.5 h-4 w-4" />
              Google でログイン
            </Button>
          </div>
        </div>
      )}

      {status === 'waiting' && (
        <EmptyState
          icon={Lightbulb}
          title="Ollama 接続待機中"
          description="Ollama が起動すると自動的に分析を開始します。起動したら「今すぐ確認」を押してください。"
        />
      )}

      {status === 'analyzing' && (
        <div
          className="anime-frame flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center"
          style={{
            background: 'var(--anime-surface)',
            border: '1px dashed var(--anime-card-border)',
          }}
        >
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--anime-primary)' }} />
          <h3 className="mt-4 text-lg font-semibold text-[var(--anime-text)]">
            ローカル LLM で分析中…
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--anime-muted)]">
            サブスクの利用状況を読み解いています。少しお待ちください。
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <EmptyState icon={AlertTriangle} title="分析に失敗しました" description={errorMessage} />
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={handleRetry}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              再試行
            </Button>
          </div>
        </div>
      )}

      {status === 'done' &&
        (visible.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="提案はありません"
            description="現在、改善提案はありません。サブスクの内容が変わったら「今すぐ確認」で再分析できます。"
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
        ))}

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
