import { renderHook, act } from '@testing-library/react'
import { useDragOrder } from '@/hooks/useDragOrder'

const STORAGE_KEY = 'subscription-order'

describe('useDragOrder', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('uses the current id order when nothing is stored', () => {
    const { result } = renderHook(() => useDragOrder(['a', 'b', 'c']))

    expect(result.current.orderedIds).toEqual(['a', 'b', 'c'])
  })

  it('restores a stored order, preserving only ids that still exist', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['c', 'a', 'x']))

    const { result } = renderHook(() => useDragOrder(['a', 'b', 'c']))

    expect(result.current.orderedIds).toEqual(['c', 'a', 'b'])
  })

  it('persists a new order via setOrder', () => {
    const { result } = renderHook(() => useDragOrder(['a', 'b']))

    act(() => {
      result.current.setOrder(['b', 'a'])
    })

    expect(result.current.orderedIds).toEqual(['b', 'a'])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['b', 'a'])
  })

  it('appends newly added ids to the end of the existing order', () => {
    const { result, rerender } = renderHook(({ ids }) => useDragOrder(ids), {
      initialProps: { ids: ['a', 'b'] },
    })

    act(() => {
      result.current.setOrder(['b', 'a'])
    })
    rerender({ ids: ['a', 'b', 'c'] })

    expect(result.current.orderedIds).toEqual(['b', 'a', 'c'])
  })

  it('drops ids that no longer exist when current ids change', () => {
    const { result, rerender } = renderHook(({ ids }) => useDragOrder(ids), {
      initialProps: { ids: ['a', 'b', 'c'] },
    })

    rerender({ ids: ['a', 'c'] })

    expect(result.current.orderedIds).toEqual(['a', 'c'])
  })

  it('falls back to an empty order when stored data is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')

    const { result } = renderHook(() => useDragOrder(['a', 'b']))

    expect(result.current.orderedIds).toEqual(['a', 'b'])
  })
})
