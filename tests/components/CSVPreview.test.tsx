import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CSVPreview } from '@/components/Forms/CSVPreview'
import type { CsvRow } from '@/types'

const validRows: CsvRow[] = [
  { date: '2024-04-01', description: 'Netflix', amount: 1490, category: 'サブスク', isValid: true },
  { date: '2024-04-05', description: 'スーパーマルエツ', amount: 3240, category: '食費', isValid: true },
]

const mixedRows: CsvRow[] = [
  ...validRows,
  { date: '', description: '不正な行', amount: 0, category: 'その他', isValid: false, error: '必須フィールドが見つかりません' },
]

describe('CSVPreview', () => {
  const mockConfirm = jest.fn()
  const mockCancel = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders valid row count', () => {
    render(
      <CSVPreview rows={validRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    expect(screen.getByText(/2件 インポート可能/)).toBeInTheDocument()
  })

  it('renders invalid row warning when mixed rows', () => {
    render(
      <CSVPreview rows={mixedRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    expect(screen.getByText(/1件 スキップ/)).toBeInTheDocument()
  })

  it('renders description for each row', () => {
    render(
      <CSVPreview rows={validRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('スーパーマルエツ')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <CSVPreview rows={validRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockCancel).toHaveBeenCalled()
  })

  it('calls onConfirm with valid rows on confirm click', () => {
    render(
      <CSVPreview rows={validRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    fireEvent.click(screen.getByRole('button', { name: /インポート/ }))
    expect(mockConfirm).toHaveBeenCalledWith(validRows)
  })

  it('only passes valid rows to onConfirm', () => {
    render(
      <CSVPreview rows={mixedRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    fireEvent.click(screen.getByRole('button', { name: /インポート/ }))
    const calledWith = mockConfirm.mock.calls[0][0] as CsvRow[]
    expect(calledWith.every((r) => r.isValid)).toBe(true)
    expect(calledWith).toHaveLength(2)
  })

  it('disables buttons when isImporting is true', () => {
    render(
      <CSVPreview rows={validRows} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={true} />
    )
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled()
  })

  it('disables confirm button when no valid rows', () => {
    const invalidOnly: CsvRow[] = [
      { date: '', description: '不正', amount: 0, category: 'その他', isValid: false },
    ]
    render(
      <CSVPreview rows={invalidOnly} onConfirm={mockConfirm} onCancel={mockCancel} isImporting={false} />
    )
    expect(screen.getByRole('button', { name: /インポート/ })).toBeDisabled()
  })
})
