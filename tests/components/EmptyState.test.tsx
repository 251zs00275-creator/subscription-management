import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '@/components/Common/EmptyState'
import { CreditCard } from 'lucide-react'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={CreditCard}
        title="データがありません"
        description="最初のアイテムを追加してください"
      />
    )
    expect(screen.getByText('データがありません')).toBeInTheDocument()
    expect(screen.getByText('最初のアイテムを追加してください')).toBeInTheDocument()
  })

  it('renders action button when actionLabel and onAction provided', () => {
    const onAction = jest.fn()
    render(
      <EmptyState
        icon={CreditCard}
        title="空"
        description="説明"
        actionLabel="追加する"
        onAction={onAction}
      />
    )
    const button = screen.getByRole('button', { name: '追加する' })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onAction).toHaveBeenCalled()
  })

  it('does not render button when actionLabel is not provided', () => {
    render(
      <EmptyState icon={CreditCard} title="空" description="説明" />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
