import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function fireKeyDown(key: string, target: EventTarget = document.body) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  Object.defineProperty(event, 'target', { value: target })
  window.dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  it('calls handler when key is pressed on non-input element', () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcuts({ n: handler }))
    fireKeyDown('n')
    expect(handler).toHaveBeenCalled()
  })

  it('does not call handler when key is pressed inside input', () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcuts({ n: handler }))

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', { key: 'n', bubbles: true })
    Object.defineProperty(event, 'target', { value: input })
    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('does not call handler for unregistered key', () => {
    const handler = jest.fn()
    renderHook(() => useKeyboardShortcuts({ n: handler }))
    fireKeyDown('x')
    expect(handler).not.toHaveBeenCalled()
  })

  it('removes event listener on unmount', () => {
    const handler = jest.fn()
    const { unmount } = renderHook(() => useKeyboardShortcuts({ n: handler }))
    unmount()
    fireKeyDown('n')
    expect(handler).not.toHaveBeenCalled()
  })
})
