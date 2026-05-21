jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(),
}))

describe('performOCR', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns success result when OCR finds date and amount', async () => {
    const { createWorker } = await import('tesseract.js')
    const mockWorker = {
      recognize: jest.fn().mockResolvedValue({
        data: {
          text: 'スーパーマルエツ\n2024年4月15日\n合計 ¥3,240',
          confidence: 85,
        },
      }),
      terminate: jest.fn().mockResolvedValue(undefined),
    }
    ;(createWorker as jest.Mock).mockResolvedValue(mockWorker)

    const mockFile = new File([''], 'receipt.jpg', { type: 'image/jpeg' })
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()

    const { performOCR } = await import('@/lib/ocr')
    const result = await performOCR(mockFile)

    expect(result.success).toBe(true)
    expect(result.date).toBe('2024-04-15')
    expect(result.amount).toBe(3240)
    expect(result.storeName).toBe('スーパーマルエツ')
    expect(mockWorker.terminate).toHaveBeenCalled()
  })

  it('returns failure when tesseract throws', async () => {
    const { createWorker } = await import('tesseract.js')
    ;(createWorker as jest.Mock).mockRejectedValue(new Error('Tesseract failed'))

    const mockFile = new File([''], 'receipt.jpg', { type: 'image/jpeg' })
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')

    const { performOCR } = await import('@/lib/ocr')
    const result = await performOCR(mockFile)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Tesseract failed')
  })

  it('returns failure when confidence is low', async () => {
    const { createWorker } = await import('tesseract.js')
    const mockWorker = {
      recognize: jest.fn().mockResolvedValue({
        data: { text: 'ノイズ', confidence: 10 },
      }),
      terminate: jest.fn().mockResolvedValue(undefined),
    }
    ;(createWorker as jest.Mock).mockResolvedValue(mockWorker)

    const mockFile = new File([''], 'receipt.jpg', { type: 'image/jpeg' })
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()

    const { performOCR } = await import('@/lib/ocr')
    const result = await performOCR(mockFile)

    expect(result.success).toBe(false)
  })
})
