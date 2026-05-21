'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, CATEGORY_COLORS } from '@/types'
import type { CsvRow, Category, CustomKeywordRule } from '@/types'
import { formatCurrency } from '@/lib/calculator'
import { detectCategory } from '@/lib/categories'
import {
  loadCustomRules,
  addCustomRule,
  removeCustomRule,
} from '@/lib/customRules'

interface CategoryReviewPanelProps {
  rows: CsvRow[]
  onConfirm: (rows: CsvRow[]) => void
  onBack: () => void
  isImporting: boolean
}

interface EditableRow extends CsvRow {
  manuallyEdited?: boolean
}

export function CategoryReviewPanel({
  rows,
  onConfirm,
  onBack,
  isImporting,
}: CategoryReviewPanelProps) {
  const [editedRows, setEditedRows] = useState<EditableRow[]>(rows)
  const [customRules, setCustomRules] = useState<CustomKeywordRule[]>([])
  const [rulesOpen, setRulesOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('その他')

  useEffect(() => {
    setCustomRules(loadCustomRules())
  }, [])

  const validRows = editedRows.filter((r) => r.isValid)
  const invalidRows = editedRows.filter((r) => !r.isValid)

  const categorySummary = CATEGORIES.map((cat) => {
    const catRows = validRows.filter((r) => r.category === cat)
    return {
      category: cat,
      count: catRows.length,
      total: catRows.reduce((s, r) => s + r.amount, 0),
    }
  }).filter((c) => c.count > 0)

  const grandTotal = validRows.reduce((s, r) => s + r.amount, 0)

  function updateCategory(index: number, category: Category) {
    setEditedRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, category, manuallyEdited: true } : row))
    )
  }

  function handleAddRule() {
    if (!newKeyword.trim()) return
    const next = addCustomRule(newKeyword, newCategory)
    setCustomRules(next)
    setNewKeyword('')
  }

  function handleRemoveRule(id: string) {
    const next = removeCustomRule(id)
    setCustomRules(next)
  }

  function handleReapply() {
    setEditedRows((prev) =>
      prev.map((row) => {
        if (!row.isValid || row.manuallyEdited) return row
        return { ...row, category: detectCategory(row.description, customRules) }
      })
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Category summary cards */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">カテゴリ別内訳</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {categorySummary.map(({ category, count, total }) => (
            <div
              key={category}
              className="rounded-lg border p-3"
              style={{ borderColor: CATEGORY_COLORS[category] + '55' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-xs font-medium truncate">{category}</span>
              </div>
              <p className="text-sm font-bold">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground">{count}件</p>
            </div>
          ))}
        </div>

        {/* Horizontal stacked bar */}
        {grandTotal > 0 && categorySummary.length > 1 && (
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full">
            {categorySummary.map(({ category, total }) => (
              <div
                key={category}
                className="transition-all"
                style={{
                  width: `${(total / grandTotal) * 100}%`,
                  backgroundColor: CATEGORY_COLORS[category],
                }}
                title={`${category}: ${formatCurrency(total)}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom keyword rules panel */}
      <div className="rounded-lg border">
        <button
          onClick={() => setRulesOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span>カスタムキーワードルール設定</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {customRules.length}件登録済み
            </Badge>
            {rulesOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {rulesOpen && (
          <div className="border-t px-4 pb-4 space-y-4">
            <p className="pt-3 text-xs text-muted-foreground">
              キーワードが含まれる取引を指定カテゴリに自動分類します。次回のインポートにも引き継がれます。
            </p>

            {/* Existing rules */}
            {customRules.length > 0 && (
              <div className="space-y-2">
                {customRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <span className="flex-1 text-sm font-mono">{rule.keyword}</span>
                    <span className="text-muted-foreground text-xs">→</span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: CATEGORY_COLORS[rule.category] + '88', color: CATEGORY_COLORS[rule.category] }}
                    >
                      {rule.category}
                    </Badge>
                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new rule */}
            <div className="flex gap-2">
              <Input
                placeholder="キーワード（例: ポーラ）"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                className="h-8 text-sm"
              />
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
                <SelectTrigger className="h-8 w-28 text-xs">
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
              <Button size="sm" variant="outline" onClick={handleAddRule} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                追加
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleReapply}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              ルールを適用して再分類
            </Button>
            <p className="text-xs text-muted-foreground">
              ※ 手動でカテゴリを変更済みの行は上書きされません
            </p>
          </div>
        )}
      </div>

      {/* Row table */}
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          各行のカテゴリを確認・修正できます
        </p>
        <div className="max-h-72 overflow-y-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">日付</th>
                <th className="px-3 py-2 text-left font-medium">内容</th>
                <th className="px-3 py-2 text-right font-medium">金額</th>
                <th className="px-3 py-2 text-left font-medium">カテゴリ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {validRows.map((row, i) => {
                const globalIndex = editedRows.indexOf(row)
                return (
                  <tr key={i} className={row.manuallyEdited ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{row.date}</td>
                    <td className="px-3 py-2 max-w-[200px] truncate">{row.description}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      ¥{row.amount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={row.category}
                        onValueChange={(v) => updateCategory(globalIndex, v as Category)}
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {invalidRows.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            ※ {invalidRows.length}件の無効な行はスキップされます
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isImporting}>
          ← 戻る
        </Button>
        <Button
          onClick={() => onConfirm(validRows)}
          disabled={isImporting || validRows.length === 0}
        >
          {isImporting ? 'インポート中...' : `${validRows.length}件をインポート`}
        </Button>
      </div>
    </div>
  )
}
