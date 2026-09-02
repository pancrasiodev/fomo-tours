import Hero from '../components/Home/Hero.jsx'
import FeaturedPackages from '../components/Home/FeaturedPackages.jsx'
import WhyChooseUs from '../components/Home/WhyChooseUs.jsx'
import TourDocumentation from '../components/Home/TourDocumentation.jsx'
import HowToBook from '../components/Home/HowToBook.jsx'

export default function HomePage() {
  return (
    <div className="home-page">
      <Hero />
      <FeaturedPackages />
      <WhyChooseUs />
      <TourDocumentation />
      <HowToBook />
    </div>
  )
}