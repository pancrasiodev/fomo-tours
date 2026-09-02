import './TravelPlanHero.css'

export default function TravelPlanHero() {
  return (
    <section className="tpHero-wrap">
      <div className="tpHero__bg" />
      <div className="tpHero__overlay" />
      <div className="tpHero container">
        <span className="tpHero__badge">Plan Your Trip</span>
        <h1 className="tpHero__title">Book Your Trip, Plan With AI</h1>
        <p className="tpHero__desc">
          Fill out our trip form, or chat instantly with our AI planner to build
          your perfect Kenyan safari in seconds.
        </p>
      </div>
    </section>
  )
}