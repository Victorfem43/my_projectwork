import type { Metadata, Viewport } from 'next'
import './globals.css'
import Toaster from '@/components/Toaster'

export const metadata: Metadata = {
  title: 'SiegerTech - Buy, Sell & Trade Crypto and Gift Cards',
  description: 'Secure crypto and gift card trading platform',
  icons: {
    icon: '/favicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
