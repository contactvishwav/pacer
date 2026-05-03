import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Nav } from '@/components/nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pacer',
  description: 'AI running coach — proactive conversational training coaching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-6">
          {children}
        </main>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}
