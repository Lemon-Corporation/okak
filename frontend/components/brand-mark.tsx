'use client'

import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  compact?: boolean
}

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.24),transparent_38%),linear-gradient(145deg,oklch(0.49_0.22_262),oklch(0.39_0.22_262))] shadow-[0_10px_30px_rgba(52,84,255,0.28)]',
        compact ? 'h-10 w-10' : 'h-12 w-12',
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-[2px] rounded-[1.1rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
      <div className="absolute -left-2 top-3 h-5 w-5 rounded-full bg-lime/35 blur-md" />
      <div className="absolute -right-3 bottom-2 h-6 w-6 rounded-full bg-cyan-300/20 blur-lg" />

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-end gap-[3px]">
        {[12, 17, 23, 15].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="rounded-full bg-[linear-gradient(180deg,white,oklch(0.85_0.25_130))] shadow-[0_0_12px_rgba(176,255,49,0.28)]"
            style={{
              width: compact ? 4 : 5,
              height,
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface BrandLogoProps {
  className?: string
  markClassName?: string
  textClassName?: string
  compact?: boolean
}

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark className={markClassName} compact={compact} />
      <div className={cn('flex flex-col leading-none', textClassName)}>
        <span className="text-lg font-black tracking-[-0.08em]">ОКАК</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          голосовой хаб
        </span>
      </div>
    </div>
  )
}
