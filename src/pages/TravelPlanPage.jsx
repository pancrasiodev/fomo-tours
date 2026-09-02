import TravelPlanHero from '../components/TravelPlanPage/TravelPlanHero.jsx'
import TravelPlan from '../components/TravelPlanPage/TravelPlan.jsx'
import Process from '../components/TravelPlanPage/Process.jsx'
import WhyChooseUs from '../components/Home/WhyChooseUs.jsx'
import Reviews from '../components/Trips/Reviews.jsx'

export default function TravelPlanPage() {
  return (
    <div className="travelplan">
      <TravelPlanHero />
      <TravelPlan />
      <Process />
      <WhyChooseUs />
      <Reviews />
    </div>
  )
}