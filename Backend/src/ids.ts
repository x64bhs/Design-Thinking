import { randomUUID } from 'node:crypto'

export function id(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

