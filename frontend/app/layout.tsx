import type { Metadata } from 'next'
import './globals.css'
import Toaster from '@/components/Toaster'

export const metadata: Metadata = {
  title: 'SiegerTech - Buy, Sell & Trade Crypto and Gift Cards',
  description: 'Secure crypto and gift card trading platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
