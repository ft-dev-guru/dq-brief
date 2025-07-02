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
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
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
            html {
              font-size: 16px;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            body {
              overflow-x: hidden;
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              font-size: 16px;
            }
            * {
              box-sizing: border-box;
            }
            /* Ensure modals and fixed elements scale properly */
            .modal-overlay {
              position: fixed !important;
              inset: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
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
