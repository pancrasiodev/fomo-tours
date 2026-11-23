const db = require('../config/database');
const path = require('path');

async function syncCakesToDb() {
  console.log('[DB Sync] Syncing real bakery catalog products to database...');
  
  // Dynamically import ES Module catalog from frontend data
  const catalogPath = path.resolve(__dirname, '../../src/data/cakesData.js');
  const fileUrl = 'file:///' + catalogPath.replace(/\\/g, '/');
  const { CAKES_CATALOG } = await import(fileUrl);

  let syncedCount = 0;

  for (const cake of CAKES_CATALOG) {
    const slug = cake.slug || cake.id;
    const title = cake.name;
    const subtitle = cake.shortDesc || '';
    const overview = cake.description || '';
    const priceAmount = Number(cake.price || 2500);
    const displayPrice = cake.priceFormatted || `KSh ${priceAmount.toLocaleString()}`;
    const coverImage = cake.image || '';
    const gallery1 = cake.gallery && cake.gallery[1] ? cake.gallery[1] : '';
    const gallery2 = cake.gallery && cake.gallery[2] ? cake.gallery[2] : '';
    const isFeatured = cake.featured ? 1 : 0;
    
    // SEO keyword priority
    let seoKeyword = cake.seoKeyword || '';
    if (!seoKeyword) {
      if (slug.includes('spiderman-comic-city')) seoKeyword = 'spiderman theme cake';
      else if (slug.includes('half-and-half')) seoKeyword = 'baby birthday cake';
      else if (slug.includes('spiderman')) seoKeyword = 'spiderman cake';
      else if (slug.includes('nastya')) seoKeyword = 'rainbow cake';
      else if (slug.includes('bento')) seoKeyword = 'bento cake';
      else seoKeyword = cake.name.toLowerCase();
    }

    const seoTitle = `${title} | Lany Cake Shop Nairobi & Ruiru`;
    const seoDescription = `${subtitle} Handcrafted in Kamakis Eastern Bypass with fast delivery in Nairobi and Ruiru.`;
    const metaJson = JSON.stringify(cake);

    // Check if product already exists in packages table
    const [existing] = await db.query('SELECT id FROM packages WHERE slug = ?', [slug]);

    if (existing && existing.length > 0) {
      await db.query(
        `UPDATE packages
         SET title = ?,
             subtitle = ?,
             overview = ?,
             price_amount = ?,
             display_price = ?,
             currency = 'KSh',
             cover_image = ?,
             gallery_1 = ?,
             gallery_2 = ?,
             status = 'published',
             current_step = 5,
             is_featured = ?,
             seo_keyword = ?,
             seo_title = ?,
             seo_description = ?,
             allow_indexing = 1,
             meta_json = ?,
             updated_at = NOW()
         WHERE slug = ?`,
        [
          title,
          subtitle,
          overview,
          priceAmount,
          displayPrice,
          coverImage,
          gallery1,
          gallery2,
          isFeatured,
          seoKeyword,
          seoTitle,
          seoDescription,
          metaJson,
          slug
        ]
      );
    } else {
      await db.query(
        `INSERT INTO packages (
           record_uid, slug, title, subtitle, trip_type, destination, location,
           duration, group_size, pace_level, best_season, meeting_point,
           currency, price_amount, display_price, deposit_note, next_departure,
           overview, highlights, inclusions, exclusions, what_to_carry,
           itinerary_json, cover_image, gallery_1, gallery_2, status,
           current_step, is_featured, sort_order, seo_keyword, seo_title,
           seo_description, allow_indexing, meta_json, created_at, updated_at
         ) VALUES (
           ?, ?, ?, ?, 'cake', 'Nairobi Metro', 'Kamakis, Eastern Bypass',
           '24 Hours', ?, 'Easy', 'All Year', 'Lany Cake Studio, Kamakis',
           'KSh', ?, ?, 'M-Pesa / Card', 'Daily',
           ?, ?, ?, '[]', '[]',
           '[]', ?, ?, ?, 'published',
           5, ?, 1, ?, ?,
           ?, 1, ?, NOW(), NOW()
         )`,
        [
          `cake_${cake.id}`,
          slug,
          title,
          subtitle,
          cake.servings || 'Serves 8 - 12',
          priceAmount,
          displayPrice,
          overview,
          JSON.stringify(cake.dietaryOptions || []),
          JSON.stringify(cake.availableWeights || []),
          coverImage,
          gallery1,
          gallery2,
          isFeatured,
          seoKeyword,
          seoTitle,
          seoDescription,
          metaJson
        ]
      );
    }
    syncedCount++;
  }

  console.log(`[DB Sync] Successfully synced ${syncedCount} real cake products to database!`);
  return syncedCount;
}

if (require.main === module) {
  syncCakesToDb()
    .then(count => {
      console.log(`Database sync completed. Total cakes: ${count}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Database sync error:', err);
      process.exit(1);
    });
}

module.exports = { syncCakesToDb };
