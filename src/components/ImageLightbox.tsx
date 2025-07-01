'use client'

import { useEffect } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt?: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt = '', onClose }: Props) {
  /* Esc で閉じる */
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    /* ── 背景オーバーレイ（クリックで閉じる） ── */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      {/* ── 内側コンテナ ── */}
      <div
        className="relative animate-zoomIn"
        style={{
          width: '90vw',
          height: '90vh',        /* ← ★ 高さを固定 */
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
      >

        <button
          aria-label="close"
          onClick={(e) =>{
              e.stopPropagation()
              onClose()
          }}
          style={{
            position: 'absolute',
            top: '-24px',
            right: '-24px',
            fontSize: '3rem',    /* ≒ text-5xl */
            lineHeight: 1,
            color: '#fff',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {/* 画像本体 */}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain rounded pointer-events-none"
          priority
        />
      </div>
    </div>
  )
}
