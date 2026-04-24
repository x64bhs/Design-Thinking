import type { NextFunction, Request, Response } from 'express'

import { getBearerToken, verifyToken } from './auth.js'

export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>

// Ensures thrown/rejected errors from async routes reach Express error middleware
// even in setups where promise rejections aren't automatically forwarded.
export function asyncRoute(handler: AsyncRouteHandler) {
  return function wrapped(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

export function mustGetUserId(req: Request) {
  const token = getBearerToken(req as unknown as { headers: Record<string, unknown> })
  if (!token) {
    throw new ApiError(401, 'Unauthorized')
  }
  try {
    return verifyToken(token).sub
  } catch {
    throw new ApiError(401, 'Unauthorized')
  }
}

