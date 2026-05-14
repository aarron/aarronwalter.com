import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'
import FooterWave from '@/components/FooterWave'
import FlockCanvas from '@/components/FlockCanvas'

export const metadata: Metadata = {
  title: 'Contact — Aarron Walter',
  description: 'Get in touch with Aarron Walter.',
}

export default function ContactPage() {
  return (
    <>
      <article className="page-article">
        <FlockCanvas className="contact-flock-canvas" />
        <header className="page-header contact-page-header">
          <h1 className="page-header-title">Contact</h1>
          <hr className="page-header-rule" />
        </header>

        <div className="page-content">
          <ContactForm />
        </div>
      </article>

      <footer className="site-footer site-footer--light">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
        <div className="footer-inner">
          <span className="t-caption">© {new Date().getFullYear()} <strong className="footer-name">Aarron Walter</strong></span>
          <nav className="footer-links">
            <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">Design Better</a>
            <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
