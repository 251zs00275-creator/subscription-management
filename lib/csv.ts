import Papa from 'papaparse'
import { detectCategory } from '@/lib/categories'
import type { CsvRow, ImportResult } from '@/types'

function normalizeAmount(raw: string): number {
  const cleaned = raw.replace(/[,，¥￥\s]/g, '')
  const value = Number(cleaned)
  return isNaN(value) ? 0 : Math.abs(value)
}

function normalizeDate(raw: string): string {
  const cleaned = raw.trim().replace(/\//g, '-')
  const date = new Date(cleaned)
  if (isNaN(date.getTime())) return raw
  return date.toISOString().slice(0, 10)
}

interface RawRow {
  [key: string]: string
}

function parseMoneyForwardRow(row: RawRow): CsvRow | null {
  const date = row['日付'] ?? row['date'] ?? ''
  const description = row['内容'] ?? row['description'] ?? ''
  const amountRaw = row['金額（出金）'] ?? row['出金金額'] ?? row['amount'] ?? ''

  if (!date || !description || !amountRaw) return null

  const amount = normalizeAmount(amountRaw)
  if (amount <= 0) return null

  return {
    date: normalizeDate(date),
    description: description.trim(),
    amount,
    category: detectCategory(description),
    isValid: true,
  }
}

function parseDbaraiRow(row: RawRow): CsvRow | null {
  const date = row['利用日'] ?? row['決済日'] ?? ''
  const description = row['利用先'] ?? row['加盟店名'] ?? row['store'] ?? ''
  const amountRaw = row['利用金額'] ?? row['金額'] ?? ''

  if (!date || !description || !amountRaw) return null

  const amount = normalizeAmount(amountRaw)
  if (amount <= 0) return null

  return {
    date: normalizeDate(date),
    description: description.trim(),
    amount,
    category: detectCategory(description),
    isValid: true,
  }
}

function detectFormat(headers: string[]): 'moneyforward' | 'dbarai' | 'unknown' {
  if (headers.includes('金額（出金）') || headers.includes('内容')) return 'moneyforward'
  if (headers.includes('利用日') || headers.includes('利用先')) return 'dbarai'
  return 'unknown'
}

export function parseCSV(csvText: string): ImportResult {
  const result = Papa.parse<RawRow>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  if (result.errors.length > 0 && result.data.length === 0) {
    return { rows: [], totalRows: 0, validRows: 0, invalidRows: 0 }
  }

  const headers = result.meta.fields ?? []
  const format = detectFormat(headers)

  const rows: CsvRow[] = []

  for (const raw of result.data) {
    try {
      let row: CsvRow | null = null
      if (format === 'moneyforward') row = parseMoneyForwardRow(raw)
      else if (format === 'dbarai') row = parseDbaraiRow(raw)
      else {
        row = parseMoneyForwardRow(raw) ?? parseDbaraiRow(raw)
      }

      if (row) {
        rows.push(row)
      } else {
        rows.push({
          date: '',
          description: Object.values(raw).join(', '),
          amount: 0,
          category: 'その他',
          isValid: false,
          error: '必須フィールドが見つかりません',
        })
      }
    } catch {
      rows.push({
        date: '',
        description: '',
        amount: 0,
        category: 'その他',
        isValid: false,
        error: '行の解析に失敗しました',
      })
    }
  }

  const validRows = rows.filter((r) => r.isValid).length
  return {
    rows,
    totalRows: rows.length,
    validRows,
    invalidRows: rows.length - validRows,
  }
}
