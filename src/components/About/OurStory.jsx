import './OurStory.css'

export default function OurStory() {
  return (
    <section className="story container">
      <div className="story__grid">
        <img
          src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=900&q=80"
          alt="FOMO Travel safari guides"
          className="story__image"
        />
        <div className="story__content">
          <span className="story__badge">Our Story</span>
          <h2 className="story__title">A Decade of Safari Storytelling</h2>
          <p className="story__text">
            FOMO Travel started with a simple idea: everyone deserves to witness Kenya's
            wild heart up close. What began as a small team of Nairobi-based guides has
            grown into a trusted safari operator serving travelers from around the world.
          </p>
          <p className="story__text">
            We believe great safaris are built on local expertise, small groups, and
            genuine care for both our guests and the land we explore.
          </p>
        </div>
      </div>
    </section>
  )
}