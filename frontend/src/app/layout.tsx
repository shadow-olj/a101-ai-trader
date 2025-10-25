import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'A101 AI Trader',
  description: 'AI-powered trading assistant with A101 Protocol for AsterDEX',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
