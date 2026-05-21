import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CharacterSelector } from '@/components/Common/CharacterSelector'
import { storage } from '@/lib/storage'

jest.mock('@/lib/storage', () => ({
  storage: {
    getSelectedCharacterId: jest.fn(() => 'main-heroine'),
    saveSelectedCharacterId: jest.fn(),
    addCharacterAffection: jest.fn(),
  },
}))

describe('CharacterSelector', () => {
  it('loads saved character and saves changes', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<CharacterSelector onChange={onChange} />)

    expect(onChange).toHaveBeenCalledWith('main-heroine')
    await user.click(screen.getByRole('button', { name: 'レイナを案内キャラにする' }))

    expect(storage.saveSelectedCharacterId).toHaveBeenCalledWith('advisor-danger')
    expect(storage.addCharacterAffection).toHaveBeenCalledWith('advisor-danger', 10)
    expect(onChange).toHaveBeenCalledWith('advisor-danger')
  })
})
