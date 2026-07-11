import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warn'
  size?: 'sm' | 'md'
  children: ReactNode
}) {
  const v = {
    primary:
      'bg-accent text-white hover:brightness-110 active:brightness-95 shadow-[0_0_0_1px_rgba(91,141,239,0.3)]',
    secondary:
      'bg-bg-2 text-ink-0 border border-line hover:border-line-strong hover:bg-bg-3',
    danger: 'bg-fail text-white hover:brightness-110',
    ghost: 'bg-transparent text-ink-1 hover:bg-bg-2 hover:text-ink-0',
    warn: 'bg-warn text-[#1a1206] font-semibold hover:brightness-105',
  }
  const s = {
    sm: 'min-h-9 px-2.5 text-[13px] gap-1.5',
    md: 'min-h-10 px-3.5 text-[13.5px] gap-2',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[6px] font-medium transition-all duration-[var(--motion)] disabled:pointer-events-none disabled:opacity-40',
        v[variant],
        s[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
