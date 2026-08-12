'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ExternalLink, X } from 'lucide-react'

interface Props {
  src: string
  alt?: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt = '', onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeydown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeydown)
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        className="relative flex h-[92vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl animate-zoomIn"
        role="dialog"
        aria-modal="true"
        aria-label={alt ? alt + 'の拡大画像' : '拡大画像'}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-white/10 px-4">
          <p className="truncate text-sm text-gray-400">{alt || 'Image preview'}</p>
          <div className="flex items-center gap-1">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="元画像を新しいタブで開く"
            >
              <ExternalLink size={18} />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="画像を閉じる"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="96vw"
            className="object-contain p-2 sm:p-4"
            priority
          />
        </div>
      </div>
    </div>
  )
}
