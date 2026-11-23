import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import {
  getAllManagedJournals,
  syncJournalsFromApi,
  toggleManagedJournalStatus,
  deleteManagedJournal,
  computeJournalCompletion,
  JOURNAL_STEPS,
} from '../../utils/journalStore.js'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackages.css'

export default function AdminJournal() {
  const [posts, setPosts] = useState([])
  const [admin, setAdmin] = useState(null)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) {
      navigate('/admin')
      return undefined
    }
    setAdmin(JSON.parse(stored))

    const refresh = () => {
      setPosts(getAllManagedJournals({ includeDrafts: true }))
    }
    refresh()
    syncJournalsFromApi({ includeDrafts: true })
    window.addEventListener('fomo-journals-updated', refresh)
    return () => window.removeEventListener('fomo-journals-updated', refresh)
  }, [navigate])

  const setTab = (tab) => {
    if (tab === 'all') {
      searchParams.delete('tab')
      setSearchParams(searchParams, { replace: true })
    } else {
      setSearchParams({ tab }, { replace: true })
    }
  }

  const handleDelete = (post) => {
    const label = post.title || 'this story draft'
    if (!window.confirm(`Delete "${label}"?`)) return
    deleteManagedJournal(post.id)
  }

  const drafts = posts.filter((p) => p.status === 'draft')
  const published = posts.filter((p) => p.status === 'published')

  const filtered = posts.filter((p) => {
    if (activeTab === 'drafts' && p.status !== 'draft') return false
    if (activeTab === 'published' && p.status !== 'published') return false
    if (
      activeTab !== 'all' &&
      activeTab !== 'drafts' &&
      activeTab !== 'published' &&
      (p.category || '').toUpperCase() !== activeTab.toUpperCase()
    ) {
      return false
    }

    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q)
    )
  })

  const latestDraft = drafts[0]

  return (
    <AdminLayout admin={admin} search={search} onSearch={setSearch}>
      <div className="admin-packages-top">
        <div className="admin-page-title">
          <h1>Journal Stories</h1>
          <p>
            {published.length} live stories · {drafts.length} saved{' '}
            {drafts.length === 1 ? 'draft' : 'drafts'}
          </p>
        </div>

        <div className="admin-packages__cta-group">
          <button
            type="button"
            className="admin-packages__add"
            onClick={() => navigate('/admin/journal/new')}
          >
            <Plus size={16} /> Write New Story
          </button>
        </div>
      </div>

      {/* Resume Unfinished Journal Draft Banner */}
      {latestDraft && activeTab !== 'drafts' && (
        <div className="admin-draft-banner">
          <div className="admin-draft-banner__left">
            <span className="admin-draft-banner__dot" />
            <div>
              <div className="admin-draft-banner__title">
                You have {drafts.length} unfinished story {drafts.length === 1 ? 'draft' : 'drafts'}
              </div>
              <div className="admin-draft-banner__sub">
                Latest: <strong>{latestDraft.title || 'Untitled Story Draft'}</strong> · Left off at
                Step {(latestDraft.currentStep || 0) + 1} of {JOURNAL_STEPS.length} (
                {JOURNAL_STEPS[latestDraft.currentStep || 0]?.label})
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-draft-banner__btn"
            onClick={() => navigate(`/admin/journal/edit/${latestDraft.id}`)}
          >
            <span>Continue writing</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-pkg-tabs" role="tablist">
        {[
          { key: 'all', label: 'All Stories', count: posts.length },
          { key: 'drafts', label: 'Saved Drafts', count: drafts.length },
          { key: 'published', label: 'Published', count: published.length },
          {
            key: 'PLANNING',
            label: 'Planning',
            count: posts.filter((p) => p.category === 'PLANNING').length,
          },
          {
            key: 'DESTINATIONS',
            label: 'Destinations',
            count: posts.filter((p) => p.category === 'DESTINATIONS').length,
          },
          {
            key: 'ON THE ROAD',
            label: 'On the Road',
            count: posts.filter((p) => p.category === 'ON THE ROAD').length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-pkg-tab ${activeTab === tab.key ? 'admin-pkg-tab--active' : ''}`}
            onClick={() => setTab(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="admin-pkg-tab__count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <BookOpen size={40} />
            <p>
              {activeTab === 'drafts'
                ? 'No unfinished story drafts right now.'
                : 'No journal stories match your current filter.'}
            </p>
            <button
              type="button"
              className="admin-packages__add"
              onClick={() => navigate('/admin/journal/new')}
            >
              <Plus size={16} /> Write a Journal Story
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Story</th>
                  <th>Category</th>
                  <th>Read Time</th>
                  <th>Status / Step Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => {
                  const isDraft = post.status === 'draft'
                  const stepIdx = post.currentStep || 0
                  const stepInfo = JOURNAL_STEPS[stepIdx] || JOURNAL_STEPS[0]
                  const pct = post.completion ?? computeJournalCompletion(post)

                  return (
                    <tr key={post.id}>
                      <td>
                        <div className="admin-pkg-row">
                          <div
                            className="admin-pkg-row__img"
                            style={{
                              backgroundImage: post.image ? `url(${post.image})` : 'none',
                            }}
                          >
                            {!post.image && <BookOpen size={16} />}
                          </div>
                          <div>
                            <div className="admin-pkg-row__title">
                              {post.title || 'Untitled Story Draft'}
                            </div>
                            <div className="admin-pkg-row__slug">
                              /journal/{post.slug || post.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-pkg-type">{post.category || 'JOURNAL'}</span>
                      </td>

                      <td>{post.readTime || '4 MIN READ'}</td>

                      <td>
                        {isDraft ? (
                          <div className="admin-draft-progress">
                            <div className="admin-draft-progress__top">
                              <span>
                                Step {stepIdx + 1}/{JOURNAL_STEPS.length} · {stepInfo.short}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div className="admin-draft-progress__bar">
                              <div
                                className="admin-draft-progress__fill"
                                style={{ width: `${Math.max(15, pct)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge--published">Published</span>
                        )}
                      </td>

                      <td>
                        <div className="admin-pkg-actions">
                          {isDraft ? (
                            <button
                              type="button"
                              className="admin-pkg-resume-btn"
                              onClick={() => navigate(`/admin/journal/edit/${post.id}`)}
                            >
                              <span>Continue</span>
                              <ArrowRight size={13} />
                            </button>
                          ) : (
                            <>
                              <Link
                                to={`/journal/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-pkg-action"
                                title="Preview live story"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                type="button"
                                className="admin-pkg-action"
                                onClick={() => navigate(`/admin/journal/edit/${post.id}`)}
                                title="Edit story"
                              >
                                <Edit size={14} />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="admin-pkg-action"
                            onClick={() => toggleManagedJournalStatus(post.id)}
                            title={isDraft ? 'Publish now' : 'Move to Drafts'}
                          >
                            {isDraft ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          <button
                            type="button"
                            className="admin-pkg-action admin-pkg-action--delete"
                            onClick={() => handleDelete(post)}
                            title="Delete story"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
