'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Props = { images: string[]; interval?: number }

export default function ImageCarousel({ images, interval = 4000 }: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % images.length)
    }, interval)
    return () => clearInterval(id)
  }, [images.length, interval])

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg shadow">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className={`object-cover transition-opacity duration-700 ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
          priority={i === 0}
        />
      ))}
    </div>
  )
}
