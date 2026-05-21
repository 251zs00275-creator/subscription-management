'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { CATEGORIES } from '@/types'
import type { CsvRow, Category } from '@/types'

interface CSVPreviewProps {
  rows: CsvRow[]
  onConfirm: (rows: CsvRow[]) => void
  onCancel: () => void
  isImporting: boolean
}

export function CSVPreview({ rows, onConfirm, onCancel, isImporting }: CSVPreviewProps) {
  const [editedRows, setEditedRows] = useState<CsvRow[]>(rows)

  const validRows = editedRows.filter((r) => r.isValid)
  const invalidRows = editedRows.filter((r) => !r.isValid)

  function updateCategory(index: number, category: Category) {
    setEditedRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, category } : row))
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-medium">{validRows.length}件 インポート可能</span>
        </div>
        {invalidRows.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{invalidRows.length}件 スキップ</span>
          </div>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">日付</th>
              <th className="px-3 py-2 text-left font-medium">内容</th>
              <th className="px-3 py-2 text-right font-medium">金額</th>
              <th className="px-3 py-2 text-left font-medium">カテゴリ</th>
              <th className="px-3 py-2 text-center font-medium">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {editedRows.map((row, i) => (
              <tr
                key={i}
                className={row.isValid ? '' : 'bg-amber-50 dark:bg-amber-950/20'}
              >
                <td className="px-3 py-2 text-muted-foreground">{row.date}</td>
                <td className="px-3 py-2 max-w-[180px] truncate">{row.description}</td>
                <td className="px-3 py-2 text-right font-mono">
                  ¥{row.amount.toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {row.isValid ? (
                    <Select
                      value={row.category}
                      onValueChange={(v) => updateCategory(i, v as Category)}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.isValid ? (
                    <Badge variant="outline" className="text-xs text-green-600">
                      OK
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-amber-600">
                      スキップ
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invalidRows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          ※ スキップ行は必須フィールドが欠けているか金額が0です
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isImporting}>
          キャンセル
        </Button>
        <Button
          onClick={() => onConfirm(editedRows.filter((r) => r.isValid))}
          disabled={isImporting || validRows.length === 0}
        >
          {isImporting ? 'インポート中...' : `${validRows.length}件をインポート`}
        </Button>
      </div>
    </div>
  )
}
