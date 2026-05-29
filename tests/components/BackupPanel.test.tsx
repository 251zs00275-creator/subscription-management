import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BackupPanel } from '@/components/Common/BackupPanel'
import { downloadCurrentBackup, importBackup } from '@/lib/backup'

jest.mock('@/lib/backup', () => ({
  downloadCurrentBackup: jest.fn(),
  importBackup: jest.fn(),
}))

const downloadMock = downloadCurrentBackup as jest.MockedFunction<typeof downloadCurrentBackup>
const importMock = importBackup as jest.MockedFunction<typeof importBackup>

describe('BackupPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exports JSON and reports completion', async () => {
    const onExported = jest.fn()
    downloadMock.mockResolvedValue({} as Awaited<ReturnType<typeof downloadCurrentBackup>>)

    render(<BackupPanel onExported={onExported} />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))

    expect(await screen.findByRole('status')).toHaveTextContent('Backup JSON exported.')
    expect(downloadMock).toHaveBeenCalled()
    expect(onExported).toHaveBeenCalled()
  })

  it('imports a selected backup and passes the restore result upward', async () => {
    const onImported = jest.fn()
    importMock.mockResolvedValue({
      subscriptionCount: 2,
      restoredSettings: true,
      restoredGameStats: false,
    })

    render(<BackupPanel onImported={onImported} />)
    const input = screen.getByLabelText(/import/i)
    const file = { text: jest.fn().mockResolvedValue('{"format":"backup"}') }

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(importMock).toHaveBeenCalledWith('{"format":"backup"}'))
    expect(await screen.findByRole('status')).toHaveTextContent('Imported 2 subscriptions')
    expect(onImported).toHaveBeenCalledWith({
      subscriptionCount: 2,
      restoredSettings: true,
      restoredGameStats: false,
    })
  })
})
