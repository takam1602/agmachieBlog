'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import type { Session } from '@supabase/supabase-js'

 export default function Upload() {
  const [session, setSession] = useState<Session | null>(null)
   const [uploading, setUploading] = useState(false)

   useEffect(() => {
     supabase.auth.getSession().then(({ data }) => setSession(data.session))
     const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) =>
       setSession(sess)
     )
     return () => listener.subscription.unsubscribe()
   }, [])
  const uploadFiles = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const { error } = await supabase.storage
        .from('ag-photos')
        .upload(`photos/${file.name}`, file, { cacheControl: '3600' })
      if (error) alert(error.message)
    }
    setUploading(false)
    alert('完了')
  }

  if (!session)
    return (
      <main className="p-8">
        <p>ログインが必要です。</p>
      </main>
    )

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">画像アップロード</h1>
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />
      {uploading && <p>アップロード中…</p>}
    </main>
  )
}


