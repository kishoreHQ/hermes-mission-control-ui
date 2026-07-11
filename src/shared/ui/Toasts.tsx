import { useUi } from '@/shared/store/ui'
import { cn } from '@/shared/lib/cn'

export function Toasts() {
  const { toasts, dismissToast } = useUi()
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-50 flex w-80 flex-col gap-2 md:bottom-4" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto rounded-[10px] border border-line bg-bg-1 px-3 py-2 text-[13px] shadow-none',
            t.tone === 'ok' && 'border-ok/40',
            t.tone === 'warn' && 'border-warn/40',
            t.tone === 'fail' && 'border-fail/40',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{t.message}</span>
            <button className="text-ink-1" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
