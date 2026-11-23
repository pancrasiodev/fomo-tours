import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Package,
  Plus,
  Eye,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
  Image as ImageIcon,
  UploadCloud,
  Upload,
  Camera,
  Check
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import { CAKES_CATALOG } from '../../data/cakesData.js'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackages.css'
import './AdminCakeOrders.css'

const CATEGORY_TABS = [
  { key: 'all', label: 'All Items' },
  { key: 'birthday', label: 'Celebration' },
  { key: 'wedding', label: 'Weddings' },
  { key: 'bento', label: 'Petite Studio' },
  { key: 'custom', label: 'Bespoke' },
  { key: 'graduation', label: 'Confections' },
]

const IMAGE_PRESETS = [
  { label: 'Artisanal Collection', src: '/images/lany/cakes-1.webp' },
  { label: 'Birthday Celebrations', src: '/images/lany/birthday-cakes.webp' },
  { label: 'Wedding Botanical', src: '/images/lany/bridal-cakes.webp' },
  { label: 'Custom Fondant', src: '/images/lany/custom-cakes.webp' },
  { label: 'Graduation Cap', src: '/images/lany/graduation-cakes.webp' },
  { label: 'Artisan Cupcakes', src: '/images/lany/cupcakes.webp' },
]

export default function AdminPackages() {
  const [cakes, setCakes] = useState(CAKES_CATALOG)
  const [admin, setAdmin] = useState(null)
  const [search, setSearch] = useState('')
  const [addCakeModalOpen, setAddCakeModalOpen] = useState(false)
  const [actionNotice, setActionNotice] = useState('')
  const [newCakeForm, setNewCakeForm] = useState({
    name: '',
    category: 'birthday',
    price: '',
    servings: '10-12 generous portions',
    weight: '1.5 kg',
    description: '',
    image: '/images/lany/birthday-cakes.webp'
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [uploadFileName, setUploadFileName] = useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target.result
      setUploadFileName(file.name)
      setNewCakeForm(prev => ({ ...prev, image: result }))
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    let storedAdmin = null
    try {
      const stored = localStorage.getItem('fomo_admin')
      if (stored) storedAdmin = JSON.parse(stored)
    } catch {}
    if (!storedAdmin) {
      storedAdmin = {
        id: 1,
        email: 'carol@lanycakeshop.co.ke',
        full_name: 'Carol Jenny (Lany Cakes Studio)'
      }
      localStorage.setItem('fomo_admin', JSON.stringify(storedAdmin))
      localStorage.setItem('fomo_admin_token', 'lany-studio-dev')
    }
    setAdmin(storedAdmin)

    try {
      const custom = JSON.parse(localStorage.getItem('lany_custom_cakes') || '[]')
      if (custom.length > 0) {
        setCakes([...custom, ...CAKES_CATALOG])
      } else {
        setCakes(CAKES_CATALOG)
      }
    } catch {
      setCakes(CAKES_CATALOG)
    }
  }, [navigate])

  const setTab = (tab) => {
    if (tab === 'all') {
      searchParams.delete('tab')
      setSearchParams(searchParams, { replace: true })
    } else {
      setSearchParams({ tab }, { replace: true })
    }
  }

  const handleCreateCake = (e) => {
    e.preventDefault()
    if (!newCakeForm.name.trim() || !newCakeForm.price) {
      alert('Please enter a cake name and starting price.')
      return
    }

    const priceNum = Number(String(newCakeForm.price).replace(/\D/g, '')) || 3500
    const slug = newCakeForm.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const newCake = {
      id: `cake-${Date.now()}`,
      slug: slug || `cake-${Date.now()}`,
      name: newCakeForm.name.trim(),
      category: newCakeForm.category,
      price: priceNum,
      priceFormatted: `KSh ${priceNum.toLocaleString()}`,
      servings: newCakeForm.servings.trim() || '10-12 slices',
      defaultWeight: newCakeForm.weight.trim() || '1.5 kg',
      availableWeights: [
        { weight: newCakeForm.weight.trim() || '1.5 kg', price: priceNum },
        { weight: '2 kg', price: Math.round((priceNum * 1.25) / 100) * 100 }
      ],
      description: newCakeForm.description.trim() || 'Freshly baked artisanal specialty handcrafted at Lany Studio.',
      image: newCakeForm.image || '/images/lany/cakes-1.webp',
      images: [newCakeForm.image || '/images/lany/cakes-1.webp'],
      status: 'published'
    }

    const updated = [newCake, ...cakes]
    setCakes(updated)
    try {
      const storedCustom = JSON.parse(localStorage.getItem('lany_custom_cakes') || '[]')
      localStorage.setItem('lany_custom_cakes', JSON.stringify([newCake, ...storedCustom]))
    } catch {}

    setAddCakeModalOpen(false)
    setActionNotice(`Cake "${newCake.name}" successfully added to catalog!`)
    setTimeout(() => setActionNotice(''), 3500)
    setNewCakeForm({
      name: '',
      category: 'birthday',
      price: '',
      servings: '10-12 generous portions',
      weight: '1.5 kg',
      description: '',
      image: '/images/lany/birthday-cakes.webp'
    })
  }

  const filteredCakes = cakes.filter((cake) => {
    if (activeTab !== 'all') {
      const cat = (cake.category || '').toLowerCase()
      if (activeTab === 'birthday' && !cat.includes('birthday') && !cat.includes('boys')) return false
      if (activeTab === 'wedding' && !cat.includes('wedding')) return false
      if (activeTab === 'bento' && !cat.includes('bento')) return false
      if (activeTab === 'custom' && !cat.includes('custom') && !cat.includes('fondant')) return false
      if (activeTab === 'graduation' && !cat.includes('graduation')) return false
    }

    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (cake.name || '').toLowerCase().includes(q) ||
      (cake.category || '').toLowerCase().includes(q) ||
      (cake.description || '').toLowerCase().includes(q)
    )
  })

  return (
    <AdminLayout admin={admin} search={search} onSearch={setSearch}>
      <div className="admin-packages-top">
        <div className="admin-page-title">
          <h1>Product Catalog</h1>
          <p>
            {cakes.length} signature creations active &bull; Real-time pricing &amp; specifications
          </p>
        </div>
        <div className="admin-packages__cta-group">
          <button
            type="button"
            className="admin-packages__add"
            onClick={() => setAddCakeModalOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add New Item</span>
          </button>

          <button
            type="button"
            className="admin-packages__add admin-packages__add--secondary"
            onClick={() => navigate('/admin/cake-orders')}
          >
            <ShoppingBag size={15} />
            <span>Orders</span>
          </button>
          
          <a
            href="/cakes"
            target="_blank"
            rel="noreferrer"
            className="admin-packages__add admin-packages__add--secondary"
          >
            <ExternalLink size={15} />
            <span>Storefront</span>
          </a>
        </div>
      </div>

      {actionNotice && (
        <div className="admin-action-notice" style={{ marginTop: '16px' }}>
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="admin-pkg-tabs" style={{ marginTop: '20px' }}>
        {CATEGORY_TABS.map((tab) => {
          let count = cakes.length
          if (tab.key !== 'all') {
            count = cakes.filter(c => {
              const cat = (c.category || '').toLowerCase()
              if (tab.key === 'birthday') return cat.includes('birthday') || cat.includes('boys')
              if (tab.key === 'wedding') return cat.includes('wedding')
              if (tab.key === 'bento') return cat.includes('bento')
              if (tab.key === 'custom') return cat.includes('custom') || cat.includes('fondant')
              if (tab.key === 'graduation') return cat.includes('graduation')
              return true
            }).length
          }
          return (
            <button
              key={tab.key}
              type="button"
              className={`admin-pkg-tab ${activeTab === tab.key ? 'admin-pkg-tab--active' : ''}`}
              onClick={() => setTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="admin-pkg-tab__count">{count}</span>
            </button>
          )
        })}
      </div>

      {filteredCakes.length === 0 ? (
        <div className="admin-card" style={{ marginTop: '18px' }}>
          <div className="admin-empty-state">
            <Package size={32} />
            <p>No cakes match your filter.</p>
          </div>
        </div>
      ) : (
        <div className="admin-card" style={{ marginTop: '18px' }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>Category</th>
                  <th>Portions / Yield</th>
                  <th>Starting Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCakes.map((cake) => (
                  <tr key={cake.id}>
                    <td>
                      <div className="admin-pkg-row">
                        <img
                          src={cake.image}
                          alt={cake.name}
                          className="admin-pkg-row__img"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="admin-pkg-row__title">{cake.name}</div>
                          <div className="admin-pkg-row__slug">/cake/{cake.slug || cake.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#374151' }}>
                        {cake.category || 'Artisanal'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#4B5563', fontSize: '13px' }}>
                        {cake.servings || '10-12 slices'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#24080D', fontSize: '14px', fontWeight: 800 }}>
                        {cake.priceFormatted || `KSh ${cake.price?.toLocaleString()}`}
                      </strong>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--published">
                        PUBLISHED
                      </span>
                    </td>
                    <td>
                      <div className="admin-pkg-actions">
                        <Link
                          to={`/cake/${cake.slug || cake.id}`}
                          target="_blank"
                          className="admin-pkg-action"
                          title="View live cake page"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD NEW CAKE MODAL DRAWER */}
      {addCakeModalOpen && (
        <div className="admin-order-modal-overlay" onClick={() => setAddCakeModalOpen(false)}>
          <div className="admin-order-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <span className="modal-ref-tag" style={{ background: '#24080D', color: '#FEF5A7' }}>New Cake Product</span>
                <h3>Add Cake to Catalog</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setAddCakeModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateCake} className="modal-body">
              <div className="modal-card">
                <h4>Product Details &amp; Sizing</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                  <div className="q-field">
                    <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Cake Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Belgian Truffle Chocolate Fudge Cake"
                      value={newCakeForm.name}
                      onChange={e => setNewCakeForm({ ...newCakeForm, name: e.target.value })}
                      style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="q-field">
                      <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Category *</label>
                      <select
                        value={newCakeForm.category}
                        onChange={e => setNewCakeForm({ ...newCakeForm, category: e.target.value })}
                        style={{ height: '42px', padding: '0 10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', background: '#FFFFFF' }}
                      >
                        <option value="birthday">Birthday Cake</option>
                        <option value="wedding">Wedding Cake</option>
                        <option value="bento">Bento Lunchbox Cake</option>
                        <option value="custom">Custom / Fondant</option>
                        <option value="graduation">Graduation Cake</option>
                        <option value="cupcakes">Cupcake Box</option>
                      </select>
                    </div>

                    <div className="q-field">
                      <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Starting Price (KSh) *</label>
                      <input
                        type="number"
                        required
                        placeholder="3600"
                        value={newCakeForm.price}
                        onChange={e => setNewCakeForm({ ...newCakeForm, price: e.target.value })}
                        style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="q-field">
                      <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Default Weight / Sizing</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.5 kg"
                        value={newCakeForm.weight}
                        onChange={e => setNewCakeForm({ ...newCakeForm, weight: e.target.value })}
                        style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem' }}
                      />
                    </div>

                    <div className="q-field">
                      <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Portions / Servings</label>
                      <input
                        type="text"
                        placeholder="e.g. 10-12 slices"
                        value={newCakeForm.servings}
                        onChange={e => setNewCakeForm({ ...newCakeForm, servings: e.target.value })}
                        style={{ height: '42px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  {/* Photo Upload & Preset Selector */}
                  <div className="q-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Item Photo</label>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 500 }}>Upload device photo or pick studio preset</span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    {/* Drag-and-drop / Device Upload Box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#F8FAFC',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#7A152F'
                        e.currentTarget.style.background = '#FFF5F7'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#CBD5E1'
                        e.currentTarget.style.background = '#F8FAFC'
                      }}
                    >
                      {newCakeForm.image && newCakeForm.image.startsWith('data:') ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', justifyContent: 'center' }}>
                          <img
                            src={newCakeForm.image}
                            alt="Uploaded preview"
                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #7A152F' }}
                          />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={16} style={{ color: '#059669' }} /> Custom Photo Uploaded
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                              {uploadFileName || 'Custom image ready'} &bull; Click to replace
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FCE7F3', color: '#7A152F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UploadCloud size={22} />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#7A152F' }}>
                              Click to upload photo from device
                            </span>
                            <span style={{ fontSize: '0.84rem', color: '#4B5563' }}> or drag and drop</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                            PNG, JPG, WEBP from your phone or computer
                          </span>
                        </>
                      )}
                    </div>

                    {/* Presets Grid */}
                    <div style={{ marginTop: '14px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Or Choose From Studio Presets
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' }}>
                        {IMAGE_PRESETS.map((preset, idx) => {
                          const isSelected = newCakeForm.image === preset.src
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setUploadFileName('')
                                setNewCakeForm({ ...newCakeForm, image: preset.src })
                              }}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #7A152F' : '1px solid #E5E7EB',
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                background: isSelected ? '#FFF5F7' : '#FFFFFF',
                                transition: 'all 0.15s'
                              }}
                            >
                              <img src={preset.src} alt={preset.label} style={{ width: '100%', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSelected ? '#7A152F' : '#374151', marginTop: '4px', textAlign: 'center' }}>
                                {preset.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="q-field">
                    <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>Short Description</label>
                    <textarea
                      placeholder="Layered with signature buttercream, Belgian chocolate ganache..."
                      value={newCakeForm.description}
                      onChange={e => setNewCakeForm({ ...newCakeForm, description: e.target.value })}
                      style={{ height: '70px', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.92rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setAddCakeModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    color: '#374151',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#24080D',
                    color: '#FEF5A7',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(36, 8, 13, 0.25)'
                  }}
                >
                  Publish Cake to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
