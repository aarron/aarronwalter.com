import Image from 'next/image'

export interface TestimonialItem {
  quote: string
  name: string
  role: string
  /** Absolute path from /public, e.g. "/portfolio/mailchimp/todd-dominey.jpg" */
  avatar: string
}

interface TestimonialPairProps {
  testimonials: [TestimonialItem, TestimonialItem]
}

/**
 * TestimonialPair — dark-background quote block with two testimonials side by side.
 * Always takes exactly two testimonials.
 */
export default function TestimonialPair({ testimonials }: TestimonialPairProps) {
  const [first, second] = testimonials
  return (
    <div className="quote-pair">
      <div className="quote-pair__col">
        <p className="pf-testimonial__quote">&ldquo;{first.quote}&rdquo;</p>
        <div className="pf-testimonial__attr">
          <Image
            src={first.avatar}
            alt={first.name}
            width={56}
            height={56}
            className="pf-testimonial__avatar"
          />
          <span>
            <span className="pf-testimonial__name">{first.name}</span>
            <span className="pf-testimonial__role">{first.role}</span>
          </span>
        </div>
      </div>
      <div className="quote-pair__col quote-pair__col--divided">
        <p className="pf-testimonial__quote">&ldquo;{second.quote}&rdquo;</p>
        <div className="pf-testimonial__attr">
          <Image
            src={second.avatar}
            alt={second.name}
            width={56}
            height={56}
            className="pf-testimonial__avatar"
          />
          <span>
            <span className="pf-testimonial__name">{second.name}</span>
            <span className="pf-testimonial__role">{second.role}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
