import './AboutHero.css'

export default function AboutHero() {
  return (
    <section className="aboutHero-wrap">
      <div className="aboutHero__bg" />
      <div className="aboutHero__overlay" />
      <div className="aboutHero container">
        <span className="aboutHero__badge">About FOMO Travel</span>
        <h1 className="aboutHero__title">Rooted in Kenya, Built for Adventure</h1>
        <p className="aboutHero__desc">
          A decade of crafting unforgettable safari experiences across East Africa.
        </p>
      </div>
    </section>
  )
}