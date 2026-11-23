import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllManagedJournals, syncJournalsFromApi } from '../../utils/journalStore.js'
import './JournalSection.css'

export default function JournalSection() {
  const [featured, setFeatured] = useState(() =>
    getAllManagedJournals({ includeDrafts: false }).slice(0, 3)
  )

  useEffect(() => {
    const refresh = () => {
      setFeatured(getAllManagedJournals({ includeDrafts: false }).slice(0, 3))
    }
    syncJournalsFromApi({ includeDrafts: false })
    window.addEventListener('fomo-journals-updated', refresh)
    return () => window.removeEventListener('fomo-journals-updated', refresh)
  }, [])

  return (
    <section className="journal-sec">
      <div className="journal-sec__inner">
        <div className="journal-sec__header">
          <div className="journal-sec__titles">
            <span className="journal-sec__eyebrow">JOURNAL</span>
            <h2 className="journal-sec__heading">Notes from the road</h2>
          </div>

          <Link to="/journal" className="journal-sec__all-btn">
            <span>All stories</span>
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        <div className="journal-sec__grid">
          {featured.map((post) => (
            <Link
              key={post.id || post.slug}
              to={`/journal/${post.slug}`}
              className="journal-card"
            >
              <div className="journal-card__img-wrap">
                <img
                  src={post.image || '/images/diani-coast.jpg'}
                  alt={post.alt || post.title}
                  className="journal-card__img"
                  loading="lazy"
                />
                <span className="journal-card__badge">
                  <span>Read story</span>
                  <ArrowRight size={13} strokeWidth={2} />
                </span>
              </div>

              <div className="journal-card__meta">
                <span>{post.category}</span>
                <span className="journal-card__dot" aria-hidden="true">
                  •
                </span>
                <span>{post.readTime}</span>
              </div>

              <h3 className="journal-card__title">{post.title}</h3>
              <p className="journal-card__excerpt">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
