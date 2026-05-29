import type { Subscription } from '@/types'

export function downloadTextFile(contents: string, filename: string, type: string): void {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(subscriptions: Subscription[]): void {
  const headers = ['名称', '月額', 'カテゴリ', '次回支払日', 'メモ', '有効']
  const rows = subscriptions.map((s) => [
    s.name,
    s.amount.toString(),
    s.category,
    s.nextPaymentDate,
    s.memo,
    s.isActive ? '有効' : '無効',
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '﻿'
  downloadTextFile(
    bom + csv,
    `subscriptions_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  )
}
