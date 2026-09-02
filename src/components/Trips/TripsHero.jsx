import './TripsHero.css'

export default function TripsHero() {
  return (
    <section className="tripshero">
      <div className="tripshero__bg" />
      <div className="tripshero__overlay" />
      <div className="tripshero__content">
        <span className="tripshero__badge">Explore Kenya</span>
        <h1 className="tripshero__title">Our Safari Trips</h1>
        <p className="tripshero__desc">
          From the Masai Mara migration to the peaks of Kilimanjaro — find your next Kenyan adventure.
        </p>
      </div>
    </section>
  )
}