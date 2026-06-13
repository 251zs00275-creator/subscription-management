'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { AppShell } from '@/components/Layout/AppShell'
import { AuthGate } from '@/components/Layout/AuthGate'
import { ServiceWorkerRegister } from '@/components/Layout/ServiceWorkerRegister'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <ServiceWorkerRegister />
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  )
}
