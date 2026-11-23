-- ============================================================================
-- FOMO Tours Kenya — Full Relational MySQL Schema (cPanel / MySQL 8.0+ / MariaDB)
-- Database: fomo_tours
-- ============================================================================

CREATE DATABASE IF NOT EXISTS fomo_tours
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fomo_tours;

-- 1. Studio Admins
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Traveler Accounts
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT '',
  password VARCHAR(255) NOT NULL,
  auth_provider VARCHAR(40) DEFAULT 'email',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Safari & 1-Day Trip Packages
CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_uid VARCHAR(120) UNIQUE,
  slug VARCHAR(190) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  trip_type VARCHAR(32) NOT NULL DEFAULT 'multi_day',
  destination VARCHAR(160) DEFAULT '',
  location VARCHAR(160) DEFAULT '',
  destinations VARCHAR(255) DEFAULT '',
  nearest_airport VARCHAR(255) DEFAULT '',
  duration VARCHAR(80) DEFAULT '',
  group_size VARCHAR(80) DEFAULT 'Max 12 travelers',
  pace_level VARCHAR(60) DEFAULT 'Easy',
  best_season VARCHAR(120) DEFAULT 'June to March',
  meeting_point VARCHAR(255) DEFAULT '',
  currency VARCHAR(12) NOT NULL DEFAULT 'KSh',
  price_amount DECIMAL(12,2) DEFAULT 0,
  display_price VARCHAR(60) DEFAULT '',
  deposit_note VARCHAR(255) DEFAULT '',
  next_departure VARCHAR(120) DEFAULT '',
  overview LONGTEXT,
  highlights LONGTEXT,
  inclusions LONGTEXT,
  exclusions LONGTEXT,
  what_to_carry LONGTEXT,
  itinerary_json LONGTEXT,
  cover_image LONGTEXT,
  gallery_1 LONGTEXT,
  gallery_2 LONGTEXT,
  is_featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 100,
  seo_keyword VARCHAR(190) DEFAULT '',
  seo_title VARCHAR(255) DEFAULT '',
  seo_description TEXT,
  allow_indexing TINYINT(1) DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  current_step INT DEFAULT 0,
  meta_json LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Structured Itinerary Days / Time Slots
CREATE TABLE IF NOT EXISTS itinerary_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  day_number INT NOT NULL DEFAULT 1,
  time_label VARCHAR(80) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  accommodation VARCHAR(255) DEFAULT '',
  meals VARCHAR(160) DEFAULT '',
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Scheduled Calendar Departures
CREATE TABLE IF NOT EXISTS package_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NULL,
  package_slug VARCHAR(190) DEFAULT '',
  package_title VARCHAR(255) DEFAULT '',
  departure_date DATE NOT NULL,
  return_date DATE NULL,
  price_per_person DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(12) DEFAULT 'KSh',
  slots_total INT DEFAULT 12,
  slots_available INT DEFAULT 12,
  status VARCHAR(32) NOT NULL DEFAULT 'available',
  notes VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_dates_dep (departure_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Editorial Journal Stories (with Optional SEO Metadata)
CREATE TABLE IF NOT EXISTS journal_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_uid VARCHAR(120) UNIQUE,
  slug VARCHAR(190) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(80) DEFAULT 'ON THE ROAD',
  read_time VARCHAR(40) DEFAULT '4 MIN READ',
  excerpt TEXT,
  cover_image LONGTEXT,
  image_alt VARCHAR(255) DEFAULT '',
  body_text LONGTEXT,
  related_trip_slug VARCHAR(190) DEFAULT '',
  seo_keyword VARCHAR(190) DEFAULT '',
  seo_title VARCHAR(255) DEFAULT '',
  seo_description TEXT,
  allow_indexing TINYINT(1) DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  current_step INT DEFAULT 0,
  meta_json LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Client Bookings (Supports Pay All & Lipa Pole Pole)
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(80) NOT NULL UNIQUE,
  user_id INT NULL,
  package_id INT NULL,
  package_date_id INT NULL,
  package_slug VARCHAR(190) DEFAULT '',
  package_title VARCHAR(255) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  departure_date VARCHAR(60) DEFAULT '',
  num_guests INT NOT NULL DEFAULT 1,
  currency VARCHAR(12) NOT NULL DEFAULT 'KSh',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_plan VARCHAR(32) NOT NULL DEFAULT 'full',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(60) DEFAULT 'M-Pesa',
  mpesa_receipt VARCHAR(80) DEFAULT '',
  checkout_request_id VARCHAR(120) DEFAULT '',
  merchant_request_id VARCHAR(120) DEFAULT '',
  special_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bookings_ref (booking_ref),
  INDEX idx_bookings_checkout (checkout_request_id),
  INDEX idx_bookings_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Booking Payment & Lipa Pole Pole Installment Ledger
CREATE TABLE IF NOT EXISTS booking_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_uid VARCHAR(80) NOT NULL UNIQUE,
  booking_ref VARCHAR(80) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(12) NOT NULL DEFAULT 'KSh',
  kes_amount INT NOT NULL DEFAULT 0,
  method VARCHAR(60) NOT NULL DEFAULT 'M-Pesa',
  reference VARCHAR(100) DEFAULT '',
  phone VARCHAR(60) DEFAULT '',
  checkout_request_id VARCHAR(120) DEFAULT '',
  merchant_request_id VARCHAR(120) DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'completed',
  result_code VARCHAR(32) DEFAULT '',
  result_desc VARCHAR(255) DEFAULT '',
  note VARCHAR(255) DEFAULT '',
  recorded_by VARCHAR(40) DEFAULT 'client',
  payment_date VARCHAR(32) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_booking (booking_ref),
  INDEX idx_payments_checkout (checkout_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Cake Ecommerce Orders
CREATE TABLE IF NOT EXISTS cake_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_ref VARCHAR(60) NOT NULL UNIQUE,
  customer_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  delivery_type VARCHAR(30) NOT NULL DEFAULT 'delivery',
  delivery_address TEXT,
  delivery_zone VARCHAR(60) DEFAULT 'cbd',
  delivery_date VARCHAR(40) NOT NULL,
  delivery_slot VARCHAR(40) NOT NULL DEFAULT 'afternoon',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(60) DEFAULT 'M-Pesa',
  mpesa_receipt VARCHAR(80) DEFAULT '',
  checkout_request_id VARCHAR(120) DEFAULT '',
  merchant_request_id VARCHAR(120) DEFAULT '',
  order_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  special_instructions TEXT,
  reference_image LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cake_order_ref (order_ref),
  INDEX idx_cake_order_phone (phone),
  INDEX idx_cake_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Cake Order Items & Customisation Snapshot
CREATE TABLE IF NOT EXISTS cake_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_ref VARCHAR(60) NOT NULL,
  cake_id VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  weight VARCHAR(60) NOT NULL,
  flavor VARCHAR(120) NOT NULL,
  filling VARCHAR(120) DEFAULT 'Swiss Buttercream',
  icing VARCHAR(120) DEFAULT 'Smooth Buttercream',
  inscription VARCHAR(255) DEFAULT '',
  extras_json TEXT,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_item_ref (order_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bespoke Custom Cake Quotations
CREATE TABLE IF NOT EXISTS cake_quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote_ref VARCHAR(60) NOT NULL UNIQUE,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  email VARCHAR(190) NOT NULL,
  occasion VARCHAR(100) NOT NULL,
  guest_count VARCHAR(60) DEFAULT '',
  tier_structure VARCHAR(80) DEFAULT '1 Tier',
  flavor_preferences VARCHAR(200) DEFAULT '',
  budget_range VARCHAR(80) DEFAULT '',
  event_date VARCHAR(40) NOT NULL,
  delivery_location VARCHAR(200) DEFAULT '',
  reference_image LONGTEXT,
  notes TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  quoted_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_quote_ref (quote_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
