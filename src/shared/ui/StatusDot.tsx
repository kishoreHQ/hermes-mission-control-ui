import { cn } from '@/shared/lib/cn'

const map: Record<string, string> = {
  running: 'bg-live spine-pulse',
  live: 'bg-live spine-pulse',
  awaiting_approval: 'bg-warn',
  blocked: 'bg-warn',
  pending: 'bg-ink-2',
  queued: 'bg-ink-2',
  succeeded: 'bg-ok',
  ok: 'bg-ok',
  passed: 'bg-ok',
  failed: 'bg-fail',
  fail: 'bg-fail',
  cancelled: 'bg-ink-2',
  healthy: 'bg-ok',
  degraded: 'bg-warn',
  down: 'bg-fail',
}

export function StatusDot({ status, label }: { status: string; label?: string }) {
  const pretty = (label || status).replaceAll('_', ' ')
  return (
    <span className="inline-flex items-center gap-1.5" title={pretty}>
      <span
        className={cn(
          'inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-bg-1',
          map[status] || 'bg-ink-2',
        )}
        aria-hidden
      />
      {label != null && (
        <span className="text-[12px] capitalize text-ink-1">{pretty}</span>
      )}
      <span className="sr-only">{pretty}</span>
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'running'
      ? 'live'
      : status === 'awaiting_approval' || status === 'blocked'
        ? 'warn'
        : status === 'succeeded' || status === 'ok'
          ? 'ok'
          : status === 'failed'
            ? 'fail'
            : 'default'
  const styles: Record<string, string> = {
    live: 'bg-[var(--live-dim)] text-live border-live/25',
    warn: 'bg-[var(--warn-dim)] text-warn border-warn/30',
    ok: 'bg-[var(--ok-dim)] text-ok border-ok/25',
    fail: 'bg-[var(--fail-dim)] text-fail border-fail/25',
    default: 'bg-bg-2 text-ink-1 border-line',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
        styles[tone],
      )}
    >
      <StatusDot status={status} />
      {status.replaceAll('_', ' ')}
    </span>
  )
}
