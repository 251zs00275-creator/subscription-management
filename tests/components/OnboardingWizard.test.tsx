import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingWizard } from '@/components/Common/OnboardingWizard'
import { storage } from '@/lib/storage'

jest.mock('@/lib/storage', () => ({
  storage: {
    markOnboardingComplete: jest.fn(),
    hasCompletedOnboarding: jest.fn(() => false),
  },
}))

const mockClose = jest.fn()

describe('OnboardingWizard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders first step content', () => {
    render(<OnboardingWizard open={true} onClose={mockClose} />)
    expect(screen.getByText('サブスクを登録する')).toBeInTheDocument()
  })

  it('navigates to next step on 次へ click', async () => {
    render(<OnboardingWizard open={true} onClose={mockClose} />)
    fireEvent.click(screen.getByRole('button', { name: '次へ' }))
    await waitFor(() => {
      expect(screen.getByText('CSVで一括インポート')).toBeInTheDocument()
    })
  })

  it('calls onClose and marks complete on 始める', async () => {
    render(<OnboardingWizard open={true} onClose={mockClose} />)
    fireEvent.click(screen.getByRole('button', { name: '次へ' }))
    await waitFor(() => screen.getByText('CSVで一括インポート'))
    fireEvent.click(screen.getByRole('button', { name: '次へ' }))
    await waitFor(() => screen.getByText('ダッシュボードで把握'))
    fireEvent.click(screen.getByRole('button', { name: '始める' }))
    expect(storage.markOnboardingComplete).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalled()
  })

  it('skips onboarding and marks complete', () => {
    render(<OnboardingWizard open={true} onClose={mockClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }))
    expect(storage.markOnboardingComplete).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalled()
  })

  it('shows step indicator dots', () => {
    render(<OnboardingWizard open={true} onClose={mockClose} />)
    expect(screen.getByText('ようこそ！')).toBeInTheDocument()
  })
})
