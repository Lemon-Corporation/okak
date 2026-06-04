'use client'

import { cn } from '@/lib/utils'

type PlatformLogoKind = 'macos' | 'windows' | 'linux'

interface PlatformLogoProps {
  platform: PlatformLogoKind
  className?: string
}

export function PlatformLogo({ platform, className }: PlatformLogoProps) {
  if (platform === 'windows') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={cn('h-6 w-6', className)}
      >
        <path d="M2.5 4.3 11 3v8.4H2.5V4.3Zm9.6-1.45L21.5 1.5v9.9h-9.4V2.85ZM2.5 12.6H11V21l-8.5-1.2v-7.2Zm9.6 0h9.4v9.9l-9.4-1.35V12.6Z" />
      </svg>
    )
  }

  if (platform === 'linux') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn('h-6 w-6', className)}
      >
        <path
          d="M12 2.25c2.12 0 3.82 1.78 3.82 4.1 0 1.18-.4 2.2-1.03 3 .96.84 1.56 2.15 1.56 3.6v2.07c0 3.35-1.82 5.73-4.35 5.73s-4.35-2.38-4.35-5.73V12.95c0-1.45.6-2.76 1.56-3.6-.63-.8-1.03-1.82-1.03-3C8.18 4.03 9.88 2.25 12 2.25Z"
          fill="currentColor"
        />
        <ellipse cx="10.45" cy="6.4" rx="0.7" ry="0.9" fill="#fff" />
        <ellipse cx="13.55" cy="6.4" rx="0.7" ry="0.9" fill="#fff" />
        <path d="M10.3 8.9c.5.46 1.03.66 1.7.66.66 0 1.2-.2 1.7-.66" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8.3 19.35c-.93 0-1.94.58-2.4 1.68-.16.39.05.83.46.95.96.28 2.2-.02 2.95-.79.27-.28.24-.74-.08-.98-.29-.22-.56-.35-.93-.46ZM15.7 19.35c.37.1.64.24.93.46.32.24.35.7.08.98-.75.77-1.99 1.07-2.95.79-.4-.12-.62-.56-.45-.95.45-1.1 1.46-1.68 2.39-1.68Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn('h-6 w-6', className)}
    >
      <path d="M16.42 12.6c.03 3.3 2.9 4.4 2.93 4.42-.02.08-.45 1.6-1.48 3.16-.9 1.34-1.82 2.68-3.29 2.71-1.45.03-1.92-.88-3.58-.88-1.67 0-2.18.85-3.56.9-1.41.05-2.49-1.46-3.4-2.8C2.2 17.4.8 12.4 2.7 9.1c.95-1.64 2.64-2.67 4.47-2.7 1.39-.03 2.7.97 3.57.97.86 0 2.47-1.2 4.16-1.03.7.03 2.67.29 3.94 2.18-.1.06-2.36 1.4-2.32 4.08Zm-2.49-9.1c.75-.96 1.26-2.29 1.12-3.62-1.08.04-2.39.73-3.16 1.68-.7.84-1.3 2.18-1.14 3.47 1.2.1 2.42-.63 3.18-1.53Z" />
    </svg>
  )
}
