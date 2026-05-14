'use server'

import { cookies } from 'next/headers'
import {
  authCookieOptions,
  createAuthToken,
  getAuthConfigError,
  validateCredentials,
} from '@/utils/auth'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const configError = getAuthConfigError()
  if (configError) {
    return { success: false, error: configError }
  }

  if (validateCredentials(username, password)) {
    const cookieStore = await cookies()
    cookieStore.set('auth_token', createAuthToken(), authCookieOptions)
    return { success: true }
  }

  return { success: false, error: 'Invalid username or password' }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
