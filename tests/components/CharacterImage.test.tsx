import { render, screen } from '@testing-library/react'
import { CharacterImage } from '@/components/Common/CharacterImage'

describe('CharacterImage', () => {
  it('renders a mascot image for the selected character', () => {
    render(<CharacterImage characterId="main-heroine" variant="mascot" alt="main mascot" />)

    const image = screen.getByAltText('main mascot')
    expect(image).toBeInTheDocument()
    expect(decodeURIComponent(image.getAttribute('src') ?? '')).toContain(
      '/characters/main-heroine/optimized/mascot.jpg'
    )
  })

  it('uses default alt text when alt is omitted', () => {
    render(<CharacterImage characterId="analyst-cool" variant="portrait" />)

    expect(screen.getByAltText('シオン portrait')).toBeInTheDocument()
  })

  it('can render a specific expression asset', () => {
    render(
      <CharacterImage
        characterId="reminder-jirai"
        variant="portrait"
        expression="happy"
        alt="happy reminder"
      />
    )

    expect(decodeURIComponent(screen.getByAltText('happy reminder').getAttribute('src') ?? '')).toContain(
      '/characters/reminder-jirai/expressions/happy.jpg'
    )
  })
})
