import crypto from 'node:crypto'

import { cookies } from 'next/headers'

const SESSION_COOKIE = 'github_notes_session'
const STATE_COOKIE = 'github_notes_state'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14

export interface GithubNotesUser {
  login: string
  name?: string | null
  avatarUrl?: string | null
}

function getSecret() {
  return process.env.AUTH_SECRET
}

function sign(value: string) {
  const secret = getSecret()
  if (!secret) throw new Error('AUTH_SECRET is not configured.')
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

function encodeSession(user: GithubNotesUser) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = Buffer.from(JSON.stringify({ user, expiresAt })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function decodeSession(value?: string): GithubNotesUser | null {
  if (!value || !getSecret()) return null

  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      user?: GithubNotesUser
      expiresAt?: number
    }
    if (!decoded.user?.login || !decoded.expiresAt) return null
    if (decoded.expiresAt <= Math.floor(Date.now() / 1000)) return null
    return decoded.user
  } catch {
    return null
  }
}

export function getGithubNotesConfigError() {
  if (!process.env.AUTH_SECRET) return 'AUTH_SECRET is required.'
  if (!process.env.GITHUB_CLIENT_ID) return 'GITHUB_CLIENT_ID is required.'
  if (!process.env.GITHUB_CLIENT_SECRET) return 'GITHUB_CLIENT_SECRET is required.'
  if (!process.env.GITHUB_ALLOWED_LOGINS) return 'GITHUB_ALLOWED_LOGINS is required.'
  return null
}

export function getGithubWriteConfigError() {
  if (!process.env.GITHUB_TOKEN) return 'GITHUB_TOKEN is required.'
  if (!process.env.GITHUB_REPO_OWNER) return 'GITHUB_REPO_OWNER is required.'
  if (!process.env.GITHUB_REPO_NAME) return 'GITHUB_REPO_NAME is required.'
  return null
}

export function getAllowedGithubLogins() {
  return new Set(
    (process.env.GITHUB_ALLOWED_LOGINS ?? '')
      .split(',')
      .map((login) => login.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isAllowedGithubLogin(login: string) {
  return getAllowedGithubLogins().has(login.toLowerCase())
}

export async function getGithubNotesUser() {
  const cookieStore = await cookies()
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function createGithubNotesState() {
  const state = crypto.randomBytes(24).toString('base64url')
  const cookieStore = await cookies()
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })
  return state
}

export async function consumeGithubNotesState(state: string) {
  const cookieStore = await cookies()
  const stored = cookieStore.get(STATE_COOKIE)?.value
  cookieStore.delete(STATE_COOKIE)
  return Boolean(stored && stored === state)
}

export async function setGithubNotesSession(user: GithubNotesUser) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  })
}

export async function clearGithubNotesSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
