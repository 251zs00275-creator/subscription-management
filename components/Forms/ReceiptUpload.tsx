'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, FileImage, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES } from '@/types'
import type { Category } from '@/types'

interface ReceiptFormData {
  date: string
  storeName: string
  amount: number
  category: Category
  memo: string
}

interface ReceiptUploadProps {
  onSubmit: (data: ReceiptFormData) => Promise<void>
}

export function ReceiptUpload({ onSubmit }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReceiptFormData>({
    date: new Date().toISOString().slice(0, 10),
    storeName: '',
    amount: 0,
    category: 'その他',
    memo: 'レシートから入力',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showManual, setShowManual] = useState(false)

  async function processImage(file: File) {
    if (!file.type.startsWith('image/')) {
      setOcrError('画像ファイル（JPEG/PNG）を選択してください')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsProcessing(true)
    setOcrError(null)

    try {
      const { performOCR } = await import('@/lib/ocr')
      const result = await performOCR(file)

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          date: result.date || prev.date,
          storeName: result.storeName || prev.storeName,
          amount: result.amount || prev.amount,
        }))
      } else {
        setOcrError(result.error ?? '文字の読み取りに失敗しました。手動で入力してください。')
        setShowManual(true)
      }
    } catch {
      setOcrError('OCR処理中にエラーが発生しました。手動で入力してください。')
      setShowManual(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await processImage(file)
  }, [])

  function set<K extends keyof ReceiptFormData>(key: K, value: ReceiptFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="レシートプレビュー"
            width={320}
            height={160}
            sizes="320px"
            unoptimized
            className="max-h-40 max-w-full rounded object-contain"
          />
        ) : (
          <FileImage className="mb-3 h-10 w-10 text-muted-foreground" />
        )}
        {isProcessing && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="animate-spin">⟳</span>
              <span className="animate-pulse">文字を読み取り中...</span>
            </div>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-[progress_2s_ease-in-out_infinite] bg-primary rounded-full" />
            </div>
          </div>
        )}
        {!isProcessing && (
          <label className="mt-3">
            <Button asChild variant="outline" size="sm">
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {previewUrl ? '別の画像を選択' : '画像をアップロード'}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processImage(f) }}
            />
          </label>
        )}
      </div>

      {ocrError && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{ocrError}</p>
        </div>
      )}

      {(previewUrl || showManual) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {ocrError ? '手動で入力してください' : '読み取り結果を確認'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="ocr-store">店舗名</Label>
                  <Input
                    id="ocr-store"
                    value={formData.storeName}
                    onChange={(e) => set('storeName', e.target.value)}
                    placeholder="店舗名"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ocr-date">日付</Label>
                  <Input
                    id="ocr-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => set('date', e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ocr-amount">金額（円）</Label>
                  <Input
                    id="ocr-amount"
                    type="number"
                    min={1}
                    value={formData.amount || ''}
                    onChange={(e) => set('amount', Number(e.target.value))}
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ocr-category">カテゴリ</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => set('category', v as Category)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="ocr-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || isProcessing} className="w-full">
                {isSubmitting ? '保存中...' : 'サブスクとして登録する'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
