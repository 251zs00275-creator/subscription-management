import { render } from '@testing-library/react'
import { AnimeNavIcon } from '@/components/Common/AnimeNavIcon'
import type { NavIconKey } from '@/lib/navigation'

describe('AnimeNavIcon', () => {
  it('renders a decorative span with the sprite background image', () => {
    const { container } = render(<AnimeNavIcon icon="dashboard" />)
    const span = container.querySelector('span')

    expect(span).not.toBeNull()
    expect(span).toHaveAttribute('aria-hidden', 'true')
    expect(span).toHaveStyle({ backgroundImage: "url('/icons/school-anime-nav-icons.png')" })
  })

  it('merges a custom className with the base classes', () => {
    const { container } = render(<AnimeNavIcon icon="trends" className="extra-class" />)
    const span = container.querySelector('span')

    expect(span).toHaveClass('anime-nav-icon', 'block', 'shrink-0', 'extra-class')
  })

  it('positions the sprite differently for each icon key', () => {
    const icons: NavIconKey[] = ['dashboard', 'subscriptions', 'history', 'achievements']
    const positions = icons.map((icon) => {
      const { container, unmount } = render(<AnimeNavIcon icon={icon} />)
      const position = (container.querySelector('span') as HTMLElement).style.backgroundPosition
      unmount()
      return position
    })

    expect(new Set(positions).size).toBe(positions.length)
  })
})
