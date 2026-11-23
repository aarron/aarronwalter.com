import Image from 'next/image'

export interface TestimonialItem {
  quote: string
  name: string
  role?: string
  /** Absolute path from /public, e.g. "/portfolio/mailchimp/todd-dominey.jpg". Without one, initials are shown. */
  avatar?: string
  /** Optional link for the person's name */
  url?: string
}

interface TestimonialPairProps {
  testimonials: [TestimonialItem] | [TestimonialItem, TestimonialItem]
}

const initials = (name: string) => name.split(/\s+/).map(w => w[0]).slice(0, 2).join('')

function Testimonial({ t, divided }: { t: TestimonialItem; divided: boolean }) {
  return (
    <div className={divided ? 'quote-pair__col quote-pair__col--divided' : 'quote-pair__col'}>
      <blockquote className="pf-testimonial__quote">&ldquo;{t.quote}&rdquo;</blockquote>
      <div className="pf-testimonial__attr">
        {t.avatar ? (
          <Image src={t.avatar} alt={t.name} width={56} height={56} className="pf-testimonial__avatar" />
        ) : (
          <span className="pf-testimonial__avatar pf-testimonial__avatar--initials" aria-hidden="true">{initials(t.name)}</span>
        )}
        <span>
          <span className="pf-testimonial__name">
            {t.url ? <a href={t.url} target="_blank" rel="noopener noreferrer">{t.name}</a> : t.name}
          </span>
          {t.role && <span className="pf-testimonial__role">{t.role}</span>}
        </span>
      </div>
    </div>
  )
}

/**
 * TestimonialPair — dark-background quote block with two testimonials side by
 * side, or a single testimonial on its own row.
 */
export default function TestimonialPair({ testimonials }: TestimonialPairProps) {
  return (
    <div className={testimonials.length === 1 ? 'quote-pair quote-pair--solo' : 'quote-pair'}>
      {testimonials.map((t, i) => <Testimonial key={t.name} t={t} divided={i > 0} />)}
    </div>
  )
}
