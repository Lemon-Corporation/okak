'use client'

import { useEffect } from 'react'
import { desktopWriteLog } from '@/lib/electron'

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    desktopWriteLog('WidgetLayout mounted');
    document.body.style.backgroundColor = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
    
    // Forcibly hide Next.js dev indicator
    const style = document.createElement('style')
    style.innerHTML = 'nextjs-portal { display: none !important; } [data-nextjs-toast] { display: none !important; }'
    document.head.appendChild(style)

    return () => {
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-transparent overflow-hidden">
      {children}
    </div>
  )
}
