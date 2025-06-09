import Image from 'next/image'

export default function MarkdownImage({
  src,
  alt,
}: {
  src: string
  alt?: string
}) {
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block mx-auto my-4">
      <div className="relative w-full max-w-[640px] aspect-[16/9] overflow-hidden rounded-md shadow">
        <Image
          src={src}
          alt={alt ?? ''}
          width={640}
          height={480}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>
    </a>
  )
}
