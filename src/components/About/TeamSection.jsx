import './TeamSection.css'

const team = [
  { name: 'Kefas Okaka', role: 'Lead Guide & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { name: 'Amina Wanjiru', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
  { name: 'Peter Kamau', role: 'Senior Safari Guide', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
  { name: 'Grace Achieng', role: 'Guest Experience Lead', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80' },
]

export default function TeamSection() {
  return (
    <section className="team container">
      <div className="team__header">
        <span className="team__badge">Our Team</span>
        <h2 className="team__title">Meet the People Behind Your Safari</h2>
      </div>

      <div className="team__grid">
        {team.map((member, i) => (
          <div key={i} className="team__card">
            <img src={member.image} alt={member.name} className="team__photo" />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}