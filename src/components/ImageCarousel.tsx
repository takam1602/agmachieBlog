'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

type Img = { src: string; alt?: string; width: number; height: number }

type Props = {
  images: Img[]
  interval?: number
  onImageClick?: (img: Img) => void
}

export default function ImageCarousel({
  images,
  interval = 4000,
  onImageClick,
}: Props) {
  const validImages = images.filter((image) => image.src)
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const go = (direction: 1 | -1) => {
    if (!validImages.length) return
    setIndex((current) => (current + direction + validImages.length) % validImages.length)
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (validImages.length < 2 || userPaused || interacting || reduceMotion) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % validImages.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [interacting, interval, reduceMotion, userPaused, validImages.length])

  if (!validImages.length) return null

  return (
    <div
      className="group relative mx-auto w-full overflow-hidden rounded-xl bg-[#0d0f0e] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      role="region"
      aria-roledescription="carousel"
      aria-label="農業機械フォトギャラリー"
      tabIndex={0}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') go(-1)
        if (event.key === 'ArrowRight') go(1)
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: 'translateX(-' + index * 100 + '%)' }}
      >
        {validImages.map((image, imageIndex) => (
          <button
            key={image.src}
            type="button"
            className="relative aspect-[4/3] w-full flex-none cursor-zoom-in overflow-hidden"
            onClick={() => onImageClick?.(image)}
            aria-label={(image.alt || '農業機械の写真') + 'を拡大表示'}
            aria-hidden={imageIndex !== index}
            tabIndex={imageIndex === index ? 0 : -1}
          >
            <Image
              src={image.src}
              alt={image.alt ?? ''}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none"
              sizes="(max-width: 1024px) 100vw, 700px"
              priority={imageIndex === 0}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 text-left text-xs text-white/80">
              {image.alt}
            </span>
          </button>
        ))}
      </div>

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/55 text-white opacity-90 backdrop-blur-sm transition hover:bg-black/75 focus:opacity-100"
            aria-label="前の写真"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/55 text-white opacity-90 backdrop-blur-sm transition hover:bg-black/75 focus:opacity-100"
            aria-label="次の写真"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-2 py-1.5 backdrop-blur-sm">
            <span className="min-w-9 text-center font-mono text-[10px] text-white/70">
              {index + 1} / {validImages.length}
            </span>
            <button
              type="button"
              onClick={() => setUserPaused((current) => !current)}
              className="grid h-6 w-6 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={userPaused ? '自動再生を再開' : '自動再生を停止'}
              aria-pressed={userPaused}
            >
              {userPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
