import { useDecision, useApprovals } from '@/shared/api/hooks'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Mono } from '@/shared/ui/Mono'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useUi } from '@/shared/store/ui'
import { HostApiError } from '@/shared/api/client'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export function ApprovalsPage() {
  const { data, isLoading, error, refetch } = useApprovals()
  const decision = useDecision()
  const toast = useUi((s) => s.pushToast)
  const [commentFor, setCommentFor] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  async function act(id: string, d: 'approve' | 'reject', c?: string) {
    try {
      await decision.mutateAsync({ id, decision: d, comment: c })
      toast(d === 'approve' ? 'Approval recorded' : 'Rejection recorded', d === 'approve' ? 'ok' : 'warn')
      setCommentFor(null)
      setComment('')
    } catch (e) {
      toast((e as HostApiError).message, 'fail')
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <h1 className="mb-1 font-display text-[26px] font-bold">Approvals</h1>
      <p className="mb-6 text-[13px] text-ink-1">HITL gates — review previews before deciding. Amber means needs you.</p>

      {isLoading && <Skeleton className="h-32 w-full" />}
      {error && (
        <ErrorState
          message={(error as HostApiError).message}
          remediation={(error as HostApiError).remediation}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <EmptyState title="Inbox clear" body="No pending approvals. You will see gates here when agents need a human decision." />
      )}

      <div className="space-y-4">
        {data?.map((a) => (
          <Card key={a.id} className="border-warn/40">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-display text-[16px] font-semibold">{a.missionName}</div>
                <Mono>
                  {a.id} · <Link className="text-accent" to={`/missions/${a.missionId}`}>{a.missionId}</Link>
                </Mono>
              </div>
              <span className="rounded-[6px] bg-warn/15 px-2 py-1 text-[12px] text-warn">Awaiting you</span>
            </div>
            <p className="mb-2 text-[14px]">{a.reason}</p>
            <dl className="mb-3 grid gap-1 text-[12px] text-ink-1 sm:grid-cols-2">
              <div>Agent: <Mono className="text-ink-0">{a.agentId}</Mono></div>
              <div>Policy: <Mono className="text-ink-0">{a.policy}</Mono></div>
              <div className="sm:col-span-2">Blast radius: {a.blastRadius}</div>
              <div>Age: <Mono>{Math.round(a.ageMs / 1000)}s</Mono></div>
            </dl>
            <div className="mb-3 rounded-[6px] border border-line bg-bg-0 p-3">
              <div className="mb-1 text-[12px] text-ink-1">{a.preview.title}</div>
              <pre className="max-h-48 overflow-auto font-mono text-[12.5px] text-ink-0 whitespace-pre-wrap">{a.preview.content}</pre>
            </div>
            {commentFor === a.id && (
              <textarea
                className="mb-2 w-full rounded-[6px] border border-line bg-bg-0 p-2 text-[14px]"
                rows={2}
                placeholder="Comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="w-full sm:flex-1" variant="warn" onClick={() => act(a.id, 'approve')} disabled={decision.isPending}>
                Approve
              </Button>
              <Button className="w-full sm:flex-1" variant="danger" onClick={() => act(a.id, 'reject')} disabled={decision.isPending}>
                Reject
              </Button>
              <Button
                className="w-full sm:flex-1"
                variant="secondary"
                onClick={() => {
                  if (commentFor === a.id) act(a.id, 'approve', comment)
                  else setCommentFor(a.id)
                }}
              >
                Approve with comment
              </Button>
              <Button className="w-full sm:flex-1" variant="ghost" onClick={() => toast('Escalation recorded (demo)', 'info')}>
                Escalate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
