import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeyboardHelp } from '@/components/Common/KeyboardHelp'

const mockClose = jest.fn()

describe('KeyboardHelp', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders all shortcut keys when open', () => {
    render(<KeyboardHelp open={true} onClose={mockClose} />)
    expect(screen.getByText('キーボードショートカット')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders shortcut descriptions', () => {
    render(<KeyboardHelp open={true} onClose={mockClose} />)
    expect(screen.getByText('新しいサブスクを追加')).toBeInTheDocument()
    expect(screen.getByText('検索にフォーカス')).toBeInTheDocument()
    expect(screen.getByText('このヘルプを表示')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(<KeyboardHelp open={false} onClose={mockClose} />)
    expect(screen.queryByText('キーボードショートカット')).not.toBeInTheDocument()
  })
})
