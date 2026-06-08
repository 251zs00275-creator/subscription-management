import { render, screen } from '@testing-library/react'
import { DragHandle } from '@/components/Common/DragHandle'

describe('DragHandle', () => {
  it('renders a labeled drag button', () => {
    render(<DragHandle />)
    expect(screen.getByRole('button', { name: 'ドラッグして並び替え' })).toBeInTheDocument()
  })

  it('spreads sortable listener/attribute props onto the button', () => {
    const onPointerDown = jest.fn()
    render(<DragHandle sortableProps={{ onPointerDown, 'aria-roledescription': 'sortable' }} />)

    const button = screen.getByRole('button', { name: 'ドラッグして並び替え' })
    expect(button).toHaveAttribute('aria-roledescription', 'sortable')

    button.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(onPointerDown).toHaveBeenCalled()
  })
})
