'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import ImageLightbox from '@/components/ImageLightbox'

export default function MarkdownImage({ src, alt = '' }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false)
  const [isError, setIsError] = useState(false)

  return (
    <>
      {open &&
        typeof window !== 'undefined' &&
        createPortal(
          <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />,
          document.body,
        )}

      <span
        className="block relative w-full max-w-[1040px] mx-auto my-8 cursor-zoom-in bg-band border border-line hover:border-brand transition-colors group overflow-hidden"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        {!isError ? (
          <Image
            src={src}
            alt={alt}
            width={0}
            height={0}
            sizes="(max-width: 1040px) 100vw, 1040px"
            className="w-full h-auto object-contain"
            onError={() => setIsError(true)}
            unoptimized={true}
          />
        ) : (
          <span className="flex items-center justify-center w-full aspect-video text-ink-3 text-sm flex-col gap-2">
            <span className="text-2xl">⚠️</span>
            <span>Image not found</span>
          </span>
        )}
      </span>
      {alt && <span className="block text-center text-sm text-ink-3 mt-2 mb-6">{alt}</span>}
    </>
  )
}
