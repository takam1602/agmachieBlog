import Image from 'next/image';

export default function MarkdownImage({
  src,
  alt,
}: {
  src: string;
  alt?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={800}
      height={600}
      className="rounded-md shadow my-4"
    />
  );
}
