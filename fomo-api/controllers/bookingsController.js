const db = require('../config/database')

const createBooking = async (req, res) => {
  try {
    const {
      package_date_id,
      full_name,
      email,
      phone,
      num_guests,
      special_requests
    } = req.body

    // Check date availability
    const [dates] = await db.query(
      'SELECT * FROM package_dates WHERE id = ? AND status = "available"',
      [package_date_id]
    )

    if (dates.length === 0) {
      return res.status(400).json({ error: 'Date not available' })
    }

    const date = dates[0]
    const total_amount = date.price_per_person * (num_guests || 1)

    const [result] = await db.query(
      `INSERT INTO bookings 
      (package_date_id, full_name, email, phone, num_guests, special_requests, total_amount) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [package_date_id, full_name, email, phone, num_guests || 1, special_requests, total_amount]
    )

    // Update slots
    await db.query(
      'UPDATE package_dates SET slots_available = slots_available - ? WHERE id = ?',
      [num_guests || 1, package_date_id]
    )

    // Check if full
    await db.query(
      'UPDATE package_dates SET status = "full" WHERE id = ? AND slots_available <= 0',
      [package_date_id]
    )

    res.status(201).json({
      message: 'Booking created',
      booking_id: result.insertId,
      total_amount
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, pd.departure_date, pd.return_date, pd.price_per_person,
       p.title as package_title, p.slug
       FROM bookings b
       JOIN package_dates pd ON b.package_date_id = pd.id
       JOIN packages p ON pd.package_id = p.id
       ORDER BY b.created_at DESC`
    )
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const [bookings] = await db.query(
      `SELECT b.*, pd.departure_date, pd.return_date, pd.price_per_person,
       p.title as package_title, p.slug
       FROM bookings b
       JOIN package_dates pd ON b.package_date_id = pd.id
       JOIN packages p ON pd.package_id = p.id
       WHERE b.id = ?`,
      [id]
    )
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    res.json({ booking: bookings[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { payment_status, mpesa_receipt } = req.body
    await db.query(
      'UPDATE bookings SET payment_status = ?, mpesa_receipt = ? WHERE id = ?',
      [payment_status, mpesa_receipt, id]
    )
    res.json({ message: 'Payment status updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus
}