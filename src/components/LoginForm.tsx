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
      <div className="w-full max-w-sm p-8 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">Protected Content</h2>
        <p className="mb-6 text-sm text-gray-400 text-center">
          この記事は保護されています。<br />閲覧するには認証が必要です。
        </p>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full p-2 rounded bg-[#121212] border border-[#333] text-white focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-2 rounded bg-[#121212] border border-[#333] text-white focus:border-[var(--accent)] outline-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--accent)] hover:bg-[#3aa876] text-black font-bold rounded transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
