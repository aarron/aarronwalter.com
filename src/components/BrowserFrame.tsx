interface BrowserFrameProps {
  children: React.ReactNode
  className?: string
}

/**
 * BrowserFrame — a minimal line-drawing browser chrome that wraps any
 * image or video. Adapts to whatever width its container provides.
 */
export default function BrowserFrame({ children, className }: BrowserFrameProps) {
  return (
    <div className={['browser-frame', className].filter(Boolean).join(' ')}>
      {/* Chrome bar */}
      <div className="browser-frame__chrome" aria-hidden="true">
        <div className="browser-frame__dots">
          <svg width="46" height="10" viewBox="0 0 46 10" fill="none">
            <circle cx="5"  cy="5" r="4" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="23" cy="5" r="4" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="41" cy="5" r="4" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </div>
        <div className="browser-frame__url" />
      </div>

      {/* Content */}
      <div className="browser-frame__content">
        {children}
      </div>
    </div>
  )
}
