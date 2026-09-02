import './ContactHero.css'

export default function ContactHero() {
  return (
    <section className="contactHero-wrap">
      <div className="contactHero__bg" />
      <div className="contactHero__overlay" />
      <div className="contactHero container">
        <span className="contactHero__badge">Get In Touch</span>
        <h1 className="contactHero__title">We'd Love to Hear From You</h1>
        <p className="contactHero__desc">
          Questions about a safari, a custom trip, or just want to say hi? Reach out anytime.
        </p>
      </div>
    </section>
  )
}