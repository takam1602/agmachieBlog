'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
type Img = { 
    src: string; 
    alt?: string;
    width: number;
    height: number;
}

type Props = { images: Img[]; interval?: number }
export default function ImageCarousel({ images, interval = 4000 }: Props) {
  const validImages = images.filter((i) => i.src)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % validImages.length),
      interval
    )
    return () => clearInterval(id)
  }, [validImages.length, interval])

  return (
    <div className="relative w-full max-w-xl mx-auto overflow-hidden rounded-lg shadow">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >

        {validImages.map((img, i) => (
          <div key={i} className="w-full flex-none flex justify-center items-center">
            <Image
              src={img.src}
              alt={img.alt ?? `slide-${i + 1}`}
              width={640}
              height={480}
              className="max-w-full h-auto object-contain"
              sizes="(max-width: 576px) 100vw, 576px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
} 
