'use client'

import { useEffect, useRef } from 'react'
import { useLightbox } from './Lightbox'

interface LightboxImageProps {
  src:        string
  alt?:       string
  className?: string
  [key: string]: unknown
}

export default function LightboxImage({
  src,
  alt = '',
  className,
  ...props
}: LightboxImageProps) {
  const ref               = useRef<HTMLImageElement>(null)
  const { register, open } = useLightbox()

  useEffect(() => {
    if (!ref.current) return
    return register({ src, alt, el: ref.current })
  }, [src, alt, register])

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={{ cursor: 'zoom-in' }}
      onClick={() => open(src)}
      draggable={false}
      {...props}
    />
  )
}
