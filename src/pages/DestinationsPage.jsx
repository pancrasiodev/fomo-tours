import { Link } from 'react-router-dom'
import { KENYA_DESTINATIONS } from '../data/siteData.js'
import PreFooterCta from '../components/Home/PreFooterCta.jsx'
import { usePageSeo } from '../utils/seo.jsx'
import './DestinationsPage.css'

export default function DestinationsPage() {
  usePageSeo({
    title: 'Best Tour Destinations in Kenya | FOMO Tours',
    description:
      'Explore top tour destinations in Kenya: Maasai Mara, Amboseli, Diani Beach, and Rift Valley lakes. Guide advice on park seasons, routes, and wildlife.',
    canonicalPath: '/destinations',
    image: '/images/diani-coast.jpg',
  })

  return (
    <div className="dest-page">
      <section className="dest-catalog">
        <div className="dest-catalog__inner">
          <div className="dest-catalog__header">
            <span className="dest-catalog__eyebrow">DESTINATIONS</span>

            <h1 className="dest-catalog__heading">
              Tour Destinations in Kenya We Know by Heart
            </h1>

            <p className="dest-catalog__sub">
              Discover premier tour destinations in Kenya scouted firsthand by our guides, from golden savanna plains and highland summits to pristine Indian Ocean beach reserves.
            </p>
          </div>

          <div className="dest-catalog__grid">
            {KENYA_DESTINATIONS.map((dest) => (
              <Link
                key={dest.name}
                to={`/trips?destination=${encodeURIComponent(dest.name)}`}
                className="dest-card"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="dest-card__img"
                  loading="lazy"
                />
                <div className="dest-card__scrim" aria-hidden="true" />
                <div className="dest-card__caption">
                  <span className="dest-card__region">{dest.region}</span>
                  <h2 className="dest-card__name">{dest.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PreFooterCta />
    </div>
  )
}
