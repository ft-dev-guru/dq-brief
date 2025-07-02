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
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              overflow-x: hidden !important;
              width: 100% !important;
              max-width: 100% !important;
              -webkit-text-size-adjust: 100% !important;
              -ms-text-size-adjust: 100% !important;
              text-size-adjust: 100% !important;
              -webkit-user-select: none !important;
              -webkit-touch-callout: none !important;
              -webkit-tap-highlight-color: transparent !important;
            }
            * {
              box-sizing: border-box !important;
              -webkit-overflow-scrolling: touch !important;
            }
            @media screen and (max-width: 768px) {
              html {
                font-size: 14px !important;
              }
              body {
                font-size: 14px !important;
              }
            }
            @media screen and (max-width: 480px) {
              html {
                font-size: 13px !important;
              }
            }
            @media screen and (max-width: 360px) {
              html {
                font-size: 12px !important;
              }
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
