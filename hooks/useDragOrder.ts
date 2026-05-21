'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'subscription-order'

function loadOrder(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveOrder(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage quota — silently fail
  }
}

function mergeOrder(storedIds: string[], currentIds: string[]): string[] {
  const currentSet = new Set(currentIds)
  const preserved = storedIds.filter((id) => currentSet.has(id))
  const storedSet = new Set(storedIds)
  const newItems = currentIds.filter((id) => !storedSet.has(id))
  return [...preserved, ...newItems]
}

export function useDragOrder(currentIds: string[]) {
  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    const stored = loadOrder()
    return mergeOrder(stored, currentIds)
  })

  // Re-merge when currentIds change (new additions or deletions)
  useEffect(() => {
    setOrderedIds((prev) => mergeOrder(prev, currentIds))
  }, [currentIds.join(',')])

  const setOrder = useCallback((newIds: string[]) => {
    setOrderedIds(newIds)
    saveOrder(newIds)
  }, [])

  return { orderedIds, setOrder }
}
