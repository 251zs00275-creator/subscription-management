'use client'

import { ReceiptUpload } from '@/components/Forms/ReceiptUpload'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function ReceiptPage() {
  const { add } = useSubscriptions()
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(data: {
    date: string
    storeName: string
    amount: number
    category: import('@/types').Category
    memo: string
  }) {
    await add({
      name: data.storeName || '不明な店舗',
      amount: data.amount,
      category: data.category,
      nextPaymentDate: data.date,
      memo: data.memo,
      isActive: true,
    })
    toast({ title: '登録しました', description: `${data.storeName || '店舗'}を追加しました` })
    router.push('/subscriptions')
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gradient">レシート読取</h1>
        <p className="text-muted-foreground">
          レシートを撮影またはアップロードして自動入力します
        </p>
      </div>
      <VisualNovelPanel
        characterId="reminder-jirai"
        message="レシート担当も私だよ。画像から日付・店舗・金額を拾うから、最後に内容だけ確認して登録してね。"
      />
      <MiniCharacterGuide
        characterId="reminder-jirai"
        label="Receipt Coach"
        message="読み取り後は日付・店舗名・金額だけ軽く見直してください。誤読があってもここで直せます。"
      />
      <ReceiptUpload onSubmit={handleSubmit} />
    </div>
  )
}
