import type { Metadata, Viewport } from 'next'
import './globals.css'
import QualityChecklistWrapper from '@/components/quality-checklist-wrapper'

export const metadata: Metadata = {
  title: 'Operation DQ - Classified',
  description: 'High-performance organizational briefing system',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              overflow-x: hidden;
              width: 100%;
              max-width: 100%;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            * {
              box-sizing: border-box;
            }
          `
        }} />
      </head>
      <body>
        {children}
        <QualityChecklistWrapper />
      </body>
    </html>
  )
}
