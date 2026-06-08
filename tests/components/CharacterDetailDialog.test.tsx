import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CharacterDetailDialog } from '@/components/Common/CharacterDetailDialog'
import { CHARACTERS } from '@/lib/characters'
import { storage } from '@/lib/storage'
import type { CharacterAffection } from '@/types'

jest.mock('@/lib/storage', () => ({
  storage: {
    getCharacterAffection: jest.fn(),
  },
}))

const mockGetCharacterAffection = storage.getCharacterAffection as jest.MockedFunction<
  typeof storage.getCharacterAffection
>

function affectionFor(level: number, unlockedGalleryIds: string[] = []): Record<string, CharacterAffection> {
  const points = level * 10
  return Object.fromEntries(
    Object.keys(CHARACTERS).map((id) => [id, { level, points, unlockedGalleryIds }])
  ) as Record<string, CharacterAffection>
}

describe('CharacterDetailDialog', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCharacterAffection.mockReturnValue(affectionFor(1))
  })

  it('renders nothing when no character is selected', () => {
    const { container } = render(<CharacterDetailDialog characterId={null} open={false} onClose={onClose} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the selected character profile and affection level', () => {
    mockGetCharacterAffection.mockReturnValue(affectionFor(3))
    render(<CharacterDetailDialog characterId="main-heroine" open onClose={onClose} />)

    const character = CHARACTERS['main-heroine']
    expect(screen.getAllByText(character.name).length).toBeGreaterThan(0)
    expect(screen.getByText(character.personality)).toBeInTheDocument()
    expect(screen.getByText(`好感度レベル ${3}`)).toBeInTheDocument()
    expect(screen.getByText('30 pt')).toBeInTheDocument()
  })

  it('renders feature labels and the assignment description', () => {
    render(<CharacterDetailDialog characterId="main-heroine" open onClose={onClose} />)
    const character = CHARACTERS['main-heroine']

    expect(screen.getByText(character.assignment)).toBeInTheDocument()
    expect(screen.getByText('担当機能')).toBeInTheDocument()
    expect(screen.getByText('案内スタイル')).toBeInTheDocument()
  })

  it('shows locked gallery items with the required level and hides unlocked ones', () => {
    mockGetCharacterAffection.mockReturnValue(affectionFor(1, []))
    render(<CharacterDetailDialog characterId="main-heroine" open onClose={onClose} />)

    const character = CHARACTERS['main-heroine']
    const [firstItem] = character.gallery
    expect(screen.getByText(`好感度 Lv.${firstItem.requiredLevel} で解放`)).toBeInTheDocument()
    expect(screen.getByText(`0/${character.gallery.length}`)).toBeInTheDocument()
  })

  it('reveals gallery items once they are unlocked for the character', () => {
    const character = CHARACTERS['main-heroine']
    const [firstItem] = character.gallery
    mockGetCharacterAffection.mockReturnValue(affectionFor(firstItem.requiredLevel, [firstItem.id]))

    render(<CharacterDetailDialog characterId="main-heroine" open onClose={onClose} />)

    expect(screen.queryByText(`好感度 Lv.${firstItem.requiredLevel} で解放`)).not.toBeInTheDocument()
    expect(screen.getByText(`1/${character.gallery.length}`)).toBeInTheDocument()
  })

  it('calls onClose when the dialog is dismissed', async () => {
    const user = userEvent.setup()
    render(<CharacterDetailDialog characterId="main-heroine" open onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
