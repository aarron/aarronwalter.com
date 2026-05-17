import Image from 'next/image'

interface BookFrameProps {
  src: string
  alt: string
  className?: string
}

/**
 * BookFrame — renders a book cover with a subtle border and drop-shadow.
 * Uses next/image for automatic format optimisation (AVIF/WebP).
 */
export default function BookFrame({ src, alt, className }: BookFrameProps) {
  return (
    <div className={['book-frame', className].filter(Boolean).join(' ')}>
      <Image
        src={src}
        alt={alt}
        width={400}
        height={560}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}
