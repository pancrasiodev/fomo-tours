import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { API_BASE } from '../../config/api.js'
import './Admin.css'
import './AdminDashboard.css'
import './AdminCalendar.css'

export default function AdminCalendar() {
  const [admin, setAdmin] = useState(null)
  const [dates, setDates] = useState([])
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) {
      navigate('/admin')
      return
    }
    setAdmin(JSON.parse(stored))

    const fetchAllDates = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dates`)
        if (!res.ok) throw new Error('Failed to load dates')
        const data = await res.json()
        setDates(
          (data.dates || []).map((d) => ({
            ...d,
            slug: d.package_slug || d.slug,
          }))
        )
      } catch {
        setDates([])
      }
    }

    fetchAllDates()
  }, [navigate])

  const year = current.getFullYear()
  const month = current.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  const getDatesForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dates.filter((d) => d.departure_date?.startsWith(dateStr))
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const selectedDates = selected ? getDatesForDay(selected) : []

  return (
    <AdminLayout admin={admin}>
      <div className="admin-page-title">
        <h1>Calendar</h1>
        <p>Departure dates overview</p>
      </div>

      <div className="admin-cal-layout">
        <div className="admin-card admin-cal-card">
          <div className="admin-cal-header">
            <button type="button" className="admin-cal-nav" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="admin-cal-title">
              {monthNames[month]} {year}
            </h2>
            <button type="button" className="admin-cal-nav" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="admin-cal-days">
            {dayNames.map((d) => (
              <div key={d} className="admin-cal-dayname">
                {d}
              </div>
            ))}
          </div>

          <div className="admin-cal-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="admin-cal-cell admin-cal-cell--empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayDates = getDatesForDay(day)
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year
              const isSelected = selected === day

              return (
                <div
                  key={day}
                  className={`admin-cal-cell ${isToday ? 'admin-cal-cell--today' : ''} ${isSelected ? 'admin-cal-cell--selected' : ''} ${dayDates.length > 0 ? 'admin-cal-cell--has-events' : ''}`}
                  onClick={() => setSelected(day === selected ? null : day)}
                >
                  <span className="admin-cal-cell__num">{day}</span>
                  {dayDates.length > 0 && (
                    <div className="admin-cal-cell__dots">
                      {dayDates.slice(0, 3).map((d, idx) => (
                        <span key={idx} className={`admin-cal-dot admin-cal-dot--${d.status}`} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="admin-cal-legend">
            <span>
              <span className="admin-cal-dot admin-cal-dot--available" /> Available
            </span>
            <span>
              <span className="admin-cal-dot admin-cal-dot--full" /> Full
            </span>
            <span>
              <span className="admin-cal-dot admin-cal-dot--closed" /> Closed
            </span>
          </div>
        </div>

        <div className="admin-cal-sidebar">
          {selected ? (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">
                  {monthNames[month]} {selected}
                </h2>
                <span className="admin-card__badge">{selectedDates.length} departures</span>
              </div>
              {selectedDates.length === 0 ? (
                <p className="admin-empty">No departures this day</p>
              ) : (
                <div className="admin-cal-events">
                  {selectedDates.map((d, i) => (
                    <div key={i} className="admin-cal-event">
                      <div className={`admin-cal-event__dot admin-cal-dot--${d.status}`} />
                      <div className="admin-cal-event__info">
                        <span className="admin-cal-event__title">{d.package_title}</span>
                        <span className="admin-cal-event__meta">
                          ${d.price_per_person} pp · {d.slots_available} slots · {d.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="admin-card">
              <p className="admin-empty">Select a date to see departures</p>
            </div>
          )}

          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">This Month</h2>
            </div>
            <div className="admin-cal-summary">
              <div className="admin-cal-summary__item">
                <span className="admin-cal-summary__value">
                  {
                    dates.filter((d) => {
                      const date = new Date(d.departure_date)
                      return date.getMonth() === month && date.getFullYear() === year
                    }).length
                  }
                </span>
                <span className="admin-cal-summary__label">Total Departures</span>
              </div>
              <div className="admin-cal-summary__item">
                <span className="admin-cal-summary__value">
                  {
                    dates.filter((d) => {
                      const date = new Date(d.departure_date)
                      return (
                        date.getMonth() === month &&
                        date.getFullYear() === year &&
                        d.status === 'available'
                      )
                    }).length
                  }
                </span>
                <span className="admin-cal-summary__label">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
