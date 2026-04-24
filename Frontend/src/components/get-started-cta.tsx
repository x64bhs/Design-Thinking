import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function GetStartedCta() {
  return (
    <section className="relative flex min-h-screen items-center py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_28%_60%_at_50%_0%,rgba(139,92,246,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_28%_60%_at_50%_0%,rgba(196,181,253,0.2),rgba(255,255,255,0))]" />
      <div className="relative mx-auto max-w-4xl space-y-7 px-6 text-center">
        <p className="text-base font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
          Ready to build faster?
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-5xl">
          Generate your next project idea with IdeaForge
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          Go from vague intent to a practical blueprint with clear features and
          implementation steps.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-medium backdrop-blur-3xl dark:bg-gray-950">
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full border-[1px] border-input bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent px-9 py-3.5 text-center text-base font-semibold text-gray-900 transition-all hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 dark:text-white dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30"
              >
                Start generating
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </span>
          </span>
          <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#D8B4FE_0%,#8B5CF6_50%,#D8B4FE_100%)]" />
            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-medium backdrop-blur-3xl dark:bg-gray-950">
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border-[1px] border-input bg-gradient-to-tr from-zinc-300/20 via-violet-300/30 to-transparent px-9 py-3.5 text-center text-base font-semibold text-gray-900 transition-all hover:from-zinc-300/30 hover:via-violet-300/40 hover:to-transparent dark:from-zinc-300/5 dark:via-violet-300/20 dark:text-white dark:hover:from-zinc-300/10 dark:hover:via-violet-300/30"
              >
                Explore workflow
              </a>
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
