'use client'

import { useEffect, useState } from 'react'

export type RGB = [number, number, number]

function hexToRgb(hex: string, fallback: RGB): RGB {
  const m = hex.trim().replace('#', '')
  if (m.length === 6) {
    const n = parseInt(m, 16)
    if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  return fallback
}

export interface VizColors {
  paper: string;  paperRGB: RGB
  ink: string;    inkRGB: RGB
  accent: string; accentRGB: RGB
}

/**
 * Read the current palette's data-viz colors from CSS custom properties on
 * <html>. Call inside a canvas effect (re-run it via usePaletteVersion()).
 * Falls back to the Stone palette during SSR / before styles resolve.
 */
export function getVizColors(): VizColors {
  const FB = { paper: '#EAE8E1', ink: '#2A3340', accent: '#2B57E0' }
  let paper = FB.paper, ink = FB.ink, accent = FB.accent
  if (typeof window !== 'undefined') {
    const s = getComputedStyle(document.documentElement)
    paper = s.getPropertyValue('--viz-paper').trim() || FB.paper
    ink = s.getPropertyValue('--viz-ink').trim() || FB.ink
    accent = s.getPropertyValue('--viz-accent').trim() || FB.accent
  }
  return {
    paper, paperRGB: hexToRgb(paper, [234, 232, 225]),
    ink, inkRGB: hexToRgb(ink, [42, 51, 64]),
    accent, accentRGB: hexToRgb(accent, [43, 87, 224]),
  }
}

/**
 * Returns a counter that increments whenever the palette changes. Add it to a
 * canvas effect's dependency array so the effect tears down and re-runs,
 * re-reading getVizColors() with the new palette.
 */
export function usePaletteVersion(): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    const bump = () => setV((x) => x + 1)
    window.addEventListener('palettechange', bump)
    return () => window.removeEventListener('palettechange', bump)
  }, [])
  return v
}
