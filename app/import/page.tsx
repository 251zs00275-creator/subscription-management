'use client'

import { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CategoryReviewPanel } from '@/components/Forms/CategoryReviewPanel'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { parseCSV } from '@/lib/csv'
import { detectCategory } from '@/lib/categories'
import { loadCustomRules } from '@/lib/customRules'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useToast } from '@/hooks/use-toast'
import type { ImportResult, CsvRow } from '@/types'

type ImportStep = 'upload' | 'review'

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('upload')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { bulkImport } = useSubscriptions()
  const { toast } = useToast()

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      toast({ title: 'エラー', description: 'CSVファイルを選択してください', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      const customRules = loadCustomRules()
      const retagged: ImportResult = {
        ...parsed,
        rows: parsed.rows.map((row) =>
          row.isValid
            ? { ...row, category: detectCategory(row.description, customRules) }
            : row
        ),
      }
      setImportResult(retagged)
      setStep('review')
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleConfirm(rows: CsvRow[]) {
    setIsImporting(true)
    try {
      const items = rows.map((row) => ({
        name: row.description,
        amount: row.amount,
        category: row.category,
        nextPaymentDate: row.date,
        memo: `CSVインポート: ${row.date}`,
        isActive: true,
      }))
      await bulkImport(items)
      toast({ title: 'インポート完了', description: `${rows.length}件をインポートしました` })
      setImportResult(null)
      setStep('upload')
    } catch {
      toast({ title: 'エラー', description: 'インポートに失敗しました', variant: 'destructive' })
    } finally {
      setIsImporting(false)
    }
  }

  function handleBack() {
    setImportResult(null)
    setStep('upload')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gradient">CSVインポート</h1>
        <p className="text-muted-foreground">
          MoneyForward ME または d払いの利用明細CSVをインポートします
        </p>
      </div>

      <VisualNovelPanel
        characterId="reminder-jirai"
        tone="success"
        message="CSVを持ってきてくれたら、カテゴリ候補までまとめて確認するよ。取り込み前に内容を見直せるから、変な分類はここで直してね。"
      />

      <MiniCharacterGuide
        characterId="reminder-jirai"
        label="Import Coach"
        message="CSVを入れたら、カテゴリ候補を確認してから登録すると後の分析がきれいになります。"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={step === 'upload' ? 'font-semibold text-foreground' : ''}>
          1. ファイル選択
        </span>
        <span>→</span>
        <span className={step === 'review' ? 'font-semibold text-foreground' : ''}>
          2. カテゴリ確認・設定
        </span>
        <span>→</span>
        <span>3. インポート完了</span>
      </div>

      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>CSVファイルを選択</CardTitle>
            <CardDescription>
              MoneyForward ME / d払い形式のCSVに対応しています
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">
                ここにCSVをドラッグ＆ドロップ
              </p>
              <p className="mb-4 text-xs text-muted-foreground">または</p>
              <label>
                <Button asChild variant="outline">
                  <span>ファイルを選択</span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p className="font-medium">対応形式:</p>
              <p>• MoneyForward ME: 日付, 内容, 金額（出金）</p>
              <p>• d払い: 利用日, 利用先, 利用金額</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ確認・設定</CardTitle>
            <CardDescription>
              カテゴリを確認・修正し、カスタムキーワードルールを設定できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryReviewPanel
              rows={importResult.rows}
              onConfirm={handleConfirm}
              onBack={handleBack}
              isImporting={isImporting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
