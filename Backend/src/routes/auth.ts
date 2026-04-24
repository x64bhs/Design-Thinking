import { Router } from 'express'
import bcrypt from 'bcryptjs'

import { authCredentialsSchema } from '../contracts.js'
import { getDb } from '../db.js'
import { ApiError, asyncRoute } from '../http.js'
import { id } from '../ids.js'
import { signToken } from '../auth.js'

export const authRouter = Router()

authRouter.post('/signup', asyncRoute(async (req, res) => {
  const parsed = authCredentialsSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid input')
  }
  const { email, password } = parsed.data
  const db = await getDb()

  const existing = await db.get<{ id: string }>(
    'SELECT id FROM users WHERE email = ?',
    email.toLowerCase(),
  )
  if (existing) {
    throw new ApiError(409, 'Email already in use')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const userId = id('usr')
  await db.run(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES (?,?,?,?)',
    userId,
    email.toLowerCase(),
    passwordHash,
    new Date().toISOString(),
  )

  const token = signToken({ sub: userId, email: email.toLowerCase() })
  return res.json({ token, user: { id: userId, email: email.toLowerCase() } })
}))

authRouter.post('/signin', asyncRoute(async (req, res) => {
  const parsed = authCredentialsSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid input')
  }
  const { email, password } = parsed.data
  const db = await getDb()

  const user = await db.get<{ id: string; email: string; password_hash: string }>(
    'SELECT id, email, password_hash FROM users WHERE email = ?',
    email.toLowerCase(),
  )
  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const token = signToken({ sub: user.id, email: user.email })
  return res.json({ token, user: { id: user.id, email: user.email } })
}))

