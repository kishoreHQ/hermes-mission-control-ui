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

const nav = [
  { to: '/', label: 'Missions', icon: '▣' },
  { to: '/approvals', label: 'Approvals', icon: '◎' },
  { to: '/fleet', label: 'Fleet', icon: '⬡' },
  { to: '/memory', label: 'Memory', icon: '◈' },
  { to: '/artifacts', label: 'Artifacts', icon: '▤' },
  { to: '/evaluations', label: 'Evaluations', icon: '▥' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
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

  const showSpineDesktop = !loc.pathname.startsWith('/approvals') || true

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg-0 text-ink-0">
      {/* Desktop / tablet shell */}
      <div className="hidden min-h-0 flex-1 md:flex">
        <nav
          className={cn(
            'flex shrink-0 flex-col border-r border-line bg-bg-1 transition-[width] duration-[var(--motion)]',
            railExpanded ? 'w-[240px]' : 'w-[72px]',
          )}
          aria-label="Primary"
        >
          <button
            className="flex h-14 items-center gap-2 border-b border-line px-4 text-left"
            onClick={toggleRail}
            aria-label="Toggle navigation"
          >
            <span className="font-display text-[16px] font-bold text-accent">H</span>
            {railExpanded && <span className="font-display text-[14px] font-semibold">Mission Control</span>}
          </button>
          <div className="flex flex-1 flex-col gap-1 p-2">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-[13px] text-ink-1 hover:bg-bg-2 hover:text-ink-0',
                    isActive && 'bg-bg-2 text-ink-0',
                  )
                }
              >
                <span className="w-5 text-center" aria-hidden>
                  {n.icon}
                </span>
                {railExpanded && <span>{n.label}</span>}
                {n.to === '/approvals' && pending > 0 && (
                  <span className="ml-auto rounded-full bg-warn px-1.5 text-[11px] font-semibold text-bg-0">
                    {pending}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
          <div className="border-t border-line p-3 text-[11px] text-ink-1">
            <div className="flex items-center gap-2">
              <StatusDot status={health.data?.status === 'ok' ? 'ok' : 'degraded'} />
              {railExpanded && <span>{profile.label}</span>}
            </div>
            {railExpanded && (
              <button className="mt-2 text-accent" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                Theme: {theme}
              </button>
            )}
          </div>
        </nav>

        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>

        {showSpineDesktop && (
          <div
            className={cn(
              'hidden shrink-0 transition-[width] lg:block',
              spineOpen ? 'w-[320px]' : 'w-0 overflow-hidden',
            )}
          >
            <MissionSpine missions={missions.data} selectedMissionId={loc.pathname.split('/')[2]} />
          </div>
        )}
      </div>

      {/* Mobile shell */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <header className="flex h-12 items-center justify-between border-b border-line bg-bg-1 px-3">
          <span className="font-display text-[14px] font-semibold">Mission Control</span>
          <span className="text-[12px] text-ink-1">{profile.label}</span>
        </header>
        <main className="min-h-0 flex-1 overflow-auto pb-[calc(56px+env(safe-area-inset-bottom))]">
          {loc.pathname === '/spine' ? (
            <MissionSpine missions={missions.data} compact />
          ) : (
            <Outlet />
          )}
        </main>
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-stretch border-t border-line bg-bg-1 pb-[env(safe-area-inset-bottom)]"
          aria-label="Mobile"
        >
          {[
            { to: '/', label: 'Missions' },
            { to: '/approvals', label: 'Approvals', badge: pending },
            { to: '/spine', label: 'Spine' },
            { to: '/fleet', label: 'Fleet' },
            { to: '/settings', label: 'More' },
          ].map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-1 flex-col items-center justify-center text-[11px] text-ink-1',
                  isActive && 'text-accent',
                )
              }
            >
              {t.label}
              {t.badge ? (
                <span className="absolute right-3 top-1 rounded-full bg-warn px-1 text-[10px] font-bold text-bg-0">
                  {t.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* tablet spine drawer toggle */}
      <button
        className="fixed bottom-4 right-4 z-30 hidden rounded-[6px] border border-line bg-bg-1 px-3 py-2 text-[12px] md:block lg:hidden"
        onClick={() => setSpineOpen(!spineOpen)}
      >
        Spine
      </button>
      {spineOpen && (
        <div className="fixed inset-y-0 right-0 z-40 hidden w-[320px] border-l border-line md:block lg:hidden">
          <MissionSpine missions={missions.data} />
        </div>
      )}

      <Toasts />
    </div>
  )
}
