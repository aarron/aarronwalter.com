import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

// Load fonts once at module level — cached for the lifetime of the process
const linecaRegular = readFileSync(join(process.cwd(), 'public/fonts/lineca-regular.otf'))
const linecaMedium  = readFileSync(join(process.cwd(), 'public/fonts/lineca-medium.otf'))

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title       = searchParams.get('title')       ?? 'Aarron Walter'
  const description = searchParams.get('description') ?? ''

  // Scale font size down for long titles so they stay on one line
  const titleSize =
    title.length > 28 ? 64 :
    title.length > 18 ? 76 :
    88

  return new ImageResponse(
    (
      <div
        style={{
          background: '#2C2A2A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
        }}
      >
        {/* Top: brand label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '3px',
              background: '#FF4725',
              borderRadius: '2px',
            }}
          />
          <span
            style={{
              fontFamily: 'Lineca',
              fontWeight: 500,
              color: '#FF4725',
              fontSize: '16px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Aarron Walter
          </span>
        </div>

        {/* Center: title + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontFamily: 'Lineca',
              fontWeight: 400,
              color: '#F3E7D6',
              fontSize: `${titleSize}px`,
              letterSpacing: '-0.03em',
              lineHeight: '0.92',
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontFamily: 'Lineca',
                fontWeight: 400,
                color: 'rgba(243, 231, 214, 0.50)',
                fontSize: '22px',
                lineHeight: '1.45',
                maxWidth: '700px',
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            fontFamily: 'Lineca',
            fontWeight: 400,
            color: 'rgba(243, 231, 214, 0.28)',
            fontSize: '18px',
            letterSpacing: '0.04em',
          }}
        >
          aarronwalter.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Lineca', data: linecaRegular, style: 'normal', weight: 400 },
        { name: 'Lineca', data: linecaMedium,  style: 'normal', weight: 500 },
      ],
    }
  )
}
