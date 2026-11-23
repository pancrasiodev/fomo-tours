import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '../../data/cakesData';
import './CeoStory.css';

export default function CeoStory() {
  const { ceo, stats } = BUSINESS_INFO;

  return (
    <section className="lany-section lany-story-section">
      <div className="lany-container">
        <div className="story-grid">
          <div className="story-media">
            <div className="story-img-container">
              <img 
                src={ceo.image} 
                alt={`${ceo.name} - ${ceo.title} Lany Cake Shop`}
                className="story-portrait" 
                loading="lazy"
              />
              <div className="story-badge">
                <span className="badge-name">{ceo.name}</span>
                <span className="badge-role">{ceo.title}</span>
              </div>
            </div>
          </div>

          <div className="story-content">
            <span className="section-sub-badge">Behind the Bakes</span>
            <h2 className="section-title">Good Food For Your All Day Good Mood</h2>
            
            <p className="story-paragraph">
              {ceo.bio}
            </p>

            <p className="story-paragraph">
              With a focus on creativity and quality, Lany Cakes began crafting birthday cakes, wedding cakes, and custom cakes that not only taste amazing but also stand out in design. Each cake is made with care, attention to detail, and a deep understanding of what customers truly want.
            </p>

            <div className="story-signature-wrap">
              <img src={ceo.signature} alt="Carol Jenny Signature" className="story-sig-img" />
              <div className="story-sig-info">
                <strong>Carol Jenny</strong>
                <span>CEO, Lany Cake Shop / CJ Cakes</span>
              </div>
            </div>

            <div className="story-stats-grid">
              {stats.map((s, idx) => (
                <div key={idx} className="story-stat-card">
                  <span className="stat-val">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
