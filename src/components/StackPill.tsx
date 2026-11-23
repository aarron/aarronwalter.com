import {
  siAnthropic, siCalendly, siClaude, siCloudflare, siCloudflareworkers, siDrizzle, siFlask, siGhost,
  siGooglecalendar, siGooglegemini, siModelcontextprotocol, siNeon, siNextdotjs, siObsidian, siPaypal,
  siPerplexity, siPuppeteer, siPython, siRaspberrypi, siReact, siResend, siSentry, siSharp, siStripe,
  siSubstack, siTailwindcss, siTypescript, siVercel, siYoutube, siZod, siDiscogs, siMusicbrainz, siSpotify,
} from 'simple-icons'

// Brand marks from Simple Icons, keyed by the names used in src/data/projects.ts.
// Tools without a mark (Slack, Twilio and OpenAI withdrew theirs) show the name alone.
const ICONS: Record<string, { path: string }> = {
  'Next.js': siNextdotjs, React: siReact, TypeScript: siTypescript, 'Tailwind CSS': siTailwindcss,
  'Neon Postgres': siNeon, Drizzle: siDrizzle, Zod: siZod, Sharp: siSharp, Vercel: siVercel,
  'Vercel Blob': siVercel, Sentry: siSentry, 'Cloudflare Workers': siCloudflareworkers,
  'Cloudflare Tunnel': siCloudflare, Claude: siClaude, Anthropic: siAnthropic, Gemini: siGooglegemini,
  Perplexity: siPerplexity, Stripe: siStripe, Resend: siResend, 'Google Calendar': siGooglecalendar,
  Calendly: siCalendly, PayPal: siPaypal, Substack: siSubstack, YouTube: siYoutube, MCP: siModelcontextprotocol,
  Python: siPython, Flask: siFlask, 'Raspberry Pi': siRaspberrypi, Obsidian: siObsidian, Puppeteer: siPuppeteer,
  Ghost: siGhost, Discogs: siDiscogs, MusicBrainz: siMusicbrainz, Spotify: siSpotify,
}

export default function StackPill({ name }: { name: string }) {
  const icon = ICONS[name]
  return (
    <li className="stack-pill">
      {icon && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={icon.path} />
        </svg>
      )}
      {name}
    </li>
  )
}
