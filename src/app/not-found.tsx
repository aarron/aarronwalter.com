'use client'

import FlockCanvas from '@/components/FlockCanvas'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <FlockCanvas className="not-found-flock" centerSpawn />

      <div className="not-found-content">
        <p className="not-found-label">Error</p>
        <h1 className="not-found-title">404</h1>
        <div className="not-found-actions">
          <a href="/" className="not-found-home">
            Go home
          </a>
          <a
            href="mailto:aarronwalter@gmail.com?subject=Broken%20link%20on%20aarronwalter.com&body=Hey%20Aarron%2C%0A%0AI%20found%20a%20broken%20link%20on%20your%20site%3A%0A%0AURL%3A%20"
            className="not-found-report"
          >
            Report broken link
          </a>
        </div>
      </div>
    </div>
  )
}
