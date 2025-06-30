'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import ImageLightbox from '@/components/ImageLightbox'

export default function MarkdownImage({ src, alt = '' }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false)

  // ─── ① open の変化を監視 ──────────────────
  console.log('[MarkdownImage] render', { src, open })

  return (
    <>
      {/* ② Portal が呼ばれた瞬間にログ */}
      {open &&
        typeof window !== 'undefined' &&
        createPortal(
          (() => {
            console.log('[MarkdownImage] createPortal', src)
            return <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />
          })(),
          document.body,
        )}

      <span
        className="block relative w-full max-w-[640px] aspect-[16/9] overflow-hidden rounded-md shadow mx-auto my-4 cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('[MarkdownImage] click', src)   // ③ クリックログ
          setOpen(true)
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={640}
          height={480}
          className="object-cover"
          sizes="(max-width:640px) 100vw, 640px"
        />
      </span>
    </>
  )
}
