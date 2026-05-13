import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'
import FooterWave from '@/components/FooterWave'

export const metadata: Metadata = {
  title: 'Contact — Aarron Walter',
  description: 'Get in touch with Aarron Walter for speaking, guest pitches, or general inquiries.',
}

export default function ContactPage() {
  return (
    <>
      <article>
        <header className="portfolio-header">
          <a href="/" className="portfolio-back t-label">← My work</a>
          <p className="t-label portfolio-eyebrow">Get in Touch</p>
          <h1 className="portfolio-title">Contact</h1>
          <p className="portfolio-roles">Speaking &nbsp;·&nbsp; Guest Pitches &nbsp;·&nbsp; General Inquiries</p>
        </header>

        <div className="portfolio-content">
          <p className="portfolio-lead">
            Choose what brings you here and I&rsquo;ll make sure you&rsquo;re telling me
            what I need to know.
          </p>
          <ContactForm />
        </div>
      </article>

      <footer className="site-footer">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
        <div className="footer-inner">
          <span className="t-caption">© {new Date().getFullYear()} Aarron Walter</span>
          <nav className="footer-links">
            <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">Design Better</a>
            <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
