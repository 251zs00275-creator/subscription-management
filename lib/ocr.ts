import type { OcrResult } from '@/types'

function extractDate(text: string): string {
  const patterns = [
    /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/,
    /(\d{2})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /令和\s*(\d+)年\s*(\d{1,2})月\s*(\d{1,2})日/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      if (pattern.source.includes('令和')) {
        const reiwaYear = parseInt(match[1], 10)
        const year = 2018 + reiwaYear
        const month = match[2].padStart(2, '0')
        const day = match[3].padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      const year = match[1].length === 2 ? `20${match[1]}` : match[1]
      const month = match[2].padStart(2, '0')
      const day = match[3].padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  return ''
}

function extractAmount(text: string): number {
  const patterns = [
    /合計[^\d]*([0-9,，]+)/,
    /お会計[^\d]*([0-9,，]+)/,
    /total[^\d]*([0-9,，]+)/i,
    /amount[^\d]*([0-9,，]+)/i,
    /¥\s*([0-9,，]+)/,
    /￥\s*([0-9,，]+)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const cleaned = match[1].replace(/[,，]/g, '')
      const value = parseInt(cleaned, 10)
      if (!isNaN(value) && value > 0) return value
    }
  }

  const allAmounts = [...text.matchAll(/[¥￥]\s*([1-9][0-9,，]{2,})/g)]
    .map((m) => parseInt(m[1].replace(/[,，]/g, ''), 10))
    .filter((n) => !isNaN(n) && n > 100 && !(n >= 1900 && n <= 2100))
    .sort((a, b) => b - a)

  return allAmounts[0] ?? 0
}

function extractStoreName(text: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  for (const line of lines.slice(0, 5)) {
    if (
      line.length >= 2 &&
      line.length <= 30 &&
      !/^\d/.test(line) &&
      !/[¥￥]/.test(line) &&
      !/^\d{4}[\/\-年]/.test(line)
    ) {
      return line
    }
  }
  return ''
}

export async function performOCR(file: File): Promise<OcrResult> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('jpn+eng')

    const imageUrl = URL.createObjectURL(file)
    const { data } = await worker.recognize(imageUrl)
    await worker.terminate()
    URL.revokeObjectURL(imageUrl)

    const text = data.text
    const confidence = data.confidence

    const date = extractDate(text)
    const amount = extractAmount(text)
    const storeName = extractStoreName(text)

    return {
      date,
      storeName,
      amount,
      confidence,
      success: (date !== '' || amount > 0) && confidence > 30,
    }
  } catch (err) {
    return {
      date: '',
      storeName: '',
      amount: 0,
      confidence: 0,
      success: false,
      error: err instanceof Error ? err.message : 'OCR処理に失敗しました',
    }
  }
}

export { extractDate, extractAmount, extractStoreName }
