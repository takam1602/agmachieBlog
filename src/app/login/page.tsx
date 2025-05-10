'use client'
import { supabase } from '@/utils/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else setSent(true)
  }

  return (
    <main className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">ログイン</h1>
      {sent ? (
        <p>Magic Link を送信しました。メールを確認してください。</p>
      ) : (
        <>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="border p-2 rounded w-72"
          />
          <button
            onClick={signIn}
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            送信
          </button>
        </>
      )}
      <button
        className="underline"
        onClick={() => router.push('/')}
      >
        戻る
      </button>
    </main>
  )
}
