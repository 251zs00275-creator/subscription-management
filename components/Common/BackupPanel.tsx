'use client'

import { ChangeEvent, useId, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  downloadCurrentBackup,
  importBackup,
  type ImportBackupResult,
} from '@/lib/backup'

interface BackupPanelProps {
  onExported?: () => void
  onImported?: (result: ImportBackupResult) => void
  onError?: (error: Error) => void
}

type PanelStatus = { tone: 'success' | 'error'; message: string } | null

const MAX_BACKUP_FILE_SIZE = 5 * 1024 * 1024

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Backup action failed.')
}

export function BackupPanel({ onExported, onImported, onError }: BackupPanelProps) {
  const importInputId = useId()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<PanelStatus>(null)

  async function exportBackup() {
    setBusy(true)
    setStatus(null)
    try {
      await downloadCurrentBackup()
      setStatus({ tone: 'success', message: 'Backup JSON exported.' })
      onExported?.()
    } catch (error) {
      const nextError = toError(error)
      setStatus({ tone: 'error', message: nextError.message })
      onError?.(nextError)
    } finally {
      setBusy(false)
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    if (file.size > MAX_BACKUP_FILE_SIZE) {
      const limitMb = MAX_BACKUP_FILE_SIZE / (1024 * 1024)
      setStatus({
        tone: 'error',
        message: `ファイルサイズが大きすぎます（上限 ${limitMb}MB）。`,
      })
      return
    }

    setBusy(true)
    setStatus(null)
    try {
      const result = await importBackup(await file.text())
      setStatus({
        tone: 'success',
        message: `Imported ${result.subscriptionCount} subscriptions from backup.`,
      })
      onImported?.(result)
    } catch (error) {
      const nextError = toError(error)
      setStatus({ tone: 'error', message: nextError.message })
      onError?.(nextError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-labelledby={`${importInputId}-title`}
      className="academy-panel rounded-xl p-5 text-[var(--anime-text)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id={`${importInputId}-title`} className="text-base font-semibold">
            JSON backup
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--anime-muted)]">
            Export subscriptions, settings, and available game stats. Import replaces saved
            subscriptions with the selected backup.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" onClick={exportBackup} disabled={busy}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild type="button" variant="outline" disabled={busy}>
            <label htmlFor={importInputId} aria-disabled={busy}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </label>
          </Button>
          <input
            id={importInputId}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={busy}
            onChange={importFile}
          />
        </div>
      </div>
      {status && (
        <p
          role={status.tone === 'error' ? 'alert' : 'status'}
          className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            status.tone === 'error'
              ? 'border-destructive/35 bg-destructive/10 text-destructive'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
          }`}
        >
          {status.message}
        </p>
      )}
    </section>
  )
}
