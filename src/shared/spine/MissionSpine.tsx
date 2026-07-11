import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Link, useNavigate } from 'react-router-dom'
import type { ExecutionTree, Mission, TreeNode } from '@/shared/types/host'
import { StatusDot } from '@/shared/ui/StatusDot'
import { Mono } from '@/shared/ui/Mono'
import { cn } from '@/shared/lib/cn'
import { Skeleton } from '@/shared/ui/Skeleton'

function flatten(node: TreeNode, depth = 0, acc: { node: TreeNode; depth: number }[] = []) {
  acc.push({ node, depth })
  node.children?.forEach((c) => flatten(c, depth + 1, acc))
  return acc
}

export function MissionSpine({
  missions,
  tree,
  selectedMissionId,
  onSelectNode,
  compact,
}: {
  missions?: Mission[]
  tree?: ExecutionTree
  selectedMissionId?: string
  onSelectNode?: (id: string) => void
  compact?: boolean
}) {
  const nav = useNavigate()
  const parentRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const rows = useMemo(() => {
    if (tree) {
      const flat = flatten(tree.root)
      return flat.filter((r) => {
        // honor collapsed ancestors
        let p = r.node.parentId
        while (p) {
          if (collapsed[p]) return false
          const parent = flat.find((x) => x.node.id === p)
          p = parent?.node.parentId
        }
        return true
      })
    }
    return (missions || []).map((m) => ({
      node: {
        id: m.id,
        label: m.name,
        kind: 'agent' as const,
        status: (m.state === 'awaiting_approval' ? 'blocked' : m.state === 'running' ? 'running' : m.state === 'succeeded' ? 'succeeded' : m.state === 'failed' ? 'failed' : 'pending') as TreeNode['status'],
        costUsd: m.costUsd,
        durationMs: m.elapsedMs,
      },
      depth: 0,
      mission: m,
    }))
  }, [tree, missions, collapsed])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 12,
  })

  if (!missions && !tree) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <aside
      className={cn('flex h-full min-h-0 flex-col border-l border-line bg-bg-1', compact && 'border-l-0')}
      aria-label="Mission Spine"
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <div>
          <div className="font-display text-[13px] font-semibold tracking-tight">Mission Spine</div>
          <div className="text-[12px] text-ink-1">
            {tree ? `${tree.nodeCount} nodes` : `${missions?.length ?? 0} missions`}
          </div>
        </div>
      </div>
      <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const row = rows[vi.index] as { node: TreeNode; depth: number; mission?: Mission }
            const hasChildren = (row.node.children?.length ?? 0) > 0
            const isSel = selectedMissionId === row.node.id
            return (
              <div
                key={row.node.id + vi.index}
                className={cn(
                  'absolute left-0 top-0 flex w-full cursor-pointer items-center gap-2 border-b border-line/50 px-2 text-[13px] hover:bg-bg-2',
                  isSel && 'bg-bg-2',
                )}
                style={{ height: vi.size, transform: `translateY(${vi.start}px)`, paddingLeft: 8 + row.depth * 12 }}
                onClick={() => {
                  if (row.mission) nav(`/missions/${row.mission.id}`)
                  else onSelectNode?.(row.node.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (row.mission) nav(`/missions/${row.mission.id}`)
                    else onSelectNode?.(row.node.id)
                  }
                }}
                role="treeitem"
                tabIndex={0}
              >
                {hasChildren ? (
                  <button
                    className="h-5 w-5 shrink-0 text-ink-1"
                    aria-label={collapsed[row.node.id] ? 'Expand' : 'Collapse'}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCollapsed((c) => ({ ...c, [row.node.id]: !c[row.node.id] }))
                    }}
                  >
                    {collapsed[row.node.id] ? '▸' : '▾'}
                  </button>
                ) : (
                  <span className="w-5" />
                )}
                <StatusDot status={row.node.status} />
                <span className="min-w-0 flex-1 truncate text-ink-0">{row.node.label}</span>
                {!compact && row.node.costUsd != null && (
                  <Mono className="shrink-0">${row.node.costUsd.toFixed(3)}</Mono>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {missions && missions.length === 0 && (
        <div className="p-3 text-[13px] text-ink-1">
          No missions. <Link className="text-accent" to="/">Launch one</Link>
        </div>
      )}
    </aside>
  )
}
