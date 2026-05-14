import crypto from 'node:crypto'

const TOKEN_VERSION = 'v1'
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7

function getAuthSecret() {
  return process.env.AUTH_SECRET
}

export function getAuthConfigError() {
  if (!process.env.AUTH_USER || !process.env.AUTH_PASS || !getAuthSecret()) {
    return 'AUTH_USER, AUTH_PASS, and AUTH_SECRET must be configured.'
  }
  return null
}

export function validateCredentials(username: string, password: string) {
  const configError = getAuthConfigError()
  if (configError) return false

  const expectedUser = process.env.AUTH_USER as string
  const expectedPass = process.env.AUTH_PASS as string

  const user = Buffer.from(username)
  const expectedUserBuffer = Buffer.from(expectedUser)
  const pass = Buffer.from(password)
  const expectedPassBuffer = Buffer.from(expectedPass)

  return (
    user.length === expectedUserBuffer.length &&
    pass.length === expectedPassBuffer.length &&
    crypto.timingSafeEqual(user, expectedUserBuffer) &&
    crypto.timingSafeEqual(pass, expectedPassBuffer)
  )
}

function sign(payload: string) {
  const secret = getAuthSecret()
  if (!secret) throw new Error('AUTH_SECRET is not configured.')
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createAuthToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + WEEK_IN_SECONDS
  const payload = `${TOKEN_VERSION}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

export function verifyAuthToken(token?: string) {
  if (!token || !getAuthSecret()) return false

  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) return false

  const payload = `${parts[0]}.${parts[1]}`
  const expected = sign(payload)
  const actual = parts[2]

  if (
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  ) {
    return false
  }

  const expiresAt = Number(parts[1])
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000)
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: WEEK_IN_SECONDS,
  path: '/',
}
