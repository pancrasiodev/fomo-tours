const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const db = require('../config/database')
const { SEED_PACKAGES, SEED_JOURNALS } = require('./seedData')
const { syncCuratedSeoAndCopy } = require('./syncSeedSeo')

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  password TEXT NOT NULL,
  auth_provider TEXT DEFAULT 'email',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_uid TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  trip_type TEXT NOT NULL DEFAULT 'multi_day',
  destination TEXT DEFAULT '',
  location TEXT DEFAULT '',
  destinations TEXT DEFAULT '',
  nearest_airport TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  group_size TEXT DEFAULT 'Private & Scheduled Departures',
  pace_level TEXT DEFAULT 'Easy',
  best_season TEXT DEFAULT 'June to March',
  meeting_point TEXT DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'KSh',
  price_amount REAL DEFAULT 0,
  display_price TEXT DEFAULT '',
  deposit_note TEXT DEFAULT '',
  next_departure TEXT DEFAULT '',
  overview TEXT,
  highlights TEXT,
  inclusions TEXT,
  exclusions TEXT,
  what_to_carry TEXT,
  itinerary_json TEXT,
  cover_image TEXT,
  gallery_1 TEXT,
  gallery_2 TEXT,
  is_featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 100,
  seo_keyword TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  seo_description TEXT,
  allow_indexing INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  current_step INTEGER DEFAULT 0,
  meta_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS itinerary_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL DEFAULT 1,
  time_label TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT,
  accommodation TEXT DEFAULT '',
  meals TEXT DEFAULT '',
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS package_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER,
  package_slug TEXT DEFAULT '',
  package_title TEXT DEFAULT '',
  departure_date TEXT NOT NULL,
  return_date TEXT,
  price_per_person REAL DEFAULT 0,
  currency TEXT DEFAULT 'KSh',
  slots_total INTEGER DEFAULT 12,
  slots_available INTEGER DEFAULT 12,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journal_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_uid TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'ON THE ROAD',
  read_time TEXT DEFAULT '4 MIN READ',
  excerpt TEXT,
  cover_image TEXT,
  image_alt TEXT DEFAULT '',
  body_text TEXT,
  related_trip_slug TEXT DEFAULT '',
  seo_keyword TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  seo_description TEXT,
  allow_indexing INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  current_step INTEGER DEFAULT 0,
  meta_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_ref TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  package_id INTEGER,
  package_date_id INTEGER,
  package_slug TEXT DEFAULT '',
  package_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  departure_date TEXT DEFAULT '',
  num_guests INTEGER NOT NULL DEFAULT 1,
  currency TEXT NOT NULL DEFAULT 'KSh',
  total_amount REAL NOT NULL DEFAULT 0,
  amount_paid REAL NOT NULL DEFAULT 0,
  payment_plan TEXT NOT NULL DEFAULT 'full',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'M-Pesa',
  mpesa_receipt TEXT DEFAULT '',
  checkout_request_id TEXT DEFAULT '',
  merchant_request_id TEXT DEFAULT '',
  special_requests TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS booking_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_uid TEXT NOT NULL UNIQUE,
  booking_ref TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KSh',
  kes_amount INTEGER NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'M-Pesa',
  reference TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  checkout_request_id TEXT DEFAULT '',
  merchant_request_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'completed',
  result_code TEXT DEFAULT '',
  result_desc TEXT DEFAULT '',
  note TEXT DEFAULT '',
  recorded_by TEXT DEFAULT 'client',
  payment_date TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cake_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'delivery',
  delivery_address TEXT DEFAULT '',
  delivery_zone TEXT DEFAULT 'cbd',
  delivery_date TEXT NOT NULL,
  delivery_slot TEXT NOT NULL DEFAULT 'afternoon',
  subtotal REAL NOT NULL DEFAULT 0,
  delivery_fee REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'M-Pesa',
  mpesa_receipt TEXT DEFAULT '',
  checkout_request_id TEXT DEFAULT '',
  merchant_request_id TEXT DEFAULT '',
  order_status TEXT NOT NULL DEFAULT 'Pending',
  special_instructions TEXT DEFAULT '',
  reference_image TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cake_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref TEXT NOT NULL,
  cake_id TEXT NOT NULL,
  name TEXT NOT NULL,
  weight TEXT NOT NULL,
  flavor TEXT NOT NULL,
  filling TEXT DEFAULT 'Swiss Buttercream',
  icing TEXT DEFAULT 'Smooth Buttercream',
  inscription TEXT DEFAULT '',
  extras_json TEXT DEFAULT '[]',
  unit_price REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cake_quotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_ref TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  occasion TEXT NOT NULL,
  guest_count TEXT DEFAULT '',
  tier_structure TEXT DEFAULT '1 Tier',
  flavor_preferences TEXT DEFAULT '',
  budget_range TEXT DEFAULT '',
  event_date TEXT NOT NULL,
  delivery_location TEXT DEFAULT '',
  reference_image TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  quoted_amount REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

async function ensureColumns() {
  const migrations = [
    "ALTER TABLE admins ADD COLUMN role VARCHAR(40) NOT NULL DEFAULT 'admin'",
    "ALTER TABLE packages ADD COLUMN is_featured INTEGER DEFAULT 0",
    "ALTER TABLE packages ADD COLUMN sort_order INTEGER DEFAULT 100",
    "ALTER TABLE packages ADD COLUMN seo_keyword VARCHAR(190) DEFAULT ''",
    "ALTER TABLE packages ADD COLUMN seo_title VARCHAR(255) DEFAULT ''",
    "ALTER TABLE packages ADD COLUMN seo_description TEXT",
    "ALTER TABLE packages ADD COLUMN allow_indexing INTEGER DEFAULT 1",
  ]
  for (const sql of migrations) {
    try {
      await db.query(sql)
    } catch {
      // Column already exists — safe to ignore
    }
  }
}

async function seedPackagesAndItinerary() {
  const [existingPackages] = await db.query('SELECT id FROM packages LIMIT 1')
  if (existingPackages.length > 0) return

  let seededCount = 0
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

    const [ins] = await db.query(
      `INSERT INTO packages
       (record_uid, slug, title, subtitle, trip_type, destination, location, destinations, nearest_airport,
        duration, group_size, pace_level, best_season, meeting_point, currency, price_amount, display_price,
        deposit_note, next_departure, overview, highlights, inclusions, exclusions, what_to_carry,
        itinerary_json, cover_image, gallery_1, gallery_2, is_featured, sort_order,
        seo_keyword, seo_title, seo_description, allow_indexing, status, current_step, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pkg.id,
        pkg.slug,
        pkg.title,
        pkg.subtitle || '',
        pkg.tripType || 'multi_day',
        pkg.destination || '',
        pkg.location || '',
        pkg.destination || '',
        pkg.meetingPoint || '',
        pkg.duration || '',
        pkg.groupSize || 'Private & Scheduled Departures',
        pkg.level || 'Easy',
        pkg.bestSeason || 'June to March',
        pkg.meetingPoint || '',
        pkg.currency || 'USD',
        Number(pkg.priceAmount || 0),
        pkg.price || '',
        pkg.depositNote || '',
        pkg.nextDeparture || '',
        overviewStr,
        whatToCarryJson,
        inclusionsJson,
        exclusionsJson,
        whatToCarryJson,
        itineraryJson,
        pkg.image || '',
        pkg.gallery?.[0] || '',
        pkg.gallery?.[1] || '',
        pkg.isFeatured ? 1 : 0,
        Number(pkg.sortOrder || 100),
        pkg.seoKeyword || '',
        pkg.seoTitle || '',
        pkg.seoDescription || '',
        1,
        'published',
        5,
        metaJson,
      ]
    )

    const packageId = ins.insertId

    // Seed structured itinerary_days rows
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

    // Seed scheduled departures for this package (avoiding duplicates)
    const departures = Array.isArray(pkg.departures) ? pkg.departures : []
    for (const dep of departures) {
      const [existingDep] = await db.query(
        'SELECT id FROM package_dates WHERE package_slug = ? AND departure_date = ? LIMIT 1',
        [pkg.slug, dep.departure_date]
      )
      if (existingDep.length > 0) {
        await db.query('UPDATE package_dates SET package_id = ? WHERE id = ?', [
          packageId,
          existingDep[0].id,
        ])
      } else {
        await db.query(
          `INSERT INTO package_dates
           (package_id, package_slug, package_title, departure_date, return_date, price_per_person, currency, slots_total, slots_available, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
          [
            packageId,
            pkg.slug,
            pkg.title,
            dep.departure_date,
            dep.return_date || dep.departure_date,
            Number(pkg.priceAmount || 0),
            pkg.currency || 'USD',
            Number(dep.slots_total || 12),
            Number(dep.slots_available || 12),
          ]
        )
      }
    }

    // Link existing bookings for this slug to package_id
    await db.query(
      'UPDATE bookings SET package_id = ? WHERE package_slug = ? AND package_id IS NULL',
      [packageId, pkg.slug]
    )

    seededCount += 1
  }

  console.log(`[DB] Seeded ${seededCount} curated trips + itinerary days + departure dates`)
}

async function seedJournalPosts() {
  const [existingJournals] = await db.query('SELECT id FROM journal_posts LIMIT 1')
  if (existingJournals.length > 0) return

  let seededCount = 0
  for (const post of SEED_JOURNALS) {
    const bodyText = Array.isArray(post.body) ? post.body.join('\n\n') : String(post.bodyText || '')
    const metaJson = JSON.stringify({
      ...post,
      bodyText,
      isCurated: true,
      status: 'published',
      currentStep: 3,
    })

    await db.query(
      `INSERT INTO journal_posts
       (record_uid, slug, title, category, read_time, excerpt, cover_image, image_alt, body_text,
        related_trip_slug, seo_keyword, seo_title, seo_description, allow_indexing, status, current_step, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 3, ?)`,
      [
        post.id || post.slug,
        post.slug,
        post.title,
        post.category || 'ON THE ROAD',
        post.readTime || '5 MIN READ',
        post.excerpt || '',
        post.image || '',
        post.alt || post.title,
        bodyText,
        post.relatedTripSlug || '',
        post.seoKeyword || '',
        post.seoTitle || '',
        post.seoDescription || '',
        1,
        metaJson,
      ]
    )
    seededCount += 1
  }

  console.log(`[DB] Seeded ${seededCount} editorial journal stories`)
}

async function initDatabase() {
  const driver = await db.ensureConnection()

  if (driver === 'mysql') {
    const mysqlSchema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    await db.execRaw(mysqlSchema)
  } else {
    await db.execRaw(SQLITE_SCHEMA)
  }

  await ensureColumns()

  // 1. Seed Default Studio Admin
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'studio@fomotours.co.ke'
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'FomoStudio2026!'
  const [existingAdmins] = await db.query('SELECT id FROM admins WHERE email = ?', [adminEmail])
  if (existingAdmins.length === 0) {
    const hash = await bcrypt.hash(adminPass, 10)
    await db.query('INSERT INTO admins (full_name, email, password, role) VALUES (?, ?, ?, ?)', [
      'FOMO Studio',
      adminEmail,
      hash,
      'admin',
    ])
    console.log(`[DB] Seeded default admin account (${adminEmail})`)
  }

  // 2. Seed All Curated Trips (packages + itinerary_days + package_dates)
  await seedPackagesAndItinerary()

  // 3. Seed All Curated Editorial Journal Stories
  await seedJournalPosts()

  // 3b. Sync latest curated SEO and humanized copy to existing database rows
  await syncCuratedSeoAndCopy()

  // 4. Seed Initial Bookings & Lipa Pole Pole Ledger if empty
  const [existingBookings] = await db.query('SELECT id FROM bookings LIMIT 1')
  if (existingBookings.length === 0) {
    await db.query(
      `INSERT INTO bookings (booking_ref, package_slug, package_title, full_name, email, phone, departure_date, num_guests, currency, total_amount, amount_paid, payment_plan, payment_status, payment_method, mpesa_receipt, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'bk-1001',
        'tsavo-diani',
        'Bush to Indian Ocean: Tsavo Plains & Diani Reefs',
        'Wanjiku Kamau',
        'wanjiku.k@gmail.com',
        '+254 722 418 902',
        '2026-12-12',
        2,
        'KSh',
        76000,
        45000,
        'lipa_pole_pole',
        'partial',
        'M-Pesa',
        'SJK84M2P9Q',
        'Lipa Pole Pole: balance due 5 days before SGR departure.',
        '2026-11-02 09:30:00',
      ]
    )
    await db.query(
      `INSERT INTO booking_payments (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, status, note, recorded_by, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'pmt-1',
        'bk-1001',
        25000,
        'KSh',
        25000,
        'M-Pesa',
        'SJB41L9K2A',
        'completed',
        'Initial booking deposit',
        'client',
        '2026-11-02',
      ]
    )
    await db.query(
      `INSERT INTO booking_payments (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, status, note, recorded_by, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'pmt-2',
        'bk-1001',
        20000,
        'KSh',
        20000,
        'M-Pesa',
        'SJK84M2P9Q',
        'completed',
        '2nd Lipa Pole Pole installment logged by Admin',
        'admin',
        '2026-11-06',
      ]
    )

    await db.query(
      `INSERT INTO bookings (booking_ref, package_slug, package_title, full_name, email, phone, departure_date, num_guests, currency, total_amount, amount_paid, payment_plan, payment_status, payment_method, mpesa_receipt, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'bk-1002',
        'naivasha-hells-gate',
        'Rift Valley Escape: Boat Safaris & Gorge Cycling',
        'Brian Ochieng',
        'bochieng@outlook.com',
        '+254 711 890 334',
        '2026-11-21',
        4,
        'KSh',
        26000,
        26000,
        'full',
        'paid',
        'M-Pesa',
        'SJL99T5R1W',
        'Group of 4 friends, CBD Kencom pickup.',
        '2026-11-05 14:15:00',
      ]
    )
    await db.query(
      `INSERT INTO booking_payments (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, status, note, recorded_by, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'pmt-3',
        'bk-1002',
        26000,
        'KSh',
        26000,
        'M-Pesa',
        'SJL99T5R1W',
        'completed',
        'Full payment confirmed via M-Pesa Till 9689363',
        'gateway',
        '2026-11-05',
      ]
    )

    await db.query(
      `INSERT INTO bookings (booking_ref, package_slug, package_title, full_name, email, phone, departure_date, num_guests, currency, total_amount, amount_paid, payment_plan, payment_status, payment_method, mpesa_receipt, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'bk-1003',
        'mara-migration',
        'Great Migration: Mara River Crossings & Big Cats',
        'Claire & Marc Dubois',
        'claire.dubois@wanadoo.fr',
        '+33 6 42 88 19 04',
        '2026-12-18',
        2,
        'USD',
        2900,
        0,
        'lipa_pole_pole',
        'pending',
        'Bank Transfer',
        '',
        'Requested invoice for 30% wire deposit.',
        '2026-11-06 16:45:00',
      ]
    )

    // Backfill package_id onto seeded bookings
    const [pkgs] = await db.query('SELECT id, slug FROM packages')
    for (const p of pkgs) {
      await db.query(
        'UPDATE bookings SET package_id = ? WHERE package_slug = ? AND package_id IS NULL',
        [p.id, p.slug]
      )
    }
  }

  return driver
}

if (require.main === module) {
  initDatabase()
    .then((driver) => {
      console.log(`[DB] Initialization completed successfully (${driver})`)
      process.exit(0)
    })
    .catch((err) => {
      console.error('[DB] Initialization failed:', err)
      process.exit(1)
    })
}

module.exports = { initDatabase }
