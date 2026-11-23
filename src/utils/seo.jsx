import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * usePageSeo: updates document.title, meta description, Open Graph tags, Twitter cards,
 * canonical link, robots indexability, and Schema.org JSON-LD structured data.
 */
export function usePageSeo({
  title,
  description,
  keywords,
  canonicalPath,
  image,
  ogType = 'website',
  noindex = false,
  schema,
}) {
  useEffect(() => {
    const siteDomain = 'https://lanycakes.co.ke'
    const defaultImage = `${siteDomain}/images/lany/birthday-cakes.webp`
    const resolvedImage = image
      ? (image.startsWith('http') ? image : `${siteDomain}${image.startsWith('/') ? image : `/${image}`}`)
      : defaultImage

    // 1. Document Title
    if (title) {
      document.title = title
    }

    // 2. Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // 2b. Meta Keywords (Primary + Secondary Target Phrases)
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      const keywordsContent = Array.isArray(keywords) ? keywords.join(', ') : keywords
      metaKeywords.setAttribute('content', keywordsContent)
    }

    // 3. Robots Meta Tag (Enforce index, follow for public pages, noindex for private/admin)
    let robotsMeta = document.querySelector('meta[name="robots"]')
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow')

    // 4. Canonical Tag
    if (canonicalPath !== undefined) {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
      canonical.setAttribute('href', `${siteDomain}${cleanPath === '/' ? '' : cleanPath}`)
    }

    // Helper for setting meta property/name
    const setMetaTag = (attribute, name, content) => {
      let tag = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attribute, name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    // 5. Open Graph Meta Tags
    if (title) setMetaTag('property', 'og:title', title)
    if (description) setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:site_name', 'Lany Cake Shop Nairobi')
    setMetaTag('property', 'og:image', resolvedImage)
    if (canonicalPath) {
      setMetaTag('property', 'og:url', `${siteDomain}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`)
    }

    // 6. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    if (title) setMetaTag('name', 'twitter:title', title)
    if (description) setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', resolvedImage)

    // 7. Schema.org JSON-LD Injection
    let schemaScript = document.getElementById('lany-schema-jsonld')
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script')
        schemaScript.id = 'lany-schema-jsonld'
        schemaScript.type = 'application/ld+json'
        document.head.appendChild(schemaScript)
      }
      schemaScript.textContent = JSON.stringify(schema)
    } else if (schemaScript) {
      schemaScript.textContent = ''
    }
  }, [title, description, canonicalPath, image, ogType, noindex, schema])
}

/**
 * renderLinkedParagraph: Parses standard markdown links [text](url) into:
 * - <Link to="/path"> for internal paths (starting with '/')
 * - <a href="https://..." target="_blank" rel="noopener noreferrer"> for external URLs
 * Keeps all plain text completely intact with zero external dependencies.
 */
export function renderLinkedParagraph(text, key) {
  if (typeof text !== 'string' || !text) return null

  // Regex matching [anchor text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex))
    }

    const anchorText = match[1]
    const url = match[2].trim()

    if (url.startsWith('/')) {
      parts.push(
        <Link key={`${matchIndex}-${url}`} to={url} className="content-inline-link">
          {anchorText}
        </Link>
      )
    } else {
      parts.push(
        <a
          key={`${matchIndex}-${url}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="content-inline-link content-inline-link--external"
        >
          {anchorText}
        </a>
      )
    }

    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return <p key={key}>{parts}</p>
}

/**
 * Structured Data Helper: LocalBusiness / Bakery for Google Rich Snippets
 */
export function getBakerySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "Lany Cake Shop",
    "alternateName": ["CJ Cakes & Confectionery", "Lany Cakes Nairobi"],
    "image": "https://lanycakes.co.ke/images/lany/birthday-cakes.webp",
    "url": "https://lanycakes.co.ke",
    "telephone": "+254758582215",
    "priceRange": "KSh 1,500 - KSh 25,000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Greek Towers, Kamakis, Eastern Bypass",
      "addressLocality": "Ruiru",
      "addressRegion": "Nairobi Metro / Kiambu",
      "postalCode": "00232",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -1.147689,
      "longitude": 36.9610822
    },
    "hasMap": "https://www.google.com/maps/place/Lany+Cake+Shop,+Greek+Towers,+Ruiru/@-1.147689,36.9610822,17z",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "21:00"
      }
    ],
    "servesCuisine": "Artisan Bakery, Celebration Cakes, Bento Cakes, Wedding Cakes, Cupcakes",
    "founder": {
      "@type": "Person",
      "name": "Carol Jenny",
      "jobTitle": "Master Baker & Creative Director"
    },
    "sameAs": [
      "https://www.google.com/maps/place/Lany+Cake+Shop,+Greek+Towers,+Ruiru/@-1.147689,36.9610822,17z",
      "https://maps.google.com/?cid=14552677630529229588",
      "https://instagram.com/lanycakeshop",
      "https://facebook.com/lanycakeshop",
      "https://tiktok.com/@lanycakeshop"
    ]
  };
}

/**
 * Structured Data Helper: BreadcrumbList for Search Results Breadcrumb Hierarchy
 */
export function getBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `https://lanycakes.co.ke${item.url.startsWith('/') ? item.url : `/${item.url}`}`
    }))
  };
}

/**
 * Structured Data Helper: FAQPage Schema
 */
export function getFaqSchema(faqs = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q || faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a || faq.answer
      }
    }))
  };
}

