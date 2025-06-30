'use client'

import { useEffect } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  /* Esc で閉じる */
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  /* ====================================================================
     外側は **すべてインライン style** にして Tailwind に依存させない
     ==================================================================== */
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,                     // top:0 right:0 bottom:0 left:0
        background: 'rgba(0,0,0,.8)', // 半透明黒
        zIndex: 9999,                 // ほぼ最前面
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}               /* 背景クリックで閉じる */
    >
      {/* 内側は Tailwind で OK */}
      <div
        className="relative w-full h-full animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="close"
          className="absolute -top-4 -right-4 text-white text-3xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* 画面いっぱい (余白 1rem) に収まる fill 画像 */}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain rounded"
          priority
        />
      </div>
    </div>
  )
}
