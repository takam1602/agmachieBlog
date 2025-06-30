'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  // Esc キーで閉じる
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}          // 背景クリックでも閉じる
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="relative"
        >
          <button
            aria-label="close"
            className="absolute -top-4 -right-4 text-white text-3xl"
            onClick={onClose}
          >
            &times;
          </button>

          <Image
            src={src}
            alt={alt}
            width={1024}
            height={768}
            className="max-h-[80vh] w-auto h-auto rounded"
            priority
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
