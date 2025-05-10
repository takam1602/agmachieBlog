'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function Upload() {
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file: File) => {
    setUploading(true)
    const { data, error } = await supabase.storage
      .from('ag-photos')
      .upload(`photos/${file.name}`, file, { cacheControl: '3600' })

    if (error) alert('アップロード失敗: ' + error.message)
    else alert('アップロード成功: ' + file.name)

    setUploading(false)
  }

  return (
    <div className="p-8">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) uploadFile(e.target.files[0])
        }}
      />
      {uploading && <p>アップロード中...</p>}
    </div>
  )
}
