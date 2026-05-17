'use client'

import {
  createContext, useCallback, useContext, useEffect,
  useRef, useState, ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

/* ─── Types ──────────────────────────────────────────── */

export interface LbItem {
  src:  string
  alt:  string
  el:   HTMLImageElement
}

interface LbCtx {
  register: (item: LbItem) => () => void
  open:     (src: string)  => void
}

/* ─── Context ────────────────────────────────────────── */

const Ctx = createContext<LbCtx | null>(null)

export function useLightbox() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useLightbox must be inside LightboxProvider')
  return c
}

/* ─── FLIP helpers ───────────────────────────────────── */

function getStartTransform(originRect: DOMRect, el: HTMLImageElement): string {
  const natW = el.naturalWidth  || el.offsetWidth
  const natH = el.naturalHeight || el.offsetHeight
  if (!natW || !natH) return 'scale(0.85)'

  const maxW  = window.innerWidth  * 0.88
  const maxH  = window.innerHeight * 0.88
  const ratio = natW / natH
  let dW = natW, dH = natH
  if (dW > maxW) { dW = maxW; dH = maxW / ratio }
  if (dH > maxH) { dH = maxH; dW = maxH * ratio }

  const thumbCX = originRect.left + originRect.width  / 2
  const thumbCY = originRect.top  + originRect.height / 2
  const winCX   = window.innerWidth  / 2
  const winCY   = window.innerHeight / 2

  const tx    = thumbCX - winCX
  const ty    = thumbCY - winCY
  const scale = originRect.width / dW

  return `translate(${tx}px,${ty}px) scale(${scale})`
}

/* ─── Provider ───────────────────────────────────────── */

export function LightboxProvider({ children }: { children: ReactNode }) {
  const items   = useRef<LbItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [open,    setOpen]    = useState(false)
  // phase drives the CSS classes: 'enter' = starting transform, 'idle' = final, 'exit' = back
  const [phase,   setPhase]   = useState<'enter' | 'idle' | 'exit'>('idle')
  const [idx,     setIdx]     = useState(0)
  const [zoom,    setZoom]    = useState(1)
  const [pan,     setPan]     = useState({ x: 0, y: 0 })

  const lbImgRef      = useRef<HTMLImageElement>(null)
  const startXformRef = useRef('')
  const dragging      = useRef(false)
  const dragStart     = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const didDrag       = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  /* register / unregister a thumbnail */
  const register = useCallback((item: LbItem) => {
    items.current = [...items.current, item]
    return () => {
      items.current = items.current.filter(i => i !== item)
    }
  }, [])

  /* open */
  const doOpen = useCallback((src: string) => {
    const i = items.current.findIndex(it => it.src === src)
    if (i === -1) return
    const rect = items.current[i].el.getBoundingClientRect()
    startXformRef.current = getStartTransform(rect, items.current[i].el)
    setIdx(i)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setOpen(true)
    setPhase('enter')
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase('idle'))
    )
  }, [])

  /* close — FLIP back to thumbnail */
  const doClose = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    const item = items.current[idx]
    if (item) {
      const rect = item.el.getBoundingClientRect()
      startXformRef.current = getStartTransform(rect, item.el)
    }
    setPhase('exit')
    setTimeout(() => { setOpen(false); setPhase('idle') }, 360)
  }, [idx])

  /* navigate prev / next */
  const go = useCallback((dir: 1 | -1) => {
    setIdx(prev => {
      const next = (prev + dir + items.current.length) % items.current.length
      const rect = items.current[next].el.getBoundingClientRect()
      startXformRef.current = getStartTransform(rect, items.current[next].el)
      return next
    })
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setPhase('enter')
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase('idle'))
    )
  }, [])

  /* keyboard */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     doClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, doClose, go])

  /* scroll lock */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* derived image transform */
  const imgTransform = (() => {
    if (zoom > 1) return `scale(${zoom}) translate(${pan.x}px,${pan.y}px)`
    if (phase === 'enter' || phase === 'exit') return startXformRef.current
    return 'scale(1) translate(0px,0px)'
  })()

  const imgTransition = zoom > 1
    ? 'none'
    : 'transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease'

  const current = items.current[idx]

  const overlay = open && mounted ? createPortal(
    <div
      className={`lb-backdrop lb-backdrop--${phase}`}
      onClick={zoom > 1 ? undefined : doClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close */}
      <button className="lb-close" onClick={doClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
          stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <line x1="1" y1="1" x2="17" y2="17" />
          <line x1="17" y1="1" x2="1"  y2="17" />
        </svg>
      </button>

      {/* Prev */}
      {items.current.length > 1 && (
        <button
          className="lb-arrow lb-arrow--prev"
          onClick={e => { e.stopPropagation(); go(-1) }}
          aria-label="Previous image"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="14 18 8 11 14 4" />
          </svg>
        </button>
      )}

      {/* Image stage — click stops backdrop close */}
      <div className="lb-stage" onClick={e => e.stopPropagation()}>
        <img
          ref={lbImgRef}
          key={current?.src}        /* re-mount on navigate so opacity resets */
          src={current?.src}
          alt={current?.alt ?? ''}
          className={`lb-img lb-img--${phase}`}
          draggable={false}
          style={{
            transform: imgTransform,
            transition: imgTransition,
            cursor: zoom > 1
              ? (dragging.current ? 'grabbing' : 'grab')
              : 'zoom-in',
          }}
          onClick={e => {
            if (didDrag.current) { didDrag.current = false; return }
            if (zoom > 1) { setZoom(1); setPan({ x: 0, y: 0 }); return }
            /* zoom into click position */
            const rect = lbImgRef.current!.getBoundingClientRect()
            const pX = e.clientX - (rect.left + rect.width  / 2)
            const pY = e.clientY - (rect.top  + rect.height / 2)
            const z  = 2.8
            setZoom(z)
            setPan({ x: -pX * (1 - 1 / z), y: -pY * (1 - 1 / z) })
          }}
          onMouseDown={e => {
            if (zoom <= 1) return
            e.preventDefault()
            dragging.current  = true
            didDrag.current   = false
            dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
          }}
          onMouseMove={e => {
            if (!dragging.current) return
            didDrag.current = true
            setPan({
              x: dragStart.current.px + (e.clientX - dragStart.current.mx) / zoom,
              y: dragStart.current.py + (e.clientY - dragStart.current.my) / zoom,
            })
          }}
          onMouseUp={()    => { dragging.current = false }}
          onMouseLeave={()  => { dragging.current = false }}
        />
      </div>

      {/* Next */}
      {items.current.length > 1 && (
        <button
          className="lb-arrow lb-arrow--next"
          onClick={e => { e.stopPropagation(); go(1) }}
          aria-label="Next image"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 4 14 11 8 18" />
          </svg>
        </button>
      )}

      {/* Counter + caption */}
      <div className="lb-footer">
        {current?.alt && (
          <p className="lb-caption">{current.alt}</p>
        )}
        {items.current.length > 1 && (
          <p className="lb-counter">{idx + 1} / {items.current.length}</p>
        )}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <Ctx.Provider value={{ register, open: doOpen }}>
      {children}
      {overlay}
    </Ctx.Provider>
  )
}
