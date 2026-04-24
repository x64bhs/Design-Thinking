import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Check, LogIn, Moon, Sun, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { AppSidebar } from '@/components/app-sidebar'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

type Idea = {
  id: string
  title: string
  problemStatement: string
  interactions: string[]
}

type Blueprint = {
  summary: string
  problemStatement: string
  targetAudience: string[]
  coreFeatures: string[]
  techStack: string[]
  implementationSteps: string[]
}

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

function safeDecodeJwtPayload(token: string): unknown {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1] ?? ''
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = atob(padded)
    return JSON.parse(json) as unknown
  } catch {
    return null
  }
}

function getEmailFromToken(token: string | null) {
  if (!token) return null
  const payload = safeDecodeJwtPayload(token)
  if (payload && typeof payload === 'object' && 'email' in payload) {
    const email = (payload as { email?: unknown }).email
    return typeof email === 'string' ? email : null
  }
  return null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AppPage() {
  const [domain, setDomain] = useState('')
  const [techStack, setTechStack] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [freeText, setFreeText] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isWorkingIdea, setIsWorkingIdea] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [refineText, setRefineText] = useState('')
  const [sessions, setSessions] = useState<Array<{ id: string; title?: string | null; input: { domain?: string | null; freeText?: string | null }; updatedAt?: string }>>([])
  const [activeRecentId, setActiveRecentId] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [hasAcceptedOnce, setHasAcceptedOnce] = useState(false)
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') : null
    return raw === 'true'
  })
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const userEmail = useMemo(() => getEmailFromToken(token), [token])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = storedTheme === 'dark' || (storedTheme === null && prefersDark)
    root.classList.toggle('dark', shouldUseDark)
    setIsDark(shouldUseDark)
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const canGenerate = useMemo(() => {
    return freeText.trim().length > 0 || domain.trim().length > 0
  }, [domain, freeText])

  const activeIdea = useMemo(() => {
    if (!ideas.length) return null
    return ideas.find((idea) => idea.id === activeIdeaId) ?? ideas[0] ?? null
  }, [activeIdeaId, ideas])
  const isAcceptedMode = Boolean(selectedIdea && blueprint)

  const generateIdeas = async () => {
    if (!canGenerate || isGenerating) return
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim() || null,
          techStack: techStack.trim() || null,
          difficulty,
          freeText: freeText.trim() || null,
          count: 7,
          excludeTitles: [],
        }),
      })
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }
      const data = (await response.json()) as { ideas: Idea[] }
      setIdeas(data.ideas ?? [])
      setActiveIdeaId(data.ideas?.[0]?.id ?? null)
      setSelectedIdea(null)
      setBlueprint(null)
      setShareLink(null)
      setActiveRecentId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const rejectIdea = async (ideaId: string) => {
    if (isWorkingIdea) return
    setIsWorkingIdea(true)
    setError(null)
    try {
      const remaining = ideas.filter((it) => it.id !== ideaId)
      setIdeas(remaining)
      if (activeIdeaId === ideaId) {
        setActiveIdeaId(remaining[0]?.id ?? null)
      }
      const response = await fetch('/api/ideas/generate-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim() || null,
          techStack: techStack.trim() || null,
          difficulty,
          freeText: freeText.trim() || null,
          excludeTitles: remaining.map((it) => it.title),
        }),
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = (await response.json()) as { idea: Idea }
      setIdeas((prev) => {
        const next = [...prev, data.idea].slice(0, 10)
        if (!next.find((idea) => idea.id === activeIdeaId)) {
          setActiveIdeaId(next[0]?.id ?? null)
        }
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed')
    } finally {
      setIsWorkingIdea(false)
    }
  }

  const acceptIdea = async (idea: Idea) => {
    if (isWorkingIdea) return
    if (selectedIdea?.id === idea.id && blueprint) return
    setIsWorkingIdea(true)
    setError(null)
    try {
      const response = await fetch('/api/ideas/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          domain: domain.trim() || null,
          techStack: techStack.trim() || null,
          difficulty,
          freeText: freeText.trim() || null,
        }),
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = (await response.json()) as { blueprint: Blueprint }
      setSelectedIdea(idea)
      setBlueprint(data.blueprint)
      setShareLink(null)
      setHasAcceptedOnce(true)

      if (token) {
        await autosaveSession({
          input: {
            domain: domain.trim() || null,
            techStack: techStack.trim() || null,
            difficulty,
            freeText: freeText.trim() || null,
          },
          ideas,
          selectedIdea: idea,
          blueprint: data.blueprint,
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed')
    } finally {
      setIsWorkingIdea(false)
    }
  }

  const refineBlueprint = async () => {
    if (!blueprint || refineText.trim().length < 3 || isWorkingIdea) return
    setIsWorkingIdea(true)
    setError(null)
    try {
      const response = await fetch('/api/ideas/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint, feedback: refineText.trim() }),
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = (await response.json()) as { blueprint: Blueprint }
      setBlueprint(data.blueprint)
      setRefineText('')
      setShareLink(null)

      if (token && selectedIdea) {
        await autosaveSession({
          input: {
            domain: domain.trim() || null,
            techStack: techStack.trim() || null,
            difficulty,
            freeText: freeText.trim() || null,
          },
          ideas,
          selectedIdea,
          blueprint: data.blueprint,
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refine failed')
    } finally {
      setIsWorkingIdea(false)
    }
  }

  const autosaveSession = async (payload: {
    input: { domain: string | null; techStack: string | null; difficulty: Difficulty; freeText: string | null }
    ideas: Idea[]
    selectedIdea: Idea | null
    blueprint: Blueprint | null
  }) => {
    if (!token || !payload.ideas.length) return
    setSaveStatus('saving')
    const response = await fetch('/api/ideas/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      setSaveStatus('error')
      throw new Error(`Save failed (${response.status})`)
    }
    setSaveStatus('saved')
    await loadSessions()
  }

  const loadSessions = async () => {
    if (!token) return
    const response = await fetch('/api/ideas/sessions', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return
    const data = (await response.json()) as {
      sessions: Array<{ id: string; title?: string | null; input: { domain?: string | null; freeText?: string | null }; updatedAt?: string }>
    }
    setSessions(data.sessions)
  }

  const loadSession = async (sessionId: string) => {
    if (!token) return
    setError(null)
    try {
      const response = await fetch(`/api/ideas/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = (await response.json()) as {
        session: {
          id: string
          input: { domain?: string | null; techStack?: string | null; difficulty: Difficulty; freeText?: string | null }
          ideas: Idea[]
          selectedIdea: Idea | null
          blueprint: Blueprint | null
        }
      }

      setDomain(data.session.input.domain ?? '')
      setTechStack(data.session.input.techStack ?? '')
      setDifficulty(data.session.input.difficulty)
      setFreeText(data.session.input.freeText ?? '')
      setIdeas(data.session.ideas ?? [])
      setActiveIdeaId(data.session.selectedIdea?.id ?? data.session.ideas?.[0]?.id ?? null)
      setSelectedIdea(data.session.selectedIdea)
      setBlueprint(data.session.blueprint)
      setHasAcceptedOnce(Boolean(data.session.blueprint))
      setActiveRecentId(data.session.id)
      setShareLink(null)
      setRefineText('')
      setSaveStatus('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load session')
    }
  }

  const createShareLink = async () => {
    if (!token || !blueprint) return
    const response = await fetch('/api/ideas/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blueprint }),
    })
    if (!response.ok) throw new Error(`Share failed (${response.status})`)
    const data = (await response.json()) as { shareId: string }
    setShareLink(`${window.location.origin}/api/ideas/share/${data.shareId}`)
  }

  useEffect(() => {
    loadSessions().catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const resetChat = () => {
    setDomain('')
    setTechStack('')
    setDifficulty('intermediate')
    setFreeText('')
    setIdeas([])
    setActiveIdeaId(null)
    setSelectedIdea(null)
    setBlueprint(null)
    setRefineText('')
    setShareLink(null)
    setError(null)
    setSaveStatus('idle')
    setActiveRecentId(null)
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f8f8fb] text-zinc-900 dark:bg-[#08050f] dark:text-white">
      <div className="flex h-full">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => {
            const next = !sidebarCollapsed
            setSidebarCollapsed(next)
            localStorage.setItem('sidebarCollapsed', String(next))
          }}
          showRecents={Boolean(token)}
          recents={sessions.map((s) => ({
            id: s.id,
            title: ((s.title || s.input.domain || s.input.freeText || 'Untitled session') as string).toString(),
            updatedAt: s.updatedAt,
          }))}
          activeRecentId={activeRecentId}
          onNewChat={resetChat}
          onSelectRecent={(id) => loadSession(id)}
          userEmail={userEmail}
          onLogout={() => {
            localStorage.removeItem('token')
            resetChat()
          }}
        />

        <div className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_38%_60%_at_45%_0%,rgba(139,92,246,0.08),rgba(0,0,0,0))] dark:bg-[radial-gradient(ellipse_38%_60%_at_45%_0%,rgba(139,92,246,0.18),rgba(0,0,0,0))]" />

          <div className="relative mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 md:px-6">
            <div className="grid gap-5">
              <div className="relative border-b border-white/10 pb-4">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-white/40">IdeaForge</p>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300/70 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </button>
                {!token && (
                  <div className="absolute right-12 top-0 hidden items-center gap-2 md:flex">
                    <Link
                      to="/signin"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                    >
                      <LogIn className="size-4" />
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 ring-1 ring-violet-300 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-400/30 dark:hover:bg-violet-500/30"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
              {!token && (
                <div className="flex items-center justify-center gap-2 md:hidden">
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                  >
                    <LogIn className="size-4" />
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 ring-1 ring-violet-300 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-400/30 dark:hover:bg-violet-500/30"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              <section className="mx-auto w-full max-w-4xl py-2">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-white/45">New session</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
                  What do you want to build?
                </h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-white/60 md:text-base">
                  Describe your intent. We&apos;ll generate a short list of ideas to evaluate.
                </p>

                <div className="mt-8 grid gap-5">
                  <label className="grid gap-2 text-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Main intent</span>
                    <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder="e.g. Help remote teams reduce meeting fatigue with async-first standups"
                      rows={4}
                      className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-400/70 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/35 dark:focus:border-violet-300/60"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Domain</span>
                      <input
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g. productivity, finance, education"
                        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-400/70 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/35 dark:focus:border-violet-300/60"
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Tech stack (optional)</span>
                      <input
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        placeholder="e.g. React, FastAPI, Mongo"
                        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-400/70 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/35 dark:focus:border-violet-300/60"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Difficulty</span>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-violet-400/70 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-violet-300/60"
                    >
                      {difficulties.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                      <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-medium backdrop-blur-3xl dark:bg-gray-950">
                        <button
                          type="button"
                          onClick={generateIdeas}
                          disabled={!canGenerate || isGenerating}
                          className={cn(
                            'inline-flex items-center justify-center gap-2 rounded-full border-[1px] border-input bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent px-8 py-3 text-sm font-semibold text-gray-900 transition-all dark:from-zinc-300/5 dark:via-purple-400/20 dark:text-white',
                            'hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                          )}
                        >
                          <ArrowUp className="size-4" />
                          {isGenerating ? 'Generating…' : 'Generate ideas'}
                        </button>
                      </span>
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                )}
              </section>
            </div>

            <div className="mx-auto grid w-full max-w-4xl content-start gap-5">
              {ideas.length > 0 && !isAcceptedMode && (
                <section className="flex min-h-[560px] flex-col rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-3 border-b border-zinc-200 px-1 pb-3 dark:border-white/10">
                    <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Recommended Ideas</p>
                    <p className="text-sm text-zinc-600 dark:text-white/60">
                      Pick one idea to inspect details. Reject replaces it with a fresh suggestion.
                    </p>
                  </div>

                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {ideas.map((idea, index) => {
                        const isActive = activeIdea?.id === idea.id
                        return (
                          <motion.button
                            key={idea.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            type="button"
                            onClick={() => setActiveIdeaId(idea.id)}
                            className={cn(
                              'group relative min-h-[92px] w-full rounded-2xl border px-4 py-3 pr-24 text-left transition',
                              isActive
                                ? 'border-violet-300/60 bg-violet-50 dark:border-violet-300/50 dark:bg-white/10'
                                : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  'mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                  isActive ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-white/70',
                                )}
                              >
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white/95">{idea.title}</p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600 dark:text-white/65">{idea.problemStatement}</p>
                              </div>
                            </div>
                            <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 group-hover:flex">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  rejectIdea(idea.id)
                                }}
                                disabled={isWorkingIdea || (selectedIdea?.id === idea.id && Boolean(blueprint))}
                                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                              >
                                <X className="size-3" />
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  acceptIdea(idea)
                                }}
                                disabled={isWorkingIdea || (selectedIdea?.id === idea.id && Boolean(blueprint))}
                                className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-violet-500 disabled:opacity-50 dark:bg-violet-200 dark:text-violet-950 dark:hover:bg-violet-100"
                              >
                                <Check className="size-3" />
                                Accept
                              </button>
                            </div>
                          </motion.button>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                </section>
              )}

              {isAcceptedMode && selectedIdea && blueprint && (
              <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03] md:p-6">
                {(
                  <div className="grid gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIdea(null)
                            setBlueprint(null)
                            setRefineText('')
                            setShareLink(null)
                          }}
                          className="text-sm font-semibold text-zinc-600 hover:text-zinc-800 dark:text-white/70 dark:hover:text-white"
                        >
                          ← Go back to ideas
                        </button>
                        <p className="text-xs uppercase tracking-[0.32em] text-zinc-500 dark:text-white/45">Blueprint</p>
                        <h2 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white/95">{selectedIdea.title}</h2>
                        <p className="mt-2 max-w-3xl text-zinc-700 dark:text-white/80">
                          {blueprint.summary}
                        </p>
                        <div className="mt-2 text-xs text-zinc-600 dark:text-white/70">
                          {difficulty} · {domain.trim() ? domain.trim() : 'General domain'}
                        </div>
                      </div>
                      <span className="rounded-md border border-zinc-300/80 bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:border-white/15 dark:bg-white/5 dark:text-white/75">
                        {ideas.length} ideas queued
                      </span>
                    </div>

                    <div className="grid gap-4 text-sm text-zinc-700 dark:text-white/80 lg:grid-cols-[1.2fr_0.8fr]">
                      <section className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-black/20">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Problem</h3>
                        <p className="mt-3 text-zinc-700 dark:text-white/80">
                          {blueprint.problemStatement}
                        </p>
                      </section>
                      <section className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-black/20">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Audience</h3>
                        <ul className="mt-3 space-y-1 text-zinc-700 dark:text-white/80">
                          {blueprint.targetAudience.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <div className="grid gap-3">
                      <section className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-black/20">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Core features</h3>
                        <ul className="mt-3 grid gap-2 text-zinc-700 dark:text-white/80 lg:grid-cols-2">
                          {blueprint.coreFeatures.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="text-zinc-500 dark:text-white/60">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                      <section className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-black/20">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-white/55">Implementation steps</h3>
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 marker:text-zinc-500 dark:text-white/80 dark:marker:text-white/60">
                          {blueprint.implementationSteps.map((step) => (
                            <li key={step}>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </section>
                      <textarea
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        rows={3}
                        placeholder="Refine accepted blueprint: narrower scope, cheaper stack, etc."
                        className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-400/70 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-violet-300/60"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={refineBlueprint}
                          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                        >
                          Refine
                        </button>
                        {token && (
                          <span className="ml-auto text-xs font-semibold text-zinc-500 dark:text-white/60">
                            {saveStatus === 'saving' && 'Saving…'}
                            {saveStatus === 'saved' && 'Saved'}
                            {saveStatus === 'error' && 'Save failed'}
                          </span>
                        )}
                      </div>
                      {shareLink && (
                        <p className="text-sm text-violet-700 dark:text-violet-200">
                          Share URL: <span className="break-all text-violet-800 dark:text-violet-100/90">{shareLink}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

