import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[10px] border border-line bg-bg-1 p-4 transition-colors duration-[var(--motion)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
