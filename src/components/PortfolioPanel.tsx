import LightboxImage from './LightboxImage'

export interface PanelItem {
  src: string
  alt?: string
}

interface PortfolioPanelProps {
  items: PanelItem[]
  className?: string
}

function isVideo(src: string) {
  return /\.(mov|mp4|webm)$/i.test(src)
}

/**
 * PortfolioPanel — white masonry box for screenshots, photos, and video clips.
 * Renders images through the global lightbox; videos autoplay muted and looped.
 * Drop it inside .ds-split__panel or .pf-panel-wrap for consistent spacing.
 */
export default function PortfolioPanel({ items, className }: PortfolioPanelProps) {
  return (
    <div className={['ds-panel', className].filter(Boolean).join(' ')}>
      {items.map((item) =>
        isVideo(item.src) ? (
          <video
            key={item.src}
            src={item.src}
            autoPlay
            muted
            loop
            playsInline
            aria-label={item.alt ?? ''}
          />
        ) : (
          <LightboxImage key={item.src} src={item.src} alt={item.alt ?? ''} />
        )
      )}
    </div>
  )
}
