import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthInit } from '@/components/auth-init'
import './globals.css'

export const metadata: Metadata = {
  title: 'ОКАК — Заметки, задачи и проекты',
  description: 'Все ваши заметки, задачи и файлы в одном месте с быстрым доступом через overlay',
  icons: {
    icon: {
      url: '/icon.svg',
      type: 'image/svg+xml',
    },
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        <AuthInit />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
