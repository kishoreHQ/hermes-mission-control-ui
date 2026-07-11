import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'accent' | 'live' | 'warn' | 'fail' | 'ok'
}) {
  const tones = {
    default: 'bg-bg-2 text-ink-1 border-line',
    accent: 'bg-accent/15 text-accent border-accent/30',
    live: 'bg-live/15 text-live border-live/30',
    warn: 'bg-warn/15 text-warn border-warn/30',
    fail: 'bg-fail/15 text-fail border-fail/30',
    ok: 'bg-ok/15 text-ok border-ok/30',
  }
  return (
    <span className={cn('inline-flex items-center rounded-[6px] border px-1.5 py-0.5 text-[12px]', tones[tone])}>
      {children}
    </span>
  )
}
