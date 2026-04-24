import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Moon, Sparkles, Sun, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Features } from '@/components/features'
import { GetStartedCta } from '@/components/get-started-cta'
import { HeroSection } from '@/components/hero-section'
import { NavBar, type NavItem } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { cn } from '@/lib/utils'

import screenshot from '@/assets/screenshot.png'

const navItems: NavItem[] = [
  { name: 'Home', url: '#home', icon: Home },
  { name: 'Features', url: '#features', icon: Sparkles },
  { name: 'How it works', url: '#how-it-works', icon: WandSparkles },
  { name: 'Get started', url: '#cta', icon: Home },
]

export function HomePage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark =
      storedTheme === 'dark' || (storedTheme === null && prefersDark)

    root.classList.toggle('dark', shouldUseDark)
    setIsDark(shouldUseDark)
  }, [])

  const toggleTheme = () => {
    setIsDark((previous) => {
      const next = !previous
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900 snap-y snap-mandatory dark:bg-black dark:text-white">
      <div className="fixed left-1/2 top-6 z-50 hidden w-[min(96vw,1200px)] -translate-x-1/2 justify-between px-6 sm:flex">
        <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white/70 px-0.5 py-0.5 shadow-lg backdrop-blur-lg dark:border-white/15 dark:bg-black/50">
          <a
            href="#home"
            className="relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-violet-300"
          >
            IdeaForge
          </a>
        </div>
        <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white/70 px-0.5 py-0.5 shadow-lg backdrop-blur-lg dark:border-white/15 dark:bg-black/50">
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'relative cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              'text-gray-700 hover:text-violet-700 dark:text-gray-200 dark:hover:text-violet-300',
              isDark &&
                'bg-violet-100/90 text-violet-700 shadow-sm ring-1 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-300/30',
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
            {isDark && (
              <motion.div
                layoutId="actions-lamp"
                className="absolute inset-0 -z-10 w-full rounded-full bg-violet-500/5"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-violet-500">
                  <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-violet-500/20 blur-md" />
                  <div className="absolute -top-1 h-6 w-8 rounded-full bg-violet-500/20 blur-md" />
                  <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-violet-500/20 blur-sm" />
                </div>
              </motion.div>
            )}
          </button>
          <Link
            to="/signin"
            className="relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-violet-300"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold bg-violet-100/90 text-violet-700 shadow-sm ring-1 ring-violet-300/70 transition-colors hover:bg-violet-200/90 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-300/30 dark:hover:bg-violet-500/30"
          >
            Sign up
          </Link>
        </div>
      </div>
      <NavBar items={navItems} />
      <section id="home" className="min-h-screen snap-start">
        <HeroSection 
          ctaHref="/app" 
          className="min-h-screen" 
          bottomImage={{
            light: screenshot,
            dark: screenshot
          }}
        />
      </section>

      <section id="features" className="min-h-screen snap-start">
        <div className="mx-auto max-w-screen-xl px-4 py-24 md:px-8">
          <Features />
        </div>
      </section>
      <section id="how-it-works" className="min-h-screen snap-start">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
              Describe your intent, evaluate generated ideas quickly, and convert your
              best option into an actionable project blueprint.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 text-left dark:border-white/15 dark:bg-black/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">Step 1</p>
              <h3 className="mt-2 text-lg font-semibold">Describe your goal</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Add your intent, domain, and difficulty to guide idea generation.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 text-left dark:border-white/15 dark:bg-black/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">Step 2</p>
              <h3 className="mt-2 text-lg font-semibold">Curate the idea list</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Accept strong ideas and reject weak ones until one clearly fits.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 text-left dark:border-white/15 dark:bg-black/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">Step 3</p>
              <h3 className="mt-2 text-lg font-semibold">Expand and refine</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Turn accepted ideas into blueprint-level implementation plans.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="cta" className="min-h-screen snap-start">
        <GetStartedCta />
      </section>
      <SiteFooter />
    </main>
  )
}
