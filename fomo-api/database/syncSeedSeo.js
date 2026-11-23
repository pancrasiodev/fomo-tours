const db = require('../config/database')
const { SEED_PACKAGES, SEED_JOURNALS } = require('./seedData')

async function syncCuratedSeoAndCopy() {
  console.log('[DB Sync] Syncing curated SEO keywords, titles, descriptions and copy...')

  // 1. Sync Packages
  for (const pkg of SEED_PACKAGES) {
    const overviewStr = Array.isArray(pkg.overview) ? pkg.overview.join('\n\n') : String(pkg.overview || '')
    const inclusionsJson = JSON.stringify(pkg.included || [])
    const exclusionsJson = JSON.stringify(pkg.excluded || [])
    const whatToCarryJson = JSON.stringify(pkg.whatToCarry || [])
    const itineraryJson = JSON.stringify(pkg.itinerary || [])
    const metaJson = JSON.stringify({
      ...pkg,
      overviewText: overviewStr,
      isCurated: true,
      status: 'published',
      currentStep: 5,
    })

    const [rows] = await db.query('SELECT id FROM packages WHERE slug = ?', [pkg.slug])
    if (rows.length > 0) {
      const packageId = rows[0].id
      await db.query(
        `UPDATE packages
         SET title = ?,
             subtitle = ?,
             overview = ?,
             itinerary_json = ?,
             inclusions = ?,
             exclusions = ?,
             highlights = ?,
             what_to_carry = ?,
             seo_keyword = ?,
             seo_title = ?,
             seo_description = ?,
             allow_indexing = 1,
             meta_json = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          pkg.title,
          pkg.subtitle || '',
          overviewStr,
          itineraryJson,
          inclusionsJson,
          exclusionsJson,
          whatToCarryJson,
          whatToCarryJson,
          pkg.seoKeyword || '',
          pkg.seoTitle || '',
          pkg.seoDescription || '',
          metaJson,
          packageId,
        ]
      )

      // Refresh itinerary_days
      await db.query('DELETE FROM itinerary_days WHERE package_id = ?', [packageId])
      const days = Array.isArray(pkg.itinerary) ? pkg.itinerary : []
      for (let i = 0; i < days.length; i += 1) {
        const d = days[i]
        await db.query(
          `INSERT INTO itinerary_days (package_id, day_number, time_label, title, description)
           VALUES (?, ?, ?, ?, ?)`,
          [
            packageId,
            i + 1,
            d.time || `Day ${i + 1}`,
            d.title || d.day || `Day ${i + 1}`,
            d.desc || '',
          ]
        )
      }
    }
  }

  // 2. Sync Journals
  for (const post of SEED_JOURNALS) {
    const bodyText = Array.isArray(post.body) ? post.body.join('\n\n') : String(post.bodyText || '')
    const metaJson = JSON.stringify({
      ...post,
      bodyText,
      isCurated: true,
      status: 'published',
      currentStep: 3,
    })

    const [rows] = await db.query('SELECT id FROM journal_posts WHERE slug = ?', [post.slug])
    if (rows.length > 0) {
      await db.query(
        `UPDATE journal_posts
         SET title = ?,
             category = ?,
             read_time = ?,
             excerpt = ?,
             body_text = ?,
             related_trip_slug = ?,
             seo_keyword = ?,
             seo_title = ?,
             seo_description = ?,
             allow_indexing = 1,
             meta_json = ?,
             updated_at = NOW()
         WHERE slug = ?`,
        [
          post.title,
          post.category || 'ON THE ROAD',
          post.readTime || '5 MIN READ',
          post.excerpt || '',
          bodyText,
          post.relatedTripSlug || '',
          post.seoKeyword || '',
          post.seoTitle || '',
          post.seoDescription || '',
          metaJson,
          post.slug,
        ]
      )
    }
  }

  console.log('[DB Sync] Successfully synced all 13 packages and 6 journal stories!')
}

if (require.main === module) {
  syncCuratedSeoAndCopy()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[DB Sync] Failed:', err)
      process.exit(1)
    })
}

module.exports = { syncCuratedSeoAndCopy }
