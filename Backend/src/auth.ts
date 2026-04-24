import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export type JwtPayload = {
  sub: string
  email: string
}

export function signToken(payload: JwtPayload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function getBearerToken(req: { headers: Record<string, unknown> }) {
  const raw = (req.headers['authorization'] ?? '') as string
  const match = raw.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

