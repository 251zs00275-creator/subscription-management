import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyLoginFlow } from '@/components/Common/DailyLoginFlow'
import { storage } from '@/lib/storage'
import { useGameStats } from '@/hooks/useGameStats'
import { CHARACTERS } from '@/lib/characters'

jest.mock('@/lib/storage', () => ({
  storage: {
    getSelectedCharacterId: jest.fn(() => 'main-heroine'),
    needsDailyCharacterSelection: jest.fn(() => false),
    needsLoginBonusClaim: jest.fn(() => false),
    markCharacterSelectedToday: jest.fn(),
    addCharacterAffection: jest.fn(),
    markLoginBonusClaimedToday: jest.fn(),
  },
}))

jest.mock('@/hooks/useGameStats', () => ({
  useGameStats: jest.fn(),
}))

const mockStorage = storage as jest.Mocked<typeof storage>
const mockUseGameStats = useGameStats as unknown as jest.Mock
const claimLoginBonus = jest.fn()

function setGameStats(monthlyVisits: string[]) {
  mockUseGameStats.mockReturnValue({
    gameStats: { monthlyVisits },
    claimLoginBonus,
  })
}

describe('DailyLoginFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorage.getSelectedCharacterId.mockReturnValue('main-heroine')
    mockStorage.needsDailyCharacterSelection.mockReturnValue(false)
    mockStorage.needsLoginBonusClaim.mockReturnValue(false)
    setGameStats(['2024-05-01'])
  })

  it('shows nothing when disabled', () => {
    mockStorage.needsDailyCharacterSelection.mockReturnValue(true)
    render(<DailyLoginFlow disabled />)

    expect(screen.queryByText('今日の案内キャラを選択')).not.toBeInTheDocument()
    expect(screen.queryByText('学園出席簿')).not.toBeInTheDocument()
  })

  it('shows nothing when neither selection nor bonus is needed', () => {
    render(<DailyLoginFlow />)

    expect(screen.queryByText('今日の案内キャラを選択')).not.toBeInTheDocument()
    expect(screen.queryByText('学園出席簿')).not.toBeInTheDocument()
  })

  it('opens the character selection dialog and lists every guide character', () => {
    mockStorage.needsDailyCharacterSelection.mockReturnValue(true)
    render(<DailyLoginFlow />)

    expect(screen.getByText('今日の案内キャラを選択')).toBeInTheDocument()
    Object.values(CHARACTERS).forEach((character) => {
      expect(screen.getByText(character.name)).toBeInTheDocument()
    })
  })

  it('selecting a character records affection and moves on to the bonus step when due', async () => {
    const user = userEvent.setup()
    mockStorage.needsDailyCharacterSelection.mockReturnValue(true)
    mockStorage.needsLoginBonusClaim.mockReturnValue(true)
    render(<DailyLoginFlow />)

    const target = CHARACTERS['advisor-danger']
    await user.click(screen.getByText(target.name))

    expect(mockStorage.markCharacterSelectedToday).toHaveBeenCalledWith('advisor-danger')
    expect(mockStorage.addCharacterAffection).toHaveBeenCalledWith('advisor-danger', 10)
    await waitFor(() => expect(screen.getByText('学園出席簿')).toBeInTheDocument())
    expect(screen.getByText(`${target.name}が今日の出席を確認しました。`)).toBeInTheDocument()
  })

  it('selecting a character closes the flow when no bonus is pending', async () => {
    const user = userEvent.setup()
    mockStorage.needsDailyCharacterSelection.mockReturnValue(true)
    mockStorage.needsLoginBonusClaim.mockReturnValue(false)
    render(<DailyLoginFlow />)

    await user.click(screen.getByText(CHARACTERS['main-heroine'].name))

    await waitFor(() => expect(screen.queryByText('今日の案内キャラを選択')).not.toBeInTheDocument())
    expect(screen.queryByText('学園出席簿')).not.toBeInTheDocument()
  })

  it('opens the bonus dialog directly and shows the base bonus when no milestone is hit', () => {
    mockStorage.needsLoginBonusClaim.mockReturnValue(true)
    setGameStats(['2024-05-01', '2024-05-02'])
    render(<DailyLoginFlow />)

    expect(screen.getByText('学園出席簿')).toBeInTheDocument()
    expect(screen.getByText('+5 XP')).toBeInTheDocument()
    expect(screen.getByText('出席ボーナス: +5 XP')).toBeInTheDocument()
    expect(screen.queryByText(/月間\d+日目ボーナス/)).not.toBeInTheDocument()
  })

  it('adds the milestone bonus on the 7th visit of the month', () => {
    mockStorage.needsLoginBonusClaim.mockReturnValue(true)
    setGameStats(Array.from({ length: 7 }, (_, i) => `2024-05-0${i + 1}`))
    render(<DailyLoginFlow />)

    expect(screen.getByText('+25 XP')).toBeInTheDocument()
    expect(screen.getByText('月間7日目ボーナス: +20 XP')).toBeInTheDocument()
  })

  it('claiming the bonus persists progress and resets the flow', async () => {
    const user = userEvent.setup()
    mockStorage.needsLoginBonusClaim.mockReturnValue(true)
    setGameStats(['2024-05-01'])
    render(<DailyLoginFlow />)

    await user.click(screen.getByRole('button', { name: /受け取る/ }))

    expect(mockStorage.markLoginBonusClaimedToday).toHaveBeenCalled()
    expect(mockStorage.addCharacterAffection).toHaveBeenCalledWith('main-heroine', 5)
    expect(claimLoginBonus).toHaveBeenCalledWith(5)
    await waitFor(() => expect(screen.queryByText('学園出席簿')).not.toBeInTheDocument())
  })
})
