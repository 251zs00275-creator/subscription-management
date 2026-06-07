import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryReviewPanel } from '@/components/Forms/CategoryReviewPanel'
import type { CsvRow } from '@/types'

const baseRows: CsvRow[] = [
  { date: '2024/04/01', description: 'Netflix', amount: 1490, category: 'サブスク', isValid: true },
  { date: '2024/04/05', description: 'スーパーマルエツ', amount: 3240, category: '食費', isValid: true },
  { date: '2024/04/10', description: '謎の取引', amount: 0, category: 'その他', isValid: false, error: '金額が不正です' },
]

const mockConfirm = jest.fn()
const mockBack = jest.fn()

const defaultProps = {
  rows: baseRows,
  onConfirm: mockConfirm,
  onBack: mockBack,
  isImporting: false,
}

describe('CategoryReviewPanel', () => {
  beforeAll(() => {
    // Radix Select relies on pointer-capture / scroll APIs that jsdom does not implement.
    window.HTMLElement.prototype.hasPointerCapture = jest.fn()
    window.HTMLElement.prototype.releasePointerCapture = jest.fn()
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('shows valid/invalid row counts and category breakdown', () => {
    render(<CategoryReviewPanel {...defaultProps} />)

    expect(screen.getByText('2件 インポート可能')).toBeInTheDocument()
    expect(screen.getByText('1件 スキップ')).toBeInTheDocument()

    const summarySection = screen.getByText('カテゴリ別内訳').closest('div') as HTMLElement
    expect(within(summarySection).getByText('サブスク')).toBeInTheDocument()
    expect(within(summarySection).getByText('食費')).toBeInTheDocument()
  })

  it('lists only valid rows in the review table and notes skipped rows', () => {
    render(<CategoryReviewPanel {...defaultProps} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('スーパーマルエツ')).toBeInTheDocument()
    expect(screen.queryByText('謎の取引')).not.toBeInTheDocument()
    expect(screen.getByText('※ 1件の無効な行はスキップされます')).toBeInTheDocument()
  })

  it('calls onConfirm with only the valid rows when confirmed', async () => {
    const user = userEvent.setup()
    render(<CategoryReviewPanel {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '2件をインポート' }))

    expect(mockConfirm).toHaveBeenCalledWith([baseRows[0], baseRows[1]])
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    render(<CategoryReviewPanel {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '← 戻る' }))

    expect(mockBack).toHaveBeenCalled()
  })

  it('disables actions while importing', () => {
    render(<CategoryReviewPanel {...defaultProps} isImporting />)

    expect(screen.getByRole('button', { name: '← 戻る' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'インポート中...' })).toBeDisabled()
  })

  it('adds and removes a custom keyword rule, persisting to storage', async () => {
    const user = userEvent.setup()
    render(<CategoryReviewPanel {...defaultProps} />)

    await user.click(screen.getByText('カスタムキーワードルール設定'))
    await user.type(screen.getByPlaceholderText('キーワード（例: ポーラ）'), 'ポーラ')
    await user.click(screen.getByRole('button', { name: /追加/ }))

    expect(screen.getByText('ポーラ')).toBeInTheDocument()
    expect(screen.getByText('1件登録済み')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('custom-keyword-rules') ?? '[]')).toHaveLength(1)

    const ruleRow = screen.getByText('ポーラ').closest('div') as HTMLElement
    await user.click(within(ruleRow).getByRole('button'))

    expect(screen.queryByText('ポーラ')).not.toBeInTheDocument()
    expect(screen.getByText('0件登録済み')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('custom-keyword-rules') ?? '[]')).toHaveLength(0)
  })

  it('lets the user pick a category for a new rule and reapply rules to non-edited rows', async () => {
    const user = userEvent.setup()
    render(<CategoryReviewPanel {...defaultProps} />)

    await user.click(screen.getByText('カスタムキーワードルール設定'))

    const keywordInput = screen.getByPlaceholderText('キーワード（例: ポーラ）')
    const addRow = keywordInput.closest('div') as HTMLElement
    await user.click(within(addRow).getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: '通信費' }))
    await user.type(keywordInput, 'Netflix')
    await user.click(screen.getByRole('button', { name: /追加/ }))

    expect(screen.getByText('Netflix', { selector: 'span.font-mono' })).toBeInTheDocument()
    expect(screen.getByText('1件登録済み')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ルールを適用して再分類/ }))

    const triggers = screen.getAllByRole('combobox')
    expect(within(triggers[0]).getByText('通信費')).toBeInTheDocument()
  })

  it('marks a row as manually edited when its category is changed', async () => {
    const user = userEvent.setup()
    render(<CategoryReviewPanel {...defaultProps} />)

    const triggers = screen.getAllByRole('combobox')
    await user.click(triggers[0])
    await user.click(await screen.findByRole('option', { name: '通信費' }))

    expect(within(triggers[0]).getByText('通信費')).toBeInTheDocument()
  })
})
