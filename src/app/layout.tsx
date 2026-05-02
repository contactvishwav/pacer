import type { Metadata } from 'next'
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
      <body className="min-h-screen bg-gray-950 text-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
