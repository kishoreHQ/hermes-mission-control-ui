import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-[10px] border border-line bg-bg-1 p-3', className)} {...props}>
      {children}
    </div>
  )
}
