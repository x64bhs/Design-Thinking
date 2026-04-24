import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null

export function resolveDbFile() {
  const raw = process.env.DATABASE_FILE || './data/app.db'
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '..', raw)
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const filename = resolveDbFile()
      await mkdir(path.dirname(filename), { recursive: true })
      const db = await open({
        filename,
        driver: sqlite3.Database,
      })
      await db.exec('PRAGMA journal_mode = WAL;')
      await db.exec('PRAGMA foreign_keys = ON;')
      await migrate(db)
      return db
    })()
  }
  return dbPromise
}

async function migrate(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      blueprint_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS idea_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      input_json TEXT NOT NULL,
      ideas_json TEXT NOT NULL,
      selected_idea_json TEXT,
      blueprint_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
}

