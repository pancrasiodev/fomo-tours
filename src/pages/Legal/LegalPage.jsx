import { usePageSeo } from '../../utils/seo.jsx'
import './LegalPage.css'

export default function LegalPage({ title, updated, sections }) {
  usePageSeo({
    title: `${title} | FOMO Tours Kenya`,
    description: `Official FOMO Tours ${title}. Read our transparent booking, safari operation, and customer data terms in Nairobi, Kenya.`,
    canonicalPath: typeof window !== 'undefined' ? window.location.pathname : '',
  })

  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero__inner container">
          <h1 className="legal__title">{title}</h1>
          <p className="legal__updated">Last updated: {updated}</p>
        </div>
      </div>

      <div className="legal container">
        <div className="legal__content">
          {sections.map((section, i) => (
            <div key={i} className="legal__section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
