'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GuestCardProps {
  name: string
  role: string
  image: string
  href: string
}

export default function GuestCard({ name, role, image, href }: GuestCardProps) {
  const [imgError, setImgError] = useState(false)
  const initial = name.charAt(0)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="guest-card"
    >
      <div className="guest-card-img-wrap">
        {imgError ? (
          <div className="guest-card-placeholder">{initial}</div>
        ) : (
          <Image
            src={image}
            alt={name}
            width={600}
            height={600}
            className="guest-card-img"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="guest-card-meta">
        <span className="guest-card-name">{name}</span>
        <span className="guest-card-role t-caption">{role}</span>
      </div>
    </a>
  )
}
