import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react'

type AuthMode = 'signin' | 'signup'

type AuthSectionProps = {
  mode?: AuthMode
}

export function AuthSection({ mode: modeProp = 'signin' }: AuthSectionProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>(modeProp)
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    setMode(modeProp)
    setError(null)
    setShowPassword(false)
    if (modeProp === 'signin') {
      setFullName('')
    }
  }, [modeProp])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const setSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    setSize()

    type Particle = { x: number; y: number; speed: number; alpha: number }
    let particles: Particle[] = []
    let raf = 0

    const create = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 0.25 + 0.08,
      alpha: Math.random() * 0.2 + 0.08,
    })

    const init = () => {
      particles = []
      const count = Math.max(25, Math.floor((canvas.width * canvas.height) / 16000))
      for (let i = 0; i < count; i += 1) particles.push(create())
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.y -= p.speed
        if (p.y < 0) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + Math.random() * 10
          p.speed = Math.random() * 0.25 + 0.08
          p.alpha = Math.random() * 0.2 + 0.08
        }
        ctx.fillStyle = `rgba(250,250,250,${p.alpha})`
        ctx.fillRect(p.x, p.y, 0.8, 2.4)
      })
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      setSize()
      init()
    }

    window.addEventListener('resize', onResize)
    init()
    raf = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  const heading = useMemo(
    () =>
      mode === 'signin'
        ? { title: 'Welcome back', subtitle: 'Sign in to continue your learning journey' }
        : { title: 'Create your account', subtitle: 'Start building course projects with IdeaForge' },
    [mode],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint = mode === 'signin' ? '/api/auth/signin' : '/api/auth/signup'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = (await response.json()) as { token?: string; error?: string }
      if (!response.ok || !data.token) {
        throw new Error(data.error || `Authentication failed (${response.status})`)
      }
      localStorage.setItem('token', data.token)
      navigate('/app')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="auth" className="min-h-screen w-full p-0">
      <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,rgba(124,58,237,0.20),rgba(11,7,19,0.94)_60%),linear-gradient(160deg,#0f0a1c_0%,#0c0717_45%,#0b0713_100%)] text-zinc-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_60%_at_50%_18%,rgba(196,181,253,0.14),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:linear-gradient(to_right,rgba(196,181,253,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,181,253,0.18)_1px,transparent_1px)] [background-size:180px_180px]" />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-45 mix-blend-screen"
        />

        <div className="relative grid min-h-screen place-items-center px-4 py-10">
          <div className="w-full max-w-md rounded-2xl border border-violet-400/20 bg-black/40 p-6 shadow-2xl shadow-violet-900/20 backdrop-blur-xl">
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-violet-400/20 bg-[#090612]/80 p-1">
              <Link
                to="/signin"
                className={`rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-violet-200 text-violet-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className={`rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-violet-200 text-violet-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign up
              </Link>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{heading.title}</h3>
              <p className="text-sm text-zinc-400">{heading.subtitle}</p>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Full name</span>
                  <span className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="h-10 w-full rounded-lg border border-violet-400/20 bg-[#0b0713] pl-10 pr-3 text-sm text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-violet-300/40"
                    />
                  </span>
                </label>
              )}

              <label className="grid gap-2 text-sm">
                <span className="text-zinc-300">Email</span>
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-10 w-full rounded-lg border border-violet-400/20 bg-[#0b0713] pl-10 pr-3 text-sm text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-violet-300/40"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-zinc-300">Password</span>
                <span className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-10 w-full rounded-lg border border-violet-400/20 bg-[#0b0713] pl-10 pr-10 text-sm text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-violet-300/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:text-zinc-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              <div className="mt-1 flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-zinc-400">
                  <input type="checkbox" className="size-4 rounded border-zinc-700 bg-zinc-950" />
                  Remember me
                </label>
                <a href="#auth" className="text-zinc-300 hover:text-zinc-100">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-10 rounded-lg bg-violet-200 text-sm font-semibold text-violet-950 transition hover:bg-violet-100"
              >
                {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Continue' : 'Create account'}
              </button>

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            </form>

            <p className="mt-5 text-center text-sm text-zinc-400">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Link
                to={mode === 'signin' ? '/signup' : '/signin'}
                className="font-medium text-zinc-100 hover:underline"
              >
                {mode === 'signin' ? 'Sign up here' : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
