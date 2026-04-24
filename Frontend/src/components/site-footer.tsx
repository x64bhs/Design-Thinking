export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/70 py-8 dark:border-white/10 dark:bg-black/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-gray-600 dark:text-gray-300 md:flex-row">
        <p>© {new Date().getFullYear()} IdeaForge. Built for learning.</p>
        <div className="flex items-center gap-5">
          <a
            href="#home"
            className="transition-colors hover:text-violet-700 dark:hover:text-violet-300"
          >
            Home
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-violet-700 dark:hover:text-violet-300"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-violet-700 dark:hover:text-violet-300"
          >
            How it works
          </a>
        </div>
      </div>
    </footer>
  )
}
