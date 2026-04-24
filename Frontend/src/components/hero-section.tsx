import * as React from 'react'

import { cn } from '@/lib/utils'

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

type RetroGridProps = {
  angle?: number
  cellSize?: number
  opacity?: number
  lightLineColor?: string
  darkLineColor?: string
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.8,
  lightLineColor = 'rgba(0,0,0,0.10)',
  darkLineColor = 'rgba(255,255,255,0.62)',
}: RetroGridProps) => {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--opacity': opacity,
    '--light-line': lightLineColor,
    '--dark-line': darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden [perspective:200px]',
        'opacity-[var(--opacity)] dark:opacity-100',
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))] [backface-visibility:hidden] [transform-style:preserve-3d] [mask-image:linear-gradient(to_bottom,transparent_0,transparent_140px,black_260px)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,transparent_140px,black_260px)]">
        <div className="mix-blend-multiply [backface-visibility:hidden] [filter:blur(0.25px)] [background-image:linear-gradient(to_right,var(--light-line)_0.5px,transparent_0),linear-gradient(to_bottom,var(--light-line)_0.5px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:mix-blend-screen dark:[background-image:linear-gradient(to_right,var(--dark-line)_0.5px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_0.5px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent dark:from-black/25 dark:via-black/10" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      subtitle = {
        regular: 'Turn rough prompts into ',
        gradient: 'buildable project blueprints.',
      },
      description = 'IdeaForge helps you generate practical ideas, reject weak options, and expand the best one into a clear plan with features and implementation steps.',
      ctaText = 'Start generating ideas',
      ctaHref = '#',
      bottomImage = {
        light: 'https://farmui.vercel.app/dashboard-light.png',
        dark: 'https://farmui.vercel.app/dashboard.png',
      },
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('relative overflow-x-clip', className)} ref={ref} {...props}>
        <div className="absolute inset-0 z-[0] bg-purple-950/10 dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <section className="relative z-[1] mx-auto flex min-h-screen max-w-full items-center">
          <RetroGrid {...gridOptions} />
          <div className="z-10 mx-auto flex w-full max-w-screen-xl flex-col gap-12 px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto mt-12 max-w-3xl space-y-5 text-center leading-0 lg:leading-5 md:mt-16">
              <h2 className="mx-auto bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] bg-clip-text text-4xl font-geist tracking-tighter text-transparent dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] md:text-6xl">
                {subtitle.regular}
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-purple-300 dark:to-orange-200">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
                {description}
              </p>
              <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white text-xs font-medium backdrop-blur-3xl dark:bg-gray-950">
                    <a
                      href={ctaHref}
                      className="inline-flex w-full items-center justify-center rounded-full border-[1px] border-input bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent px-10 py-4 text-center text-gray-900 transition-all hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 dark:text-white dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 sm:w-auto"
                    >
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>
            {bottomImage && (
              <div className="relative z-10 mx-auto mt-8 max-w-6xl px-4 md:mt-12">
                <div className="relative border border-black/10 bg-white shadow-2xl transition-all duration-500 dark:border-white/10 dark:bg-zinc-900">
                  <img
                    src={bottomImage.light}
                    className="w-full dark:hidden"
                    alt="App interface preview"
                  />
                  <img
                    src={bottomImage.dark}
                    className="hidden w-full dark:block"
                    alt="App interface preview"
                  />
                  
                  {/* Subtle outer glow for dark mode */}
                  <div className="absolute -inset-1 -z-10 bg-gradient-to-tr from-violet-500/20 via-transparent to-purple-500/20 blur-xl opacity-0 dark:opacity-100" />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = 'HeroSection'

export { HeroSection }
