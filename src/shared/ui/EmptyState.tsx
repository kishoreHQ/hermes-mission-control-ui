import { Button } from './Button'

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[10px] border border-dashed border-line bg-bg-1 p-6">
      <h3 className="font-display text-[16px] font-semibold text-ink-0">{title}</h3>
      <p className="max-w-md text-ink-1 text-[14px]">{body}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
