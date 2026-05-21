import { extractDate, extractAmount, extractStoreName } from '@/lib/ocr'

describe('extractDate', () => {
  it('extracts YYYY/MM/DD format', () => {
    expect(extractDate('2024/04/15 お買い上げありがとう')).toBe('2024-04-15')
  })

  it('extracts YYYY年MM月DD日 format', () => {
    expect(extractDate('2024年4月15日')).toBe('2024-04-15')
  })

  it('extracts YYYY-MM-DD format', () => {
    expect(extractDate('2024-04-15')).toBe('2024-04-15')
  })

  it('extracts 令和 format', () => {
    expect(extractDate('令和6年4月15日')).toBe('2024-04-15')
  })

  it('pads single digit month/day', () => {
    expect(extractDate('2024/4/5')).toBe('2024-04-05')
  })

  it('returns empty string for no date', () => {
    expect(extractDate('金額: ¥1,490 合計')).toBe('')
  })
})

describe('extractAmount', () => {
  it('extracts 合計 pattern', () => {
    expect(extractAmount('合計 ¥1,490')).toBe(1490)
  })

  it('extracts お会計 pattern', () => {
    expect(extractAmount('お会計 2000円')).toBe(2000)
  })

  it('extracts ¥ prefix', () => {
    expect(extractAmount('¥ 3,240')).toBe(3240)
  })

  it('handles amounts with commas', () => {
    expect(extractAmount('合計 12,345')).toBe(12345)
  })

  it('returns 0 for no amount', () => {
    expect(extractAmount('スーパーマーケット 2024年4月')).toBe(0)
  })

  it('prefers largest total-labeled amount', () => {
    const text = '小計 1000\n税 100\n合計 1100'
    expect(extractAmount(text)).toBe(1100)
  })
})

describe('extractStoreName', () => {
  it('extracts store name from first line', () => {
    const text = 'スーパーマルエツ\n2024/04/15\n合計 ¥3,240'
    expect(extractStoreName(text)).toBe('スーパーマルエツ')
  })

  it('skips lines starting with digits', () => {
    const text = '123456\nマクドナルド\n2024/04/15'
    expect(extractStoreName(text)).toBe('マクドナルド')
  })

  it('returns empty string if no suitable line', () => {
    const text = '¥1,490\n2024/04/15\n12345'
    expect(extractStoreName(text)).toBe('')
  })
})
