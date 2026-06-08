import { render, screen } from '@testing-library/react'
import { SortableSubscriptionCard } from '@/components/Common/SortableSubscriptionCard'
import type { Subscription } from '@/types'

const mockUseSortable = jest.fn()

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: (...args: unknown[]) => mockUseSortable(...args),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: jest.fn(() => 'translate3d(0px, 0px, 0)') } },
}))

const mockSub: Subscription = {
  id: 'sub_1',
  name: 'Netflix',
  amount: 1490,
  category: 'サブスク',
  nextPaymentDate: '2024-05-01',
  memo: '',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggle: jest.fn(),
}

describe('SortableSubscriptionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSortable.mockReturnValue({
      attributes: { role: 'button' },
      listeners: { onPointerDown: jest.fn() },
      setNodeRef: jest.fn(),
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      transition: 'transform 150ms ease',
      isDragging: false,
    })
  })

  it('registers the subscription id with useSortable and renders the card', () => {
    render(<SortableSubscriptionCard subscription={mockSub} {...mockHandlers} />)

    expect(mockUseSortable).toHaveBeenCalledWith({ id: 'sub_1' })
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('raises the z-index while dragging', () => {
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: true,
    })

    const { container } = render(<SortableSubscriptionCard subscription={mockSub} {...mockHandlers} />)
    const wrapper = container.firstElementChild as HTMLElement

    expect(wrapper).toHaveStyle({ zIndex: '50' })
  })

  it('keeps the default z-index when not dragging', () => {
    const { container } = render(<SortableSubscriptionCard subscription={mockSub} {...mockHandlers} />)
    const wrapper = container.firstElementChild as HTMLElement

    expect(wrapper.style.zIndex).toBe('')
  })
})
