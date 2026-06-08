import React from 'react'
import { render } from '@testing-library/react'
import { ServiceWorkerRegister } from '@/components/Layout/ServiceWorkerRegister'

describe('ServiceWorkerRegister', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = originalEnv
    delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker
    jest.restoreAllMocks()
  })

  it('renders nothing', () => {
    const { container } = render(<ServiceWorkerRegister />)
    expect(container).toBeEmptyDOMElement()
  })

  it('registers the service worker in production when supported', () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'production'
    const register = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    })

    render(<ServiceWorkerRegister />)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('does not register in non-production environments', () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'
    const register = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    })

    render(<ServiceWorkerRegister />)

    expect(register).not.toHaveBeenCalled()
  })
})
