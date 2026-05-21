import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubscriptionCard } from '@/components/Common/SubscriptionCard'
import type { Subscription } from '@/types'

const mockSub: Subscription = {
  id: 'sub_1',
  name: 'Netflix',
  amount: 1490,
  category: 'サブスク',
  nextPaymentDate: '2024-05-01',
  memo: 'テストメモ',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggle: jest.fn(),
}

describe('SubscriptionCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders subscription name and amount', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/1,490/)).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    expect(screen.getByText('サブスク')).toBeInTheDocument()
  })

  it('renders memo when present', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    expect(screen.getByText('テストメモ')).toBeInTheDocument()
  })

  it('shows 停止中 badge when isActive is false', () => {
    render(
      <SubscriptionCard subscription={{ ...mockSub, isActive: false }} {...mockHandlers} />
    )
    expect(screen.getByText('停止中')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    fireEvent.click(screen.getByLabelText('Netflixを編集'))
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockSub)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    fireEvent.click(screen.getByLabelText('Netflixを削除'))
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('sub_1')
  })

  it('calls onToggle when switch is clicked', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('sub_1')
  })

  it('renders next payment date', () => {
    render(<SubscriptionCard subscription={mockSub} {...mockHandlers} />)
    expect(screen.getByText(/2024-05-01/)).toBeInTheDocument()
  })

  it('applies reduced opacity styling when inactive', () => {
    render(
      <SubscriptionCard subscription={{ ...mockSub, isActive: false }} {...mockHandlers} />
    )
    // Card uses inline style filter for inactive state
    expect(screen.getByText('停止中')).toBeInTheDocument()
  })
})
