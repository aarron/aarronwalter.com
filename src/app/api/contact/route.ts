import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazily instantiated so the build doesn't fail when RESEND_API_KEY is absent
function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
  return new Resend(process.env.RESEND_API_KEY)
}

// Max field lengths — reject absurdly large payloads before processing
const LIMITS: Record<string, number> = {
  name:              120,
  email:             254,
  message:          4000,
  // Guest pitch fields
  guest_name:        120,
  guest_linkedin:    500,
  guest_website:     500,
  guest_topics:     2000,
  guest_fit:        4000,
  // Speaking fields
  event_name:        200,
  event_date:        100,
  event_location:     50,
  event_budget:      100,
  event_description: 4000,
}

// Simple in-process rate limiter: max 3 submissions per IP per hour.
// Resets on cold start — good enough for a low-traffic portfolio site.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

function formatEmail(data: Record<string, string>): string {
  const type = data.type || 'general'

  if (type === 'guest') {
    return `
<strong>Type:</strong> Podcast Guest Pitch<br><br>
<strong>From:</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;<br><br>
<strong>Guest name:</strong> ${esc(data.guest_name)}<br>
<strong>LinkedIn:</strong> ${esc(data.guest_linkedin)}<br>
${data.guest_website ? `<strong>Website:</strong> ${esc(data.guest_website)}<br>` : ''}
<br>
<strong>Topics:</strong><br>${esc(data.guest_topics)}<br><br>
<strong>Why they fit Design Better:</strong><br>${esc(data.guest_fit)}
    `.trim()
  }

  if (type === 'speaking') {
    return `
<strong>Type:</strong> Speaking Engagement<br><br>
<strong>From:</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;<br><br>
<strong>Event:</strong> ${esc(data.event_name)}<br>
<strong>Date:</strong> ${esc(data.event_date)}<br>
<strong>Format:</strong> ${esc(data.event_location)}<br>
${data.event_budget ? `<strong>Budget:</strong> ${esc(data.event_budget)}<br>` : ''}
<br>
<strong>About the event:</strong><br>${esc(data.event_description)}
    `.trim()
  }

  return `
<strong>Type:</strong> General Inquiry<br><br>
<strong>From:</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;<br><br>
<strong>Message:</strong><br>${esc(data.message)}
  `.trim()
}

function confirmationEmail(name: string, type: string): string {
  const typeNote =
    type === 'guest'    ? `<p>I'll take a look at your guest pitch and get back to you if it's a good fit for Design Better.</p>` :
    type === 'speaking' ? `<p>I'll review the details of your event and be in touch about availability.</p>` :
                          `<p>I'll get back to you soon.</p>`

  return `
<p>Hi ${esc(name)},</p>
<p>Thanks for reaching out — your message landed safely.</p>
${typeNote}
<p>— Aarron</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#999">
  <a href="https://aarronwalter.com" style="color:#999">aarronwalter.com</a> ·
  <a href="https://designbetterpodcast.com" style="color:#999">Design Better</a>
</p>
  `.trim()
}

function esc(s: string = ''): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}

export async function POST(req: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let data: Record<string, string>
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // ── Honeypot (server-side re-check) ───────────────────────────────────────
  if (data.website) {
    // Silently succeed — don't tip off the bot
    return NextResponse.json({ ok: true })
  }

  // ── Required fields ───────────────────────────────────────────────────────
  const name  = (data.name  ?? '').trim()
  const email = (data.email ?? '').trim()
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
  }

  // ── Field length limits ───────────────────────────────────────────────────
  for (const [field, max] of Object.entries(LIMITS)) {
    if (data[field] && data[field].length > max) {
      return NextResponse.json({ error: `${field} too long` }, { status: 400 })
    }
  }

  // ── Send via Resend ───────────────────────────────────────────────────────
  const subject =
    data.type === 'guest'    ? `Podcast guest pitch: ${name}` :
    data.type === 'speaking' ? `Speaking inquiry: ${name}` :
                               `Contact form: ${name}`

  try {
    const resend = getResend()

    // Send notification to Aarron
    await resend.emails.send({
      from:    'Aarron Walter <contact@thecuriositydepartment.com>',
      to:      'aarronwalter@gmail.com',
      replyTo: email,
      subject,
      html:    formatEmail(data),
    })

    // Send confirmation to the submitter
    await resend.emails.send({
      from:    'Aarron Walter <contact@thecuriositydepartment.com>',
      to:      email,
      subject: 'Got your message',
      html:    confirmationEmail(name, data.type as string),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] Resend error:', err)
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
