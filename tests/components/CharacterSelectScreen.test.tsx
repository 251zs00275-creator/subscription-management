import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CharacterSelectScreen } from '@/components/Layout/CharacterSelectScreen'
import { CHARACTERS } from '@/lib/characters'
import { storage } from '@/lib/storage'

jest.mock('@/lib/storage', () => ({
  storage: {
    markCharacterSelectedToday: jest.fn(),
    addCharacterAffection: jest.fn(),
  },
}))

const mockStorage = storage as jest.Mocked<typeof storage>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CharacterSelectScreen', () => {
  it('見出しと全キャラクターのカードを表示する', () => {
    render(<CharacterSelectScreen onSelect={jest.fn()} />)

    expect(screen.getByText('案内キャラクターを選択してください')).toBeInTheDocument()
    for (const character of Object.values(CHARACTERS)) {
      expect(screen.getByText(character.name)).toBeInTheDocument()
    }
  })

  it('カードをクリックすると onSelect が選択したキャラクターIDで呼ばれる', async () => {
    const onSelect = jest.fn()
    const user = userEvent.setup()

    render(<CharacterSelectScreen onSelect={onSelect} />)

    await user.click(screen.getByText(CHARACTERS['analyst-cool'].name))

    expect(onSelect).toHaveBeenCalledWith('analyst-cool')
  })

  it('カードをクリックすると好感度とキャラ選択状態が更新される', async () => {
    const user = userEvent.setup()

    render(<CharacterSelectScreen onSelect={jest.fn()} />)

    await user.click(screen.getByText(CHARACTERS['reminder-jirai'].name))

    expect(mockStorage.markCharacterSelectedToday).toHaveBeenCalledWith('reminder-jirai')
    expect(mockStorage.addCharacterAffection).toHaveBeenCalledWith('reminder-jirai', 10)
  })
})
