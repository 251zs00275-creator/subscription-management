import { render, screen } from '@testing-library/react'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'

describe('VisualNovelPanel', () => {
  it('renders character name, title, and message', () => {
    render(
      <VisualNovelPanel
        characterId="advisor-danger"
        message="固定費を静かに見直しましょう。"
      />
    )

    expect(screen.getByText('レイナ')).toBeInTheDocument()
    expect(screen.getByText('月次レビュー担当')).toBeInTheDocument()
    expect(screen.getByText('固定費を静かに見直しましょう。')).toBeInTheDocument()
  })
})
