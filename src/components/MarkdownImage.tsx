'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageLightbox from '@/components/ImageLightbox'

export default function MarkdownImage({
  src,
  alt,
}: {
  src: string
  alt?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <ImageLightbox
          src={src}
          alt={alt ?? ''}
          onClose={() => setOpen(false)}
        />
      )}

      <div
        className="relative w-full max-w-[640px] aspect-[16/9] overflow-hidden rounded-md shadow mx-auto my-4 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt ?? ''}
          width={640}
          height={480}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>
    </>
  )
}
