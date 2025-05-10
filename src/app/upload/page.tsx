'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function MultiUpload() {
  const [uploading, setUploading] = useState(false)

  const uploadFiles = async (files: FileList) => {
    setUploading(true)
    for (let file of Array.from(files)) {
      const { error } = await supabase.storage
        .from('ag-photos')
        .upload(`photos/${file.name}`, file, { cacheControl: '3600' })

      if (error) alert('アップロード失敗: ' + file.name)
    }
    setUploading(false)
    alert('全てのアップロードが完了しました。')
  }

  return (
    <div className="p-8">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files)
        }}
      />
      {uploading && <p>アップロード中...</p>}
    </div>
  )
}
