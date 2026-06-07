import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PresetPicker } from '@/components/Forms/PresetPicker'
import type { PresetSelection } from '@/components/Forms/PresetPicker'

const mockEditingChange = jest.fn()
const mockSelectionChange = jest.fn<void, [PresetSelection | null]>()

const defaultProps = {
  nextPaymentDate: '2026-07-01',
  isSubmitting: false,
  onEditingChange: mockEditingChange,
  onSelectionChange: mockSelectionChange,
}

describe('PresetPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders preset service cards', () => {
    render(<PresetPicker {...defaultProps} />)
    expect(screen.getByText('Amazon Prime')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Spotify Premium')).toBeInTheDocument()
  })

  it('filters cards by group', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '音楽・音声' }))

    expect(screen.getByText('Spotify Premium')).toBeInTheDocument()
    expect(screen.getByText('Apple Music')).toBeInTheDocument()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
  })

  it('filters cards by text search', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.type(screen.getByLabelText('サービスを検索'), 'spotify')

    expect(screen.getByText('Spotify Premium')).toBeInTheDocument()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
  })

  it('shows a message when no preset matches the filter', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.type(screen.getByLabelText('サービスを検索'), 'no-such-service-xyz')

    expect(
      screen.getByText('条件に一致するプリセットがありません。検索語句かカテゴリーを変更してください。')
    ).toBeInTheDocument()
  })

  it('selecting a service reveals its plans and clears any prior plan selection', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Amazon Prime/ }))

    expect(screen.getByRole('button', { name: /年額プラン/ })).toBeInTheDocument()
    expect(mockSelectionChange).toHaveBeenLastCalledWith(null)
  })

  it('choosing a plan reports the selection and shows the summary card', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Amazon Prime/ }))
    await user.click(screen.getByRole('button', { name: /年額プラン/ }))

    expect(screen.getByText('選択中のプリセット')).toBeInTheDocument()
    expect(screen.getByText('Amazon Prime / 年額プラン')).toBeInTheDocument()
    expect(screen.getByText('次回支払日: 2026-07-01')).toBeInTheDocument()
    expect(mockSelectionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        preset: expect.objectContaining({ serviceName: 'Amazon Prime' }),
        plan: expect.objectContaining({ name: '年額プラン' }),
      })
    )
    expect(mockEditingChange).toHaveBeenLastCalledWith(false)
  })

  it('clicking 修正 requests editing mode without clearing the selection', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Amazon Prime/ }))
    await user.click(screen.getByRole('button', { name: /年額プラン/ }))
    mockEditingChange.mockClear()
    mockSelectionChange.mockClear()

    await user.click(screen.getByRole('button', { name: '修正' }))

    expect(mockEditingChange).toHaveBeenCalledWith(true)
    expect(mockSelectionChange).not.toHaveBeenCalled()
    expect(screen.getByText('選択中のプリセット')).toBeInTheDocument()
  })

  it('changing the group filter clears a previously chosen plan selection', async () => {
    const user = userEvent.setup()
    render(<PresetPicker {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Amazon Prime/ }))
    await user.click(screen.getByRole('button', { name: /年額プラン/ }))
    mockSelectionChange.mockClear()

    await user.click(screen.getByRole('button', { name: '音楽・音声' }))

    expect(mockSelectionChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByText('選択中のプリセット')).not.toBeInTheDocument()
  })
})
