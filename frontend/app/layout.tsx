import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'

const Toaster = dynamic(() => import('@/components/Toaster'), { ssr: false })

export const metadata: Metadata = {
  title: 'SiegerTech - Buy, Sell & Trade Crypto and Gift Cards',
  description: 'Secure crypto and gift card trading platform',
  icons: { icon: '/favicon.png' },
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  let apiOrigin = ''
  try {
    if (apiUrl) apiOrigin = new URL(apiUrl).origin
  } catch (_) {}
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {apiOrigin ? (
          <>
            <link rel="preconnect" href={apiOrigin} />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        ) : null}
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
