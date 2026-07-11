import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApprovals, useHealth, useMissions } from '@/shared/api/hooks'
import { MissionSpine } from '@/shared/spine/MissionSpine'
import { detectProfile } from '@/profiles/detect'
import { useUi } from '@/shared/store/ui'
import { Toasts } from '@/shared/ui/Toasts'
import { EventBridge } from '@/shared/events/EventBridge'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { StatusDot } from '@/shared/ui/StatusDot'
import {
  IconApprovals,
  IconArtifacts,
  IconEval,
  IconFleet,
  IconLogo,
  IconMemory,
  IconMissions,
  IconSettings,
  IconSpine,
} from '@/shared/ui/Icons'

const nav = [
  { to: '/', label: 'Missions', icon: IconMissions },
  { to: '/approvals', label: 'Approvals', icon: IconApprovals },
  { to: '/fleet', label: 'Fleet', icon: IconFleet },
  { to: '/memory', label: 'Memory', icon: IconMemory },
  { to: '/artifacts', label: 'Artifacts', icon: IconArtifacts },
  { to: '/evaluations', label: 'Evaluations', icon: IconEval },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

export function AppShell() {
  const profile = detectProfile()
  const health = useHealth()
  const missions = useMissions()
  const approvals = useApprovals()
  const { railExpanded, toggleRail, spineOpen, setSpineOpen, theme, setTheme } = useUi()
  const loc = useLocation()
  const qc = useQueryClient()
  const pending = approvals.data?.length ?? 0
  const healthy = health.data?.status === 'ok'

  useEffect(() => {
    EventBridge.connect()
    const unsub = EventBridge.subscribe((ev) => {
      if (ev.type.startsWith('mission') || ev.type.startsWith('approval') || ev.type.startsWith('node')) {
        qc.invalidateQueries({ queryKey: ['missions'] })
        qc.invalidateQueries({ queryKey: ['approvals'] })
        qc.invalidateQueries({ queryKey: ['tree'] })
      }
    })
    return () => {
      unsub()
    }
  }, [qc])

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg-0 text-ink-0">
      {/* Desktop */}
      <div className="hidden min-h-0 flex-1 md:flex">
        <nav
          className={cn(
            'flex shrink-0 flex-col border-r border-line bg-bg-1/90 backdrop-blur-sm transition-[width] duration-[var(--motion)]',
            railExpanded ? 'w-[232px]' : 'w-[68px]',
          )}
          aria-label="Primary"
        >
          <button
            className="group flex h-[3.5rem] items-center gap-2.5 border-b border-line px-3.5 text-left"
            onClick={toggleRail}
            aria-label="Toggle navigation"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--accent-dim)] text-accent">
              <IconLogo size={18} />
            </span>
            {railExpanded && (
              <div className="min-w-0">
                <div className="truncate font-display text-[13px] font-bold tracking-tight">Mission Control</div>
                <div className="truncate text-[10px] uppercase tracking-[0.08em] text-ink-2">Agent OS</div>
              </div>
            )}
          </button>

          <div className="flex flex-1 flex-col gap-0.5 p-2">
            {nav.map((n) => {
              const Icon = n.icon
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  title={n.label}
                  className={({ isActive }) =>
                    cn(
                      'relative flex min-h-10 items-center gap-3 rounded-[8px] px-2.5 text-[13px] font-medium text-ink-1 transition-colors',
                      'hover:bg-bg-2 hover:text-ink-0',
                      isActive && 'bg-[var(--accent-dim)] text-accent',
                      !railExpanded && 'justify-center px-0',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
                      )}
                      <Icon className={cn(isActive ? 'text-accent' : 'text-ink-1')} size={18} />
                      {railExpanded && <span className="truncate">{n.label}</span>}
                      {n.to === '/approvals' && pending > 0 && (
                        <span
                          className={cn(
                            'flex h-5 min-w-5 items-center justify-center rounded-full bg-warn px-1 font-mono text-[10px] font-bold text-[#1a1206]',
                            railExpanded ? 'ml-auto' : 'absolute right-1 top-1',
                          )}
                        >
                          {pending}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>

          <div className="space-y-2 border-t border-line p-3">
            <div
              className={cn(
                'flex items-center gap-2 rounded-[8px] border border-line bg-bg-0/60 px-2 py-1.5',
                !railExpanded && 'justify-center px-1',
              )}
            >
              <StatusDot status={healthy ? 'ok' : 'degraded'} />
              {railExpanded && (
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium text-ink-0">{profile.label}</div>
                  <div className="truncate font-mono text-[10px] text-ink-2">
                    {profile.useMocks ? 'mocks' : 'live'} · {healthy ? 'connected' : 'degraded'}
                  </div>
                </div>
              )}
            </div>
            {railExpanded && (
              <button
                className="w-full rounded-[6px] px-2 py-1.5 text-left text-[11px] text-ink-1 hover:bg-bg-2 hover:text-ink-0"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                Theme · {theme}
              </button>
            )}
          </div>
        </nav>

        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>

        <div
          className={cn(
            'hidden shrink-0 border-l border-line transition-[width] lg:block',
            spineOpen ? 'w-[300px]' : 'w-0 overflow-hidden border-0',
          )}
        >
          <MissionSpine missions={missions.data} selectedMissionId={loc.pathname.split('/')[2]} />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <header className="flex h-12 items-center justify-between border-b border-line bg-bg-1/95 px-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[var(--accent-dim)] text-accent">
              <IconLogo size={16} />
            </span>
            <span className="font-display text-[13px] font-semibold tracking-tight">Mission Control</span>
          </div>
          <span className="rounded-full border border-line bg-bg-0 px-2 py-0.5 font-mono text-[10px] text-ink-1">
            {profile.label.replace('P2 ', '').replace('P1 ', '')}
          </span>
        </header>
        <main className="min-h-0 flex-1 overflow-auto pb-[calc(3.75rem+env(safe-area-inset-bottom))]">
          {loc.pathname === '/spine' ? (
            <MissionSpine missions={missions.data} compact />
          ) : (
            <Outlet />
          )}
        </main>
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 grid h-[3.75rem] grid-cols-5 border-t border-line bg-bg-1/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
          aria-label="Mobile"
        >
          {[
            { to: '/', label: 'Missions', icon: IconMissions },
            { to: '/approvals', label: 'Approvals', icon: IconApprovals, badge: pending },
            { to: '/spine', label: 'Spine', icon: IconSpine },
            { to: '/fleet', label: 'Fleet', icon: IconFleet },
            { to: '/settings', label: 'More', icon: IconSettings },
          ].map((t) => {
            const Icon = t.icon
            return (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-2',
                    isActive && 'text-accent',
                  )
                }
              >
                <Icon size={18} />
                {t.label}
                {t.badge ? (
                  <span className="absolute right-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warn px-1 font-mono text-[9px] font-bold text-[#1a1206]">
                    {t.badge}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <button
        className="fixed bottom-4 right-4 z-30 hidden items-center gap-1.5 rounded-[8px] border border-line bg-bg-1 px-3 py-2 text-[12px] font-medium text-ink-1 shadow-none hover:border-line-strong hover:text-ink-0 md:flex lg:hidden"
        onClick={() => setSpineOpen(!spineOpen)}
      >
        <IconSpine size={14} /> Spine
      </button>
      {spineOpen && (
        <div className="fixed inset-y-0 right-0 z-40 hidden w-[300px] border-l border-line bg-bg-1 md:block lg:hidden">
          <MissionSpine missions={missions.data} />
        </div>
      )}

      <Toasts />
    </div>
  )
}
