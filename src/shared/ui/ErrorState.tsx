import { Button } from './Button'

export function ErrorState({
  message,
  remediation,
  onRetry,
}: {
  message: string
  remediation?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-[10px] border border-fail/40 bg-fail/10 p-4" role="alert">
      <p className="font-medium text-fail">{message}</p>
      {remediation && <p className="mt-1 text-[13px] text-ink-1">{remediation}</p>}
      {onRetry && (
        <Button className="mt-3" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
