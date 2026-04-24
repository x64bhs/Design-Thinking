import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? '')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const currentHash = window.location.hash
    const activeByHash = items.find((item) => item.url === currentHash)
    if (activeByHash) {
      setActiveTab(activeByHash.name)
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const handleHashChange = () => {
      const updatedHash = window.location.hash
      const item = items.find((navItem) => navItem.url === updatedHash)
      if (item) {
        setActiveTab(item.name)
      }
    }

    handleResize()
    handleHashChange()
    window.addEventListener('resize', handleResize)
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [items])

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:pt-6',
        className,
      )}
    >
      <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white/70 px-0.5 py-0.5 shadow-lg backdrop-blur-lg dark:border-white/15 dark:bg-black/50">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                'relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                'text-gray-700 hover:text-violet-700 dark:text-gray-200 dark:hover:text-violet-300',
                isActive &&
                  'bg-violet-100/90 text-violet-700 shadow-sm ring-1 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-300/30',
              )}
            >
              {isMobile ? <Icon size={18} strokeWidth={2.5} /> : item.name}
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-violet-500/5"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-violet-500">
                    <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-violet-500/20 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-violet-500/20 blur-md" />
                    <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-violet-500/20 blur-sm" />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export type { NavItem }
