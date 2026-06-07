import { downloadTextFile, exportToCSV } from '@/lib/export'
import type { Subscription } from '@/types'

const subscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 1490,
    category: 'サブスク',
    nextPaymentDate: '2024-05-01',
    memo: '広告なしプラン',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: '"特別" カフェ',
    amount: 980,
    category: '食費',
    nextPaymentDate: '2024-05-03',
    memo: '月1回, 自分への, ご褒美',
    isActive: false,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe('export', () => {
  let createObjectURL: jest.Mock
  let revokeObjectURL: jest.Mock
  let clickSpy: jest.SpyInstance

  beforeEach(() => {
    createObjectURL = jest.fn(() => 'blob:mock-url')
    revokeObjectURL = jest.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    clickSpy.mockRestore()
    jest.restoreAllMocks()
  })

  describe('downloadTextFile', () => {
    it('creates an object URL, triggers a download via an anchor, and revokes the URL', () => {
      downloadTextFile('hello,world', 'data.csv', 'text/csv')

      expect(createObjectURL).toHaveBeenCalledTimes(1)
      const blob = createObjectURL.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/csv')
      expect(clickSpy).toHaveBeenCalledTimes(1)
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('exportToCSV', () => {
    it('builds a BOM-prefixed CSV with escaped values and triggers a download', async () => {
      let capturedBlob: Blob | undefined
      URL.createObjectURL = jest.fn((blob: Blob) => {
        capturedBlob = blob
        return 'blob:mock-url'
      })

      exportToCSV(subscriptions)

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(clickSpy).toHaveBeenCalledTimes(1)
      const link = clickSpy.mock.instances[0] as HTMLAnchorElement
      expect(link.download).toMatch(/^subscriptions_\d{4}-\d{2}-\d{2}\.csv$/)

      expect(capturedBlob!.size).toBeGreaterThan(0)
      const contents = await readBlobAsText(capturedBlob!)
      expect(contents).toContain('"""特別"" カフェ"')
      expect(contents).toContain('Netflix')
      expect(contents.split('\n')).toHaveLength(3)
    })
  })
})
