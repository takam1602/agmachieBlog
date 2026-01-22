'use server'

import { cookies } from 'next/headers'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // 環境変数からクレデンシャルを取得（設定なければデフォルト値）
  const VALID_USER = process.env.AUTH_USER || 'admin'
  const VALID_PASS = process.env.AUTH_PASS || 'password'

  if (username === VALID_USER && password === VALID_PASS) {
    // 認証成功：Cookieをセット
    const cookieStore = await cookies()
    cookieStore.set('auth_token', 'secret_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1週間
      path: '/',
    })
    return { success: true }
  }

  return { success: false, error: 'Invalid username or password' }
}
