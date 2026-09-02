import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Plus, Trash2, Package, X, ArrowLeft } from 'lucide-react'
import AdminLayout from './AdminLayout'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackageForm.css'

export default function AdminPackageForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: '', slug: '', overview: '', duration: '',
    destinations: '', nearest_airport: '',
    highlights: [], inclusions: [], exclusions: [],
    status: 'draft'
  })

  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [days, setDays] = useState([])
  const [dates, setDates] = useState([])

  const [newDay, setNewDay] = useState({
    day_number: '', title: '', description: '', accommodation: '', meals: ''
  })

  const [newDate, setNewDate] = useState({
    departure_date: '', return_date: '', price_per_person: '', slots_available: 10
  })

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) { navigate('/admin'); return }
    setAdmin(JSON.parse(stored))
    if (isEdit) fetchPackage()
  }, [])

  const parseJSON = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return [] }
  }

  const fetchPackage = async () => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const res = await fetch(`http://localhost:5000/api/packages/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const pkg = data.packages?.find(p => p.id === parseInt(id))
      if (pkg) {
        setForm({
          title: pkg.title || '',
          slug: pkg.slug || '',
          overview: pkg.overview || '',
          duration: pkg.duration || '',
          destinations: pkg.destinations || '',
          nearest_airport: pkg.nearest_airport || '',
          highlights: parseJSON(pkg.highlights),
          inclusions: parseJSON(pkg.inclusions),
          exclusions: parseJSON(pkg.exclusions),
          status: pkg.status || 'draft'
        })
        if (pkg.cover_image) setCoverPreview(`http://localhost:5000${pkg.cover_image}`)

        const daysRes = await fetch(`http://localhost:5000/api/packages/${pkg.slug}`)
        const daysData = await daysRes.json()
        setDays(daysData.days || [])
        setDates(daysData.dates || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'title') {
      setForm(prev => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const addListItem = (field) => {
    const input = document.getElementById(`${field}-input`)
    if (!input.value.trim()) return
    setForm(prev => ({ ...prev, [field]: [...(Array.isArray(prev[field]) ? prev[field] : []), input.value.trim()] }))
    input.value = ''
  }

  const removeListItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: (Array.isArray(prev[field]) ? prev[field] : []).filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, Array.isArray(val) ? JSON.stringify(val) : val)
      })
      if (coverImage) formData.append('cover_image', coverImage)

      const url = isEdit
        ? `http://localhost:5000/api/packages/${id}`
        : `http://localhost:5000/api/packages`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Save failed'); return }

      setSuccess('Package saved successfully!')
      if (!isEdit && data.id) navigate(`/admin/packages/edit/${data.id}`)
    } catch (err) {
      setError('Server error')
    } finally {
      setSaving(false)
    }
  }

  const addDay = async () => {
    if (!newDay.title || !newDay.day_number) return
    try {
      const token = localStorage.getItem('fomo_admin_token')
      await fetch('http://localhost:5000/api/packages/days/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newDay, package_id: id })
      })
      setNewDay({ day_number: '', title: '', description: '', accommodation: '', meals: '' })
      fetchPackage()
    } catch (err) { console.error(err) }
  }

  const deleteDay = async (dayId) => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      await fetch(`http://localhost:5000/api/packages/days/${dayId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPackage()
    } catch (err) { console.error(err) }
  }

  const addDate = async () => {
    if (!newDate.departure_date || !newDate.price_per_person) return
    try {
      const token = localStorage.getItem('fomo_admin_token')
      await fetch('http://localhost:5000/api/dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newDate, package_id: id })
      })
      setNewDate({ departure_date: '', return_date: '', price_per_person: '', slots_available: 10 })
      fetchPackage()
    } catch (err) { console.error(err) }
  }

  const deleteDate = async (dateId) => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      await fetch(`http://localhost:5000/api/dates/${dateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPackage()
    } catch (err) { console.error(err) }
  }

  return (
    <AdminLayout admin={admin}>
      <div className="admin-packages-top">
        <div className="admin-page-title">
          <h1>{isEdit ? 'Edit Package' : 'New Package'}</h1>
          <p>{isEdit ? `Editing: ${form.title}` : 'Fill in the package details below'}</p>
        </div>
        <div className="admin-form-actions">
          <button className="admin-form__back" onClick={() => navigate('/admin/packages')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="admin-form__save" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Package'}
          </button>
        </div>
      </div>

      {error && <div className="admin-form__error">{error}</div>}
      {success && <div className="admin-form__success">{success}</div>}

      <div className="admin-form-grid">
        <div className="admin-form-col">
          <div className="admin-card admin-card--glass">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Basic Info</h2>
            </div>
            <div className="admin-form-fields">
              <div className="admin-field">
                <label>Package Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Masai Mara Migration Safari" />
              </div>
              <div className="admin-field">
                <label>Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} placeholder="masai-mara-migration" />
              </div>
              <div className="admin-field">
                <label>Overview</label>
                <textarea name="overview" value={form.overview} onChange={handleChange} rows={5} placeholder="Package overview..." />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Duration</label>
                  <input name="duration" value={form.duration} onChange={handleChange} placeholder="7 Days / 6 Nights" />
                </div>
                <div className="admin-field">
                  <label>Nearest Airport</label>
                  <input name="nearest_airport" value={form.nearest_airport} onChange={handleChange} placeholder="Nairobi JKIA" />
                </div>
              </div>
              <div className="admin-field">
                <label>Destinations</label>
                <input name="destinations" value={form.destinations} onChange={handleChange} placeholder="Masai Mara, Nairobi, Kenya" />
              </div>
              <div className="admin-field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-card admin-card--glass">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Cover Image</h2>
            </div>
            <div className="admin-cover-upload">
              {coverPreview ? (
                <div className="admin-cover-preview">
                  <img src={coverPreview} alt="Cover" />
                  <button onClick={() => { setCoverImage(null); setCoverPreview(null) }}>
                    <X size={16} /> Remove
                  </button>
                </div>
              ) : (
                <label className="admin-cover-dropzone">
                  <Package size={32} />
                  <span>Click to upload cover image</span>
                  <input type="file" accept="image/*" onChange={handleImage} hidden />
                </label>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="admin-card admin-card--glass">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Itinerary</h2>
                <span className="admin-card__badge">{days.length} days</span>
              </div>
              <div className="admin-days-list">
                {days.map((day) => (
                  <div key={day.id} className="admin-day-item">
                    <div className="admin-day-item__num">Day {day.day_number}</div>
                    <div className="admin-day-item__info">
                      <span className="admin-day-item__title">{day.title}</span>
                      <span className="admin-day-item__meta">{day.accommodation} · {day.meals}</span>
                    </div>
                    <button className="admin-pkg-action admin-pkg-action--delete" onClick={() => deleteDay(day.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="admin-add-day">
                <h3 className="admin-add-day__title">Add Day</h3>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Day #</label>
                    <input type="number" value={newDay.day_number} onChange={e => setNewDay(p => ({ ...p, day_number: e.target.value }))} placeholder="1" />
                  </div>
                  <div className="admin-field">
                    <label>Title</label>
                    <input value={newDay.title} onChange={e => setNewDay(p => ({ ...p, title: e.target.value }))} placeholder="Arrival in Nairobi" />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Description</label>
                  <textarea value={newDay.description} onChange={e => setNewDay(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Day description..." />
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Accommodation</label>
                    <input value={newDay.accommodation} onChange={e => setNewDay(p => ({ ...p, accommodation: e.target.value }))} placeholder="Sarova Stanley Hotel" />
                  </div>
                  <div className="admin-field">
                    <label>Meals</label>
                    <input value={newDay.meals} onChange={e => setNewDay(p => ({ ...p, meals: e.target.value }))} placeholder="Bed & Breakfast" />
                  </div>
                </div>
                <button className="admin-add-btn" onClick={addDay}><Plus size={16} /> Add Day</button>
              </div>
            </div>
          )}
        </div>

        <div className="admin-form-col">
          <div className="admin-card admin-card--glass">
            <div className="admin-card__header"><h2 className="admin-card__title">Highlights</h2></div>
            <div className="admin-list-field">
              {(Array.isArray(form.highlights) ? form.highlights : []).map((item, i) => (
                <div key={i} className="admin-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeListItem('highlights', i)}><X size={14} /></button>
                </div>
              ))}
              <div className="admin-list-add">
                <input id="highlights-input" placeholder="Add highlight..." />
                <button onClick={() => addListItem('highlights')}><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <div className="admin-card admin-card--glass">
            <div className="admin-card__header"><h2 className="admin-card__title">Inclusions</h2></div>
            <div className="admin-list-field">
              {(Array.isArray(form.inclusions) ? form.inclusions : []).map((item, i) => (
                <div key={i} className="admin-list-item admin-list-item--green">
                  <span>{item}</span>
                  <button onClick={() => removeListItem('inclusions', i)}><X size={14} /></button>
                </div>
              ))}
              <div className="admin-list-add">
                <input id="inclusions-input" placeholder="Add inclusion..." />
                <button onClick={() => addListItem('inclusions')}><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <div className="admin-card admin-card--glass">
            <div className="admin-card__header"><h2 className="admin-card__title">Exclusions</h2></div>
            <div className="admin-list-field">
              {(Array.isArray(form.exclusions) ? form.exclusions : []).map((item, i) => (
                <div key={i} className="admin-list-item admin-list-item--red">
                  <span>{item}</span>
                  <button onClick={() => removeListItem('exclusions', i)}><X size={14} /></button>
                </div>
              ))}
              <div className="admin-list-add">
                <input id="exclusions-input" placeholder="Add exclusion..." />
                <button onClick={() => addListItem('exclusions')}><Plus size={16} /></button>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="admin-card admin-card--glass">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Departure Dates</h2>
                <span className="admin-card__badge">{dates.length} dates</span>
              </div>
              <div className="admin-dates-list">
                {dates.map((date) => (
                  <div key={date.id} className="admin-date-item">
                    <div className="admin-date-item__info">
                      <span className="admin-date-item__date">
                        {new Date(date.departure_date).toLocaleDateString()} — {new Date(date.return_date).toLocaleDateString()}
                      </span>
                      <span className="admin-date-item__price">${date.price_per_person} pp · {date.slots_available} slots</span>
                    </div>
                    <span className={`admin-badge admin-badge--${date.status === 'available' ? 'paid' : 'pending'}`}>
                      {date.status}
                    </span>
                    <button className="admin-pkg-action admin-pkg-action--delete" onClick={() => deleteDate(date.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="admin-add-day">
                <h3 className="admin-add-day__title">Add Date</h3>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Departure</label>
                    <input type="date" value={newDate.departure_date} onChange={e => setNewDate(p => ({ ...p, departure_date: e.target.value }))} />
                  </div>
                  <div className="admin-field">
                    <label>Return</label>
                    <input type="date" value={newDate.return_date} onChange={e => setNewDate(p => ({ ...p, return_date: e.target.value }))} />
                  </div>
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Price per person ($)</label>
                    <input type="number" value={newDate.price_per_person} onChange={e => setNewDate(p => ({ ...p, price_per_person: e.target.value }))} placeholder="1200" />
                  </div>
                  <div className="admin-field">
                    <label>Slots Available</label>
                    <input type="number" value={newDate.slots_available} onChange={e => setNewDate(p => ({ ...p, slots_available: e.target.value }))} placeholder="10" />
                  </div>
                </div>
                <button className="admin-add-btn" onClick={addDate}><Plus size={16} /> Add Date</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}