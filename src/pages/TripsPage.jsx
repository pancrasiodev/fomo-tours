import TripsHero from '../components/Trips/TripsHero.jsx'
import UpcomingTrips from '../components/Trips/UpcomingTrips.jsx'
import PopularDestinations from '../components/Trips/PopularDestinations.jsx'
import WhyChooseUs from '../components/Home/WhyChooseUs.jsx'
import Reviews from '../components/Trips/Reviews.jsx'

export default function TripsPage() {
  return (
    <div className="trips-page">
      <TripsHero />
      <UpcomingTrips />
      <PopularDestinations />
      <WhyChooseUs />
      <Reviews />
    </div>
  )
}