import { useEffect } from 'react'

import { AuthSection } from '@/components/auth-section'

type AuthPageProps = {
  mode: 'signin' | 'signup'
}

export function AuthPage({ mode }: AuthPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [mode])

  return (
    <main className="min-h-screen bg-[#0b0713] text-white">
      <AuthSection mode={mode} />
    </main>
  )
}
