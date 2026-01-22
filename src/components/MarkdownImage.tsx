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
        className="block relative w-full max-w-[800px] mx-auto my-6 cursor-pointer bg-[#222] border border-[#333] hover:border-[var(--accent)] transition-colors group rounded-lg overflow-hidden"
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
            sizes="(max-width: 800px) 100vw, 800px"
            className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
            onError={() => setIsError(true)}
            unoptimized={true}
          />
        ) : (
          <span className="flex items-center justify-center w-full aspect-video text-gray-500 text-sm flex-col gap-2">
            <span className="text-2xl">⚠️</span>
            <span>Image not found</span>
          </span>
        )}
      </span>
      {alt && <span className="block text-center text-sm text-gray-500 mt-2 mb-6">{alt}</span>}
    </>
  )
}
