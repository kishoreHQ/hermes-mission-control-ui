import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLaunchMission, useMissions } from '@/shared/api/hooks'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { StatusDot } from '@/shared/ui/StatusDot'
import { Mono } from '@/shared/ui/Mono'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useUi } from '@/shared/store/ui'
import type { Mission, MissionState } from '@/shared/types/host'
import { detectProfile } from '@/profiles/detect'
import { HostApiError } from '@/shared/api/client'

const groups: { key: MissionState | 'recent'; title: string; filter: (m: Mission) => boolean }[] = [
  { key: 'running', title: 'Running', filter: (m) => m.state === 'running' },
  { key: 'awaiting_approval', title: 'Awaiting approval', filter: (m) => m.state === 'awaiting_approval' },
  { key: 'queued', title: 'Queued', filter: (m) => m.state === 'queued' },
  {
    key: 'recent',
    title: 'Recent',
    filter: (m) => m.state === 'succeeded' || m.state === 'failed' || m.state === 'cancelled',
  },
]

export function MissionsPage() {
  const { data, isLoading, error, refetch } = useMissions()
  const launch = useLaunchMission()
  const toast = useUi((s) => s.pushToast)
  const [q, setQ] = useState('')
  const profile = detectProfile()

  const filtered = useMemo(() => {
    const list = data ?? []
    if (!q) return list
    const s = q.toLowerCase()
    return list.filter((m) => m.name.toLowerCase().includes(s) || m.id.includes(s))
  }, [data, q])

  async function onLaunch() {
    try {
      await launch.mutateAsync({
        name: 'Ad-hoc mission',
        goal: 'Explore agent loop from Mission Control',
        requiredCapabilities: ['coding', 'tools'],
      })
      toast('Mission launched', 'ok')
    } catch (e) {
      const err = e as HostApiError
      toast(err.message, 'fail')
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Missions</h1>
          <p className="text-[13px] text-ink-1">
            {profile.label}
            {profile.useMocks ? ' · mock Host Interface' : ' · live Host Interface'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="min-h-11 rounded-[6px] border border-line bg-bg-1 px-3 text-[14px] outline-none focus:border-accent"
            placeholder="Search missions… ⌘K"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search missions"
          />
          <Button onClick={onLaunch} disabled={launch.isPending}>
            Launch mission
          </Button>
        </div>
      </header>

      {isLoading && (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}
      {error && (
        <ErrorState
          message={(error as HostApiError).message}
          remediation={(error as HostApiError).remediation}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          title="No missions yet"
          body="Launch one, or run an example workflow from the Agent OS CLI."
          actionLabel="Launch mission"
          onAction={onLaunch}
        />
      )}

      {!isLoading &&
        !error &&
        groups.map((g) => {
          const items = filtered.filter(g.filter)
          if (!items.length) return null
          return (
            <section key={g.key} className="mb-8" aria-labelledby={`g-${g.key}`}>
              <h2 id={`g-${g.key}`} className="mb-3 font-display text-[16px] font-semibold">
                {g.title}
                <span className="ml-2 font-mono text-[12px] text-ink-1">{items.length}</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((m) => (
                  <MissionCard key={m.id} m={m} />
                ))}
              </div>
            </section>
          )
        })}
    </div>
  )
}

function MissionCard({ m }: { m: Mission }) {
  return (
    <Link to={`/missions/${m.id}`} className="block focus:outline-none">
      <Card className="transition-colors hover:bg-bg-2">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-[16px] font-semibold">{m.name}</div>
            <Mono>{m.id}</Mono>
          </div>
          <StatusDot
            status={m.state === 'awaiting_approval' ? 'awaiting_approval' : m.state}
            label={m.state.replaceAll('_', ' ')}
          />
        </div>
        <p className="mb-3 line-clamp-2 text-[13px] text-ink-1">{m.goal}</p>
        <div className="flex flex-wrap gap-1.5">
          {m.requiredCapabilities.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 font-mono text-[12px] text-ink-1">
          <span>{m.agentsActive} agents</span>
          <span>{(m.elapsedMs / 1000).toFixed(0)}s</span>
          <span>${m.costUsd.toFixed(2)}</span>
          {m.progressPhase && <span>{m.progressPhase}</span>}
        </div>
      </Card>
    </Link>
  )
}
