import { detectCategory } from '@/lib/categories'

describe('detectCategory', () => {
  it('detects Netflix as サブスク', () => {
    expect(detectCategory('Netflix')).toBe('サブスク')
  })

  it('detects Spotify as サブスク', () => {
    expect(detectCategory('Spotify')).toBe('サブスク')
  })

  it('detects Amazon Prime as サブスク', () => {
    expect(detectCategory('Amazon Prime')).toBe('サブスク')
  })

  it('detects スーパー as 食費', () => {
    expect(detectCategory('スーパーマルエツ')).toBe('食費')
  })

  it('detects セブンイレブン as 食費', () => {
    expect(detectCategory('セブンイレブン')).toBe('食費')
  })

  it('detects docomo as 通信費', () => {
    expect(detectCategory('docomo')).toBe('通信費')
  })

  it('detects Nintendo as 娯楽', () => {
    expect(detectCategory('Nintendo Switch Online')).toBe('娯楽')
  })

  it('detects JR as 交通費', () => {
    expect(detectCategory('JR東日本定期')).toBe('交通費')
  })

  it('detects ニトリ as 日用品', () => {
    expect(detectCategory('ニトリ')).toBe('日用品')
  })

  it('detects 病院 as 医療', () => {
    expect(detectCategory('山田クリニック')).toBe('医療')
  })

  it('returns その他 for unknown', () => {
    expect(detectCategory('謎の支払い先XYZ123')).toBe('その他')
  })

  it('is case-insensitive', () => {
    expect(detectCategory('NETFLIX')).toBe('サブスク')
    expect(detectCategory('spotify')).toBe('サブスク')
  })
})
