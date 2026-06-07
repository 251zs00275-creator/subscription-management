import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReceiptUpload } from '@/components/Forms/ReceiptUpload'
import { performOCR } from '@/lib/ocr'

jest.mock('@/lib/ocr', () => ({
  performOCR: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))

beforeAll(() => {
  // Radix Select relies on pointer-capture / scroll APIs that jsdom does not implement.
  window.HTMLElement.prototype.hasPointerCapture = jest.fn()
  window.HTMLElement.prototype.releasePointerCapture = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

const mockPerformOCR = performOCR as jest.MockedFunction<typeof performOCR>
const mockSubmit = jest.fn().mockResolvedValue(undefined)

function buildFile() {
  return new File(['dummy'], 'receipt.png', { type: 'image/png' })
}

describe('ReceiptUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubmit.mockResolvedValue(undefined)
    URL.createObjectURL = jest.fn(() => 'blob:preview-url')
  })

  it('renders the upload prompt initially', () => {
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    expect(screen.getByText('画像をアップロード')).toBeInTheDocument()
    expect(screen.queryByText('読み取り結果を確認')).not.toBeInTheDocument()
  })

  it('shows OCR results in the form when recognition succeeds', async () => {
    mockPerformOCR.mockResolvedValue({
      success: true,
      date: '2024-04-01',
      storeName: 'コンビニABC',
      amount: 980,
      confidence: 80,
    })
    const user = userEvent.setup()
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildFile())

    await waitFor(() => {
      expect(screen.getByText('読み取り結果を確認')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('店舗名')).toHaveValue('コンビニABC')
    expect(screen.getByLabelText('金額（円）')).toHaveValue(980)
  })

  it('shows a manual-entry message and prefills nothing when OCR fails', async () => {
    mockPerformOCR.mockResolvedValue({
      success: false,
      date: '',
      storeName: '',
      amount: 0,
      confidence: 0,
      error: '文字を認識できませんでした',
    })
    const user = userEvent.setup()
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildFile())

    await waitFor(() => {
      expect(screen.getByText('文字を認識できませんでした')).toBeInTheDocument()
    })
    expect(screen.getByText('手動で入力してください')).toBeInTheDocument()
    expect(screen.getByLabelText('店舗名')).toHaveValue('')
  })

  it('shows a manual-entry message when OCR throws', async () => {
    mockPerformOCR.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildFile())

    await waitFor(() => {
      expect(screen.getByText('OCR処理中にエラーが発生しました。手動で入力してください。')).toBeInTheDocument()
    })
    expect(screen.getByText('手動で入力してください')).toBeInTheDocument()
  })

  it('rejects non-image files without invoking OCR', async () => {
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const textFile = new File(['hello'], 'note.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [textFile] } })

    expect(await screen.findByText('画像ファイル（JPEG/PNG）を選択してください')).toBeInTheDocument()
    expect(mockPerformOCR).not.toHaveBeenCalled()
  })

  it('processes a dropped image file via the dropzone', async () => {
    mockPerformOCR.mockResolvedValue({
      success: true,
      date: '2024-04-02',
      storeName: 'ドロップ書店',
      amount: 1200,
      confidence: 70,
    })
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const dropzone = screen.getByText('画像をアップロード').closest('div') as HTMLElement
    fireEvent.dragOver(dropzone)
    fireEvent.drop(dropzone, { dataTransfer: { files: [buildFile()] } })

    await waitFor(() => {
      expect(mockPerformOCR).toHaveBeenCalled()
    })
    expect(await screen.findByDisplayValue('ドロップ書店')).toBeInTheDocument()
  })

  it('lets the user adjust date, amount and category before submitting', async () => {
    mockPerformOCR.mockResolvedValue({
      success: true,
      date: '2024-04-01',
      storeName: 'コンビニABC',
      amount: 980,
      confidence: 80,
    })
    const user = userEvent.setup()
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildFile())
    await waitFor(() => {
      expect(screen.getByText('読み取り結果を確認')).toBeInTheDocument()
    })

    const dateInput = screen.getByLabelText('日付')
    fireEvent.change(dateInput, { target: { value: '2024-05-10' } })
    expect(dateInput).toHaveValue('2024-05-10')

    const amountInput = screen.getByLabelText('金額（円）')
    await user.clear(amountInput)
    await user.type(amountInput, '2500')
    expect(amountInput).toHaveValue(2500)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: '食費' }))

    await user.click(screen.getByRole('button', { name: 'サブスクとして登録する' }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2024-05-10', amount: 2500, category: '食費' })
      )
    })
  })

  it('lets the user edit fields and submits the form data', async () => {
    mockPerformOCR.mockResolvedValue({
      success: true,
      date: '2024-04-01',
      storeName: 'コンビニABC',
      amount: 980,
      confidence: 80,
    })
    const user = userEvent.setup()
    render(<ReceiptUpload onSubmit={mockSubmit} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildFile())
    await waitFor(() => {
      expect(screen.getByText('読み取り結果を確認')).toBeInTheDocument()
    })

    const storeInput = screen.getByLabelText('店舗名')
    await user.clear(storeInput)
    await user.type(storeInput, 'スーパーXYZ')
    await user.click(screen.getByRole('button', { name: 'サブスクとして登録する' }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ storeName: 'スーパーXYZ', amount: 980 })
      )
    })
  })
})
