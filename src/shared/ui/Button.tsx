import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warn'
}) {
  const v = {
    primary: 'bg-accent text-white hover:opacity-90',
    secondary: 'bg-bg-2 text-ink-0 border border-line hover:bg-bg-1',
    danger: 'bg-fail text-white hover:opacity-90',
    ghost: 'bg-transparent text-ink-1 hover:bg-bg-2 hover:text-ink-0',
    warn: 'bg-warn text-bg-0 hover:opacity-90',
  }
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-3 py-2 text-[14px] font-medium transition-[opacity,background] duration-[var(--motion)] disabled:opacity-40',
        v[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
