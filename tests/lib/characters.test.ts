import { CHARACTERS, getCharacter } from '@/lib/characters'

describe('characters', () => {
  it('defines app-ready assets for every character', () => {
    for (const character of Object.values(CHARACTERS)) {
      expect(character.name).toBeTruthy()
      expect(character.portrait).toMatch(/^\/characters\/.+\/optimized\/portrait\.jpg$/)
      expect(character.mascot).toMatch(/^\/characters\/.+\/optimized\/mascot\.jpg$/)
      expect(character.expressions.normal).toMatch(/^\/characters\/.+\/expressions\/normal\.jpg$/)
      expect(character.expressions.happy).toMatch(/^\/characters\/.+\/expressions\/happy\.jpg$/)
      expect(character.expressions.worried).toMatch(/^\/characters\/.+\/expressions\/worried\.jpg$/)
      expect(character.expressions.alert).toMatch(/^\/characters\/.+\/expressions\/alert\.jpg$/)
      expect(character.accent).toMatch(/^#/)
    }
  })

  it('returns character by id', () => {
    expect(getCharacter('reminder-jirai').role).toBe('reminder')
  })
})
