import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubscriptionForm } from '@/components/Forms/SubscriptionForm'
import type { SubscriptionFormData } from '@/types'

const mockSubmit = jest.fn()
const mockClose = jest.fn()

const defaultProps = {
  open: true,
  onClose: mockClose,
  onSubmit: mockSubmit,
}

describe('SubscriptionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubmit.mockResolvedValue(undefined)
  })

  it('renders form fields', () => {
    render(<SubscriptionForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /自分でカスタム/ }))
    expect(screen.getByLabelText('サービス名 *')).toBeInTheDocument()
    expect(screen.getByLabelText('月額（円）*')).toBeInTheDocument()
    expect(screen.getByLabelText('次回支払日 *')).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    render(<SubscriptionForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /自分でカスタム/ }))
    fireEvent.submit(screen.getByRole('button', { name: '追加する' }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByText('サービス名を入力してください')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /自分でカスタム/ }))
    await user.type(screen.getByLabelText('サービス名 *'), 'Netflix')
    await user.clear(screen.getByLabelText('月額（円）*'))
    await user.type(screen.getByLabelText('月額（円）*'), '1490')

    fireEvent.submit(screen.getByRole('button', { name: '追加する' }).closest('form')!)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Netflix', amount: 1490 })
      )
    })
  })

  it('hides custom fields in preset mode until edit is clicked', () => {
    render(<SubscriptionForm {...defaultProps} />)

    expect(screen.queryByLabelText('サービス名 *')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('月額（円）*')).not.toBeInTheDocument()
    expect(screen.getByText('Amazon Prime')).toBeInTheDocument()
  })

  it('filters preset cards by category', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '音楽・音声' }))

    expect(screen.getByText('Spotify Premium')).toBeInTheDocument()
    expect(screen.getByText('Apple Music')).toBeInTheDocument()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
  })

  it('filters preset cards by text search', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm {...defaultProps} />)

    await user.type(screen.getByLabelText('サービスを検索'), 'spotify')

    expect(screen.getByText('Spotify Premium')).toBeInTheDocument()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
    expect(screen.queryByText('Amazon Prime')).not.toBeInTheDocument()
  })

  it('submits selected preset without opening editable fields', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Amazon Prime/ }))
    await user.click(screen.getByRole('button', { name: /年額プラン/ }))

    expect(screen.getByText('選択中のプリセット')).toBeInTheDocument()
    expect(screen.queryByLabelText('サービス名 *')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'この内容で追加' }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Amazon Prime',
          amount: 492,
          category: 'サブスク',
          memo: expect.stringContaining('年額プラン: 年額 5,900円（月額換算 492円）'),
        })
      )
    })
  })

  it('opens editable fields from selected preset when edit is clicked', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Amazon Prime/ }))
    await user.click(screen.getByRole('button', { name: /年額プラン/ }))
    await user.click(screen.getByRole('button', { name: '修正' }))

    expect(screen.getByText('プリセットを修正中。必要な項目だけ変更して登録できます。')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Amazon Prime')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('月額（円）*'))
    await user.type(screen.getByLabelText('月額（円）*'), '500')
    await user.click(screen.getByRole('button', { name: '追加する' }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Amazon Prime', amount: 500 })
      )
    })
  })

  it('renders with initial data for editing', () => {
    const initial = {
      id: 'sub_1',
      name: 'Spotify',
      amount: 980,
      category: 'サブスク' as const,
      nextPaymentDate: '2024-05-01',
      memo: 'ファミリープラン',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    render(<SubscriptionForm {...defaultProps} initial={initial} />)
    expect(screen.getByDisplayValue('Spotify')).toBeInTheDocument()
    expect(screen.getByDisplayValue('980')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '更新する' })).toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockClose).toHaveBeenCalled()
  })

  it('shows amount validation error when amount is 0', async () => {
    render(<SubscriptionForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /自分でカスタム/ }))
    const nameInput = screen.getByLabelText('サービス名 *')
    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.submit(screen.getByRole('button', { name: '追加する' }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByText('金額は1円以上で入力してください')).toBeInTheDocument()
    })
  })
})
