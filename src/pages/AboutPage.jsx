import AboutHero from '../components/About/AboutHero.jsx'
import OurStory from '../components/About/OurStory.jsx'
import Stats from '../components/About/Stats.jsx'
import TeamSection from '../components/About/TeamSection.jsx'
import WhyChooseUs from '../components/Home/WhyChooseUs.jsx'

export default function AboutPage() {
  return (
    <div className="about-page">
      <AboutHero />
      <OurStory />
      <Stats />
      <TeamSection />
    </div>
  )
}