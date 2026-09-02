import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import AdminLayout from './AdminLayout'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackages.css'

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) { navigate('/admin'); return }
    setAdmin(JSON.parse(stored))
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const res = await fetch('http://localhost:5000/api/packages/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPackages(data.packages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (pkg) => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const newStatus = pkg.status === 'published' ? 'draft' : 'published'
      await fetch(`http://localhost:5000/api/packages/${pkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...pkg, status: newStatus })
      })
      fetchPackages()
    } catch (err) {
      console.error(err)
    }
  }

  const deletePackage = async (id) => {
    if (!confirm('Delete this package?')) return
    try {
      const token = localStorage.getItem('fomo_admin_token')
      await fetch(`http://localhost:5000/api/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPackages()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = packages.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.destinations?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout admin={admin} search={search} onSearch={setSearch}>
      <div className="admin-packages-top">
        <div className="admin-page-title">
          <h1>Packages</h1>
          <p>{packages.length} total packages</p>
        </div>
        <button className="admin-packages__add" onClick={() => navigate('/admin/packages/new')}>
          <Plus size={18} /> Add Package
        </button>
      </div>

      <div className="admin-card admin-card--glass">
        {loading ? (
          <p className="admin-empty">Loading packages...</p>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-state">
            <Package size={48} />
            <p>No packages found</p>
            <button className="admin-packages__add" onClick={() => navigate('/admin/packages/new')}>
              <Plus size={16} /> Add your first package
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Destinations</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <div className="admin-pkg-row">
                        <div
                          className="admin-pkg-row__img"
                          style={{
                            backgroundImage: pkg.cover_image
                              ? `url(http://localhost:5000${pkg.cover_image})`
                              : 'none'
                          }}
                        >
                          {!pkg.cover_image && <Package size={16} />}
                        </div>
                        <div>
                          <div className="admin-pkg-row__title">{pkg.title}</div>
                          <div className="admin-pkg-row__slug">/{pkg.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{pkg.destinations}</td>
                    <td>{pkg.duration}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${pkg.status === 'published' ? 'paid' : 'pending'}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-pkg-actions">
                        <button
                          className="admin-pkg-action admin-pkg-action--view"
                          onClick={() => toggleStatus(pkg)}
                          title={pkg.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {pkg.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          className="admin-pkg-action admin-pkg-action--edit"
                          onClick={() => navigate(`/admin/packages/edit/${pkg.id}`)}
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="admin-pkg-action admin-pkg-action--delete"
                          onClick={() => deletePackage(pkg.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}