import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  getAllManagedJournals,
  getManagedJournalBySlug,
  syncJournalsFromApi,
} from '../utils/journalStore.js'
import { getManagedTripBySlug, syncTripsFromApi } from '../utils/tripStore.js'
import { renderLinkedParagraph, usePageSeo } from '../utils/seo.jsx'
import PreFooterCta from '../components/Home/PreFooterCta.jsx'
import './JournalPage.css'

export default function JournalPage() {
  const { slug } = useParams()
  const [posts, setPosts] = useState(() => getAllManagedJournals({ includeDrafts: false }))

  useEffect(() => {
    const refresh = () => {
      setPosts(getAllManagedJournals({ includeDrafts: false }))
    }
    syncJournalsFromApi({ includeDrafts: false })
    syncTripsFromApi({ includeDrafts: false })
    window.addEventListener('fomo-journals-updated', refresh)
    return () => window.removeEventListener('fomo-journals-updated', refresh)
  }, [])

  const activePost = slug ? getManagedJournalBySlug(slug) || posts[0] : null

  const journalSchema = slug && activePost
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activePost.title,
        description: activePost.seoDescription || activePost.excerpt || '',
        image: activePost.image?.startsWith('http')
          ? activePost.image
          : `https://lanycakes.co.ke${activePost.image?.startsWith('/') ? activePost.image : `/${activePost.image}`}`,
        datePublished: '2026-01-15T08:00:00+03:00',
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'Lany Cake Shop',
          url: 'https://lanycakes.co.ke',
        },
        publisher: {
          '@type': 'Bakery',
          name: 'Lany Cake Shop',
          url: 'https://lanycakes.co.ke',
          logo: {
            '@type': 'ImageObject',
            url: 'https://lanycakes.co.ke/images/lany/lany-official-logo.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://lanycakes.co.ke/blog/${slug}`,
        },
      }
    : null

  const rawPostTitle = activePost?.seoTitle?.trim() || activePost?.title || 'Blog'
  const shortPostTitle = rawPostTitle.length > 44 ? `${rawPostTitle.slice(0, 43).trim()}…` : rawPostTitle

  usePageSeo({
    title: slug
      ? `${shortPostTitle} | Lany Cakes`
      : 'Cake Blog & Baking Guides Nairobi | Lany Cakes',
    description: slug
      ? activePost?.seoDescription?.trim() || activePost?.excerpt || ''
      : 'Read cake ordering guides, birthday cake flavor pairings, and celebration tips from Lany Cake Shop in Nairobi and Ruiru.',
    canonicalPath: slug ? `/blog/${slug}` : '/blog',
    image: activePost?.image || '/images/lany/birthday-cakes.webp',
    ogType: slug ? 'article' : 'website',
    schema: journalSchema,
  })

  if (slug) {
    const post = activePost
    if (!post) return null

    const paragraphs =
      Array.isArray(post.body) && post.body.length > 0
        ? post.body
        : post.bodyText
          ? String(post.bodyText)
              .split(/\n\s*\n/)
              .filter(Boolean)
          : []

    const relatedTrip = post.relatedTripSlug
      ? getManagedTripBySlug(post.relatedTripSlug)
      : null

    return (
      <div className="journal-page">
        <article className="journal-article">
          <div className="journal-article__inner">
            <Link to="/blog" className="journal-article__back">
              <ArrowLeft size={15} strokeWidth={2} />
              <span>All articles</span>
            </Link>

            <div className="jpost-card__meta journal-article__meta">
              <span>{post.category}</span>
              <span aria-hidden="true">•</span>
              <span>{post.readTime}</span>
            </div>

            <h1 className="journal-article__title">{post.title}</h1>
            <p className="journal-article__lead">{post.excerpt}</p>

            <div className="journal-article__hero">
              <img
                src={post.image || '/images/diani-coast.jpg'}
                alt={post.alt || post.title}
              />
            </div>

            <div className="journal-article__body">
              {paragraphs.map((para, i) => renderLinkedParagraph(para, i))}
            </div>

            {relatedTrip && (
              <Link
                to={`/trips/${relatedTrip.slug}`}
                className="journal-related-trip"
              >
                <div className="journal-related-trip__img">
                  <img
                    src={relatedTrip.image || '/images/wildbeast.webp'}
                    alt={relatedTrip.title}
                    loading="lazy"
                  />
                </div>
                <div>
                  <span className="journal-related-trip__eyebrow">
                    FEATURED ROUTE IN THIS STORY
                  </span>
                  <h3 className="journal-related-trip__title">
                    {relatedTrip.title}
                  </h3>
                  <div className="journal-related-trip__sub">
                    {relatedTrip.duration} · from {relatedTrip.price} per person
                  </div>
                </div>
                <span className="journal-related-trip__cta">
                  <span>View trip</span>
                  <ArrowRight size={13} />
                </span>
              </Link>
            )}
          </div>
        </article>

        <PreFooterCta />
      </div>
    )
  }

  return (
    <div className="journal-page">
      <section className="journal-catalog">
        <div className="journal-catalog__inner">
          <div className="journal-catalog__header">
            <span className="journal-catalog__eyebrow">LANY CAKES BLOG</span>

            <h1 className="journal-catalog__heading">
              Lany Cake Shop Blog &amp; Celebration Guides
            </h1>

            <p className="journal-catalog__sub">
              Practical cake sizing guides, Nairobi &amp; Ruiru flavor pairings, and celebration planning tips from Head Baker Carol Jenny.
            </p>
          </div>

          <div className="journal-catalog__grid">
            {posts.map((post) => (
              <Link
                key={post.id || post.slug}
                to={`/blog/${post.slug}`}
                className="jpost-card"
              >
                <div className="jpost-card__img-wrap">
                  <img
                    src={post.image || '/images/diani-coast.jpg'}
                    alt={post.alt || post.title}
                    className="jpost-card__img"
                    loading="lazy"
                  />
                  <span className="jpost-card__badge">
                    <span>Read story</span>
                    <ArrowRight size={13} strokeWidth={2} />
                  </span>
                </div>

                <div className="jpost-card__meta">
                  <span>{post.category}</span>
                  <span aria-hidden="true">•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="jpost-card__title">{post.title}</h2>
                <p className="jpost-card__excerpt">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PreFooterCta />
    </div>
  )
}
