interface BookFrameProps {
  src: string
  alt: string
  className?: string
}

/**
 * BookFrame — renders a book cover with page edges visible on the
 * right and bottom, suggesting a closed physical book.
 */
export default function BookFrame({ src, alt, className }: BookFrameProps) {
  return (
    <div className={['book-frame', className].filter(Boolean).join(' ')}>
      <img src={src} alt={alt} />
    </div>
  )
}
