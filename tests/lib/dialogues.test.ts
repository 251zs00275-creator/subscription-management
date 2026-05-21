import { getAchievementDialogue, MASCOT_DIALOGUES, STATE_LABELS } from '@/lib/dialogues'

describe('dialogues', () => {
  it('defines mascot dialogue for every state', () => {
    for (const state of ['neutral', 'happy', 'worried', 'alert'] as const) {
      expect(MASCOT_DIALOGUES[state].length).toBeGreaterThan(0)
      expect(STATE_LABELS[state]).toBeTruthy()
    }
  })

  it('returns achievement-specific dialogue', () => {
    expect(getAchievementDialogue('first_delete', '削除')).toContain('不要な支払い')
  })

  it('returns calendar milestone dialogue', () => {
    expect(getAchievementDialogue('calendar_7', '7日ログインボーナス！')).toContain('続いてる')
  })

  it('falls back for unknown achievement ids', () => {
    expect(getAchievementDialogue('unknown', '謎の実績')).toContain('謎の実績')
  })
})
