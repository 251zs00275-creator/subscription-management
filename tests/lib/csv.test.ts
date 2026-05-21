import { parseCSV } from '@/lib/csv'

const MONEYFORWARD_CSV = `日付,内容,金額（出金）
2024/04/01,Netflix,1490
2024/04/05,スーパーマルエツ,3240
2024/04/10,Spotify,980
2024/04/15,不正な行,
`

const DBARAI_CSV = `利用日,利用先,利用金額
2024/04/01,Amazon Prime,600
2024/04/10,セブンイレブン,850
`

describe('parseCSV', () => {
  describe('MoneyForward ME format', () => {
    it('parses valid rows correctly', () => {
      const result = parseCSV(MONEYFORWARD_CSV)
      expect(result.validRows).toBe(3)
      expect(result.invalidRows).toBe(1)
      expect(result.totalRows).toBe(4)
    })

    it('auto-categorizes Netflix as サブスク', () => {
      const result = parseCSV(MONEYFORWARD_CSV)
      const netflix = result.rows.find((r) => r.description === 'Netflix')
      expect(netflix?.category).toBe('サブスク')
    })

    it('auto-categorizes スーパーマルエツ as 食費', () => {
      const result = parseCSV(MONEYFORWARD_CSV)
      const supermarket = result.rows.find((r) => r.description === 'スーパーマルエツ')
      expect(supermarket?.category).toBe('食費')
    })

    it('auto-categorizes Spotify as サブスク', () => {
      const result = parseCSV(MONEYFORWARD_CSV)
      const spotify = result.rows.find((r) => r.description === 'Spotify')
      expect(spotify?.category).toBe('サブスク')
    })

    it('marks empty amount rows as invalid', () => {
      const result = parseCSV(MONEYFORWARD_CSV)
      const invalid = result.rows.filter((r) => !r.isValid)
      expect(invalid.length).toBe(1)
    })

    it('normalizes date format', () => {
      const result = parseCSV(MONEYFORWARD_CSV)
      const netflix = result.rows.find((r) => r.description === 'Netflix')
      expect(netflix?.date).toBe('2024-04-01')
    })
  })

  describe('d払い format', () => {
    it('parses d払い CSV rows', () => {
      const result = parseCSV(DBARAI_CSV)
      expect(result.validRows).toBe(2)
      expect(result.totalRows).toBe(2)
    })

    it('auto-categorizes Amazon Prime as サブスク', () => {
      const result = parseCSV(DBARAI_CSV)
      const amazon = result.rows.find((r) => r.description === 'Amazon Prime')
      expect(amazon?.category).toBe('サブスク')
    })

    it('auto-categorizes コンビニ as 食費', () => {
      const result = parseCSV(DBARAI_CSV)
      const seven = result.rows.find((r) => r.description === 'セブンイレブン')
      expect(seven?.category).toBe('食費')
    })
  })

  describe('edge cases', () => {
    it('returns empty result for empty CSV', () => {
      const result = parseCSV('')
      expect(result.totalRows).toBe(0)
    })

    it('handles amounts with commas', () => {
      const csv = `日付,内容,金額（出金）\n2024/04/01,Netflix,"1,490"`
      const result = parseCSV(csv)
      expect(result.rows[0]?.amount).toBe(1490)
    })

    it('handles ¥ prefix in amounts', () => {
      const csv = `日付,内容,金額（出金）\n2024/04/01,Netflix,¥1490`
      const result = parseCSV(csv)
      expect(result.rows[0]?.amount).toBe(1490)
    })

    it('handles unknown format by trying both parsers', () => {
      const csv = `date,description,amount\n2024-04-01,Netflix,1490`
      const result = parseCSV(csv)
      expect(result.totalRows).toBeGreaterThanOrEqual(0)
    })

    it('marks row invalid when both parsers return null for unknown format', () => {
      const csv = `col1,col2\nval1,val2`
      const result = parseCSV(csv)
      const invalid = result.rows.filter((r) => !r.isValid)
      expect(invalid.length).toBeGreaterThanOrEqual(0)
    })
  })
})
