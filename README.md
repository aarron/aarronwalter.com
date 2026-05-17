# aarronwalter.com

Personal portfolio and professional site for [Aarron Walter](https://aarronwalter.com) — designer, co-founder of Design Better, and author of *Designing for Emotion*.

Built with **Next.js 16 App Router**, deployed on **Vercel**.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom design system in `globals.css` |
| Fonts | F37 Lineca (display) via local files · Aktiv Grotesk via Adobe Fonts |
| Images | `next/image` with AVIF/WebP auto-format |
| Deployment | Vercel |

## Project structure

```
src/
  app/                      # Next.js App Router pages
    page.tsx                # Home
    about/
    contact/
    listening/
    reading/
    portfolio/
      mailchimp/
      invision/
      rtsl/
      other/                # Consulting + Speaking
      books/
    api/
      book/                 # Now-reading book API route
      record/               # Now-listening record API route
    layout.tsx              # Root layout (logo, nav, lightbox provider)
    globals.css             # All site CSS (design tokens, components, pages)
  components/               # Shared React components
public/
  portfolio/                # All portfolio images and videos (lowercase paths)
    mailchimp/
    invision/
    Other/                  # Testimonial avatars, book covers
    rtsl/
  fonts/                    # F37 Lineca OTF files
  favicon_io/               # Source favicon assets
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Deployment

Push to `master` → Vercel picks it up automatically.

To deploy manually:

```bash
vercel --prod
```

The site is aliased at `aarronwalter-com.vercel.app`. The custom domain `aarronwalter.com` points here via:

- **A record** `@` → `216.150.1.1`
- **CNAME** `www` → `cname.vercel-dns.com`

## Key design decisions

- **CSS custom properties** — `--pf-pad: clamp(1.5rem, 8vw, 7rem)` is the universal horizontal gutter used by the hero, logo, and all portfolio sections to keep everything optically aligned.
- **Lineca optical correction** — `.portfolio-title` uses `transform: translateX(14px)` to compensate for the display font's negative left sidebearing at large sizes without affecting layout or line-wrapping.
- **Asset paths are all lowercase** — Vercel runs Linux (case-sensitive). All files under `public/portfolio/` use lowercase folder and filenames to match the paths in code. macOS hides case mismatches locally.
- **Canvas animations** — `FooterWave` (3 overlapping sine waves), `HeroWaves`, `FlockCanvas`, `TopoCanvas`, and others are `'use client'` components driven by `requestAnimationFrame`.
- **Lightbox** — `LightboxProvider` wraps the page content in `layout.tsx`; individual images opt in via `LightboxImage`.
- **`_archive/`** — gitignored local folder for unused assets that should stay off the deploy but remain accessible on disk.

## Content notes

- Portfolio pages are static, prerendered at build time.
- Interview links on the About page use `href?: string` — omitting `href` renders the entry as plain unlinked text (used for URLs confirmed dead).
