import { cn } from '@/shared/lib/cn'

const map: Record<string, string> = {
  running: 'bg-live spine-pulse',
  live: 'bg-live spine-pulse',
  awaiting_approval: 'bg-warn',
  blocked: 'bg-warn',
  pending: 'bg-ink-1',
  queued: 'bg-ink-1',
  succeeded: 'bg-ok',
  ok: 'bg-ok',
  passed: 'bg-ok',
  failed: 'bg-fail',
  fail: 'bg-fail',
  cancelled: 'bg-ink-1',
  healthy: 'bg-ok',
  degraded: 'bg-warn',
  down: 'bg-fail',
}

export function StatusDot({ status, label }: { status: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label || status}>
      <span className={cn('inline-block h-2 w-2 rounded-full', map[status] || 'bg-ink-1')} aria-hidden />
      {label != null && <span className="text-ink-1 text-[12px] capitalize">{label || status.replaceAll('_', ' ')}</span>}
      <span className="sr-only">{status}</span>
    </span>
  )
}
