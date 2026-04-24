import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  LogOut,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Pin,
  PinOff,
  Search,
  Share2,
  Trash2,
  User,
} from 'lucide-react'

import { cn } from '@/lib/utils'

type RecentItem = {
  id: string
  title: string
  updatedAt?: string
}

type AppSidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  showRecents: boolean
  recents: RecentItem[]
  activeRecentId?: string | null
  onNewChat: () => void
  onSelectRecent: (id: string) => void
  userEmail?: string | null
  onLogout: () => void
}

function initialsFromEmail(email: string) {
  const base = email.split('@')[0] ?? email
  const parts = base.split(/[._-]+/g).filter(Boolean)
  const first = parts[0]?.[0] ?? 'U'
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  showRecents,
  recents,
  activeRecentId,
  onNewChat,
  onSelectRecent,
  userEmail,
  onLogout,
}: AppSidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [renamedTitles, setRenamedTitles] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'b' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        setProfileOpen(false)
        onToggleCollapsed()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onToggleCollapsed])

  const visibleRecents = recents
    .filter((r) => !hiddenIds.includes(r.id))
    .filter((r) => {
      const title = (renamedTitles[r.id] ?? r.title).toLowerCase()
      return title.includes(search.trim().toLowerCase())
    })
    .sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id) ? 1 : 0
      const bPinned = pinnedIds.includes(b.id) ? 1 : 0
      if (aPinned !== bPinned) return bPinned - aPinned
      return 0
    })

  return (
    <aside
      className={cn(
        'sticky top-0 z-20 flex h-screen shrink-0 flex-col overflow-x-hidden border-r border-white/10 bg-[#191622] text-white transition-[width] duration-200',
        collapsed ? 'w-12' : 'w-64',
      )}
    >
      <div className={cn('flex items-center gap-2 p-2', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <Link to="/" className="truncate px-1 text-xs font-semibold tracking-tight text-white/90">
            IdeaForge
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            setProfileOpen(false)
            onToggleCollapsed()
          }}
          className="inline-flex size-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title="Toggle sidebar (Ctrl/Cmd+B)"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={() => {
            setProfileOpen(false)
            onNewChat()
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 text-xs font-semibold text-white hover:bg-white/15',
            collapsed && 'justify-center px-0',
          )}
        >
          <MessageSquarePlus className="size-4" />
          {!collapsed && <span>New chat</span>}
        </button>
        {!collapsed && (
          <label className="mt-2 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-white/80 hover:bg-white/10">
            <Search className="size-4 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/45"
            />
          </label>
        )}
      </div>

      <div className={cn('flex-1 overflow-x-hidden overflow-y-auto px-3 pb-3', collapsed && 'px-2')}>
        {showRecents && (
          <div className="pt-2">
            {!collapsed && (
              <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                Recents
              </div>
            )}
            <div className="grid gap-1">
              {visibleRecents.map((r) => {
                const active = r.id === activeRecentId
                const displayTitle = renamedTitles[r.id] ?? r.title
                const isPinned = pinnedIds.includes(r.id)
                return (
                  <div key={r.id} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)
                        setMenuOpenId(null)
                        onSelectRecent(r.id)
                      }}
                      className={cn(
                        'group flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-xl px-2 py-2 text-left text-xs hover:bg-white/10',
                        collapsed && 'justify-center px-0',
                        active && 'bg-white/15',
                      )}
                      title={collapsed ? displayTitle : undefined}
                    >
                      <span className="grid size-7 place-items-center rounded-md bg-white/10 text-white/80">
                        <User className="size-4" />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="min-w-0 max-w-[150px] flex-1 truncate text-xs text-white/95">{displayTitle}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId((prev) => (prev === r.id ? null : r.id))
                            }}
                            className="inline-flex size-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
                            aria-label={`Open actions for ${displayTitle}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </>
                      )}
                    </button>

                    {!collapsed && menuOpenId === r.id && (
                      <div className="absolute right-2 top-10 z-30 w-44 rounded-xl border border-white/10 bg-[#262230] p-1 shadow-2xl">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(`${window.location.origin}/app`)
                            } catch {
                              // Ignore clipboard failures silently
                            }
                            setMenuOpenId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-white/90 hover:bg-white/10"
                        >
                          <Share2 className="size-4" />
                          Share
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = window.prompt('Rename chat', displayTitle)
                            if (next && next.trim()) {
                              setRenamedTitles((prev) => ({ ...prev, [r.id]: next.trim() }))
                            }
                            setMenuOpenId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-white/90 hover:bg-white/10"
                        >
                          <Pencil className="size-4" />
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPinnedIds((prev) =>
                              isPinned ? prev.filter((id) => id !== r.id) : [r.id, ...prev],
                            )
                            setMenuOpenId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-white/90 hover:bg-white/10"
                        >
                          {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                          {isPinned ? 'Unpin chat' : 'Pin chat'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHiddenIds((prev) => [...prev, r.id])
                            setMenuOpenId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-white/90 hover:bg-white/10"
                        >
                          <Archive className="size-4" />
                          Archive
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHiddenIds((prev) => [...prev, r.id])
                            setMenuOpenId(null)
                          }}
                          className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              {visibleRecents.length === 0 && !collapsed && (
                <div className="px-2 py-2 text-xs text-white/50">No recent sessions.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={cn('relative p-3', collapsed && 'px-2')}>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 hover:bg-white/15',
            collapsed && 'justify-center px-0',
          )}
          aria-label="Open profile menu"
        >
          <span className="grid size-7 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
            {userEmail ? initialsFromEmail(userEmail) : 'U'}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/90">
              {userEmail ?? 'Guest'}
            </span>
          )}
        </button>

        {profileOpen && (
          <div
            className={cn(
              'absolute bottom-14 left-2 right-2 rounded-lg border border-zinc-300 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#120b22]',
              collapsed && 'left-2 right-2',
            )}
          >
            <div className="flex items-center gap-2 rounded-md px-2 py-2">
              <span className="grid size-8 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-white/10 dark:text-white">
                {userEmail ? initialsFromEmail(userEmail) : 'U'}
              </span>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white/90">
                    {userEmail ?? 'Guest'}
                  </div>
                  <div className="text-xs text-white/50">Profile</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false)
                onLogout()
              }}
              className={cn(
                'mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-white/90 hover:bg-white/10',
                collapsed && 'justify-center px-0',
              )}
            >
              <LogOut className="size-4" />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

