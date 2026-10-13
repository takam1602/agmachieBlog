'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions'

export default function LoginForm() {
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    const res = await loginAction(formData)
    if (res.success) {
      router.refresh() // ページをリロードしてコンテンツを表示
    } else {
      setError(res.error || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm border border-line border-t-4 border-t-brand bg-surface p-8">
        <h2 className="mb-6 text-2xl font-bold text-center text-ink">Protected Content</h2>
        <p className="mb-6 text-sm text-ink-2 text-center">
          この記事は保護されています。<br />閲覧するには認証が必要です。
        </p>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full border-2 border-line-strong bg-surface p-2 text-ink outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border-2 border-line-strong bg-surface p-2 text-ink outline-none focus:border-brand"
            />
          </div>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
