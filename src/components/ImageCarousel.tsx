'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type Img = { src: string; alt?: string }
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
    // 親のコンテナの最大幅も考慮
    <div className="relative w-full max-w-xl mx-auto overflow-hidden rounded-lg shadow">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {validImages.map((img, i) => (
          // ここを修正: w-full flex-none から w-640px h-480px flex-none などへ
          // Tailwind CSS で直接 px 値を指定できない場合、カスタムCSSで対応
          <div key={i} className="flex-none" style={{ width: '640px', height: '480px' }}>
            <Image
              src={img.src}
              alt={img.alt ?? `slide-${i + 1}`}
              width={640} // Next.js Imageに伝える画像の元の幅
              height={480} // Next.js Imageに伝える画像の元の高さ
              className="object-cover" // 画像のアスペクト比を保ちつつ、コンテナを覆う
              // sizes は画像が画面のどのくらいを占めるかをブラウザに伝えるもので、
              // 今回のように固定サイズなら必須ではないかもしれませんが、置いておいても問題ありません。
              sizes="(max-width: 576px) 100vw, 576px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
