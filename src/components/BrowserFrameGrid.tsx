interface BrowserFrameGridProps {
  children: React.ReactNode
  /** Use 'stack' for single-column stacked layout instead of 2-col grid */
  layout?: 'grid' | 'stack'
  className?: string
}

/**
 * BrowserFrameGrid — wraps BrowserFrame children in a 2-column grid
 * or a single-column stack. Use inside .pf-panel-wrap for consistent padding.
 */
export default function BrowserFrameGrid({
  children,
  layout = 'grid',
  className,
}: BrowserFrameGridProps) {
  const cls = layout === 'stack' ? 'browser-frame-stack' : 'browser-frame-grid'
  return (
    <div className={[cls, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
