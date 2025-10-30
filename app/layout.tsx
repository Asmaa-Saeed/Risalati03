import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'رسالتي - Risalati',
  description: 'Educational platform for students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}