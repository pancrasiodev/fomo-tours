import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  ExternalLink,
  Sparkles,
  Search,
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import {
  JOURNAL_STEPS,
  JOURNAL_CATEGORIES,
  createBlankJournalDraft,
  getManagedJournalBySlug,
  syncJournalsFromApi,
  saveManagedJournal,
  estimateReadTime,
  computeJournalCompletion,
} from '../../utils/journalStore.js'
import {
  slugifyTrip,
  fileToCompressedDataUrl,
  getAllManagedTrips,
  syncTripsFromApi,
} from '../../utils/tripStore.js'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackageForm.css'

const LIBRARY_PHOTOS = [
  { label: 'Diani Coast', src: '/images/diani-coast.jpg' },
  { label: 'Kilimanjaro', src: '/images/Kilimanjaro.webp' },
  { label: 'Safari Cruiser', src: '/images/safari-trip.webp' },
  { label: 'Expedition Truck', src: '/images/tourist-truck.webp' },
  { label: 'Leopard', src: '/images/leopard-hero.webp' },
  { label: 'Wildebeest', src: '/images/wildbeast.webp' },
  { label: 'Naivasha', src: '/images/lake-naivasha.jpg' },
  { label: 'Nakuru', src: '/images/lake-nakuru.jpg' },
  { label: 'Tsavo', src: '/images/tsavo-elephants.jpg' },
  { label: 'Mt Kenya', src: '/images/mt-kenya.webp' },
  { label: 'Ocean Wave', src: '/images/coast-aerial-wave.jpg' },
  { label: 'Dhow Sunset', src: '/images/dhow-sunset.jpg' },
]

function hydrateJournal(loaded) {
  const bodyText =
    typeof loaded.bodyText === 'string'
      ? loaded.bodyText
      : Array.isArray(loaded.body)
        ? loaded.body.join('\n\n')
        : String(loaded.body || '')

  return {
    ...loaded,
    category: (loaded.category || 'ON THE ROAD').toUpperCase(),
    readTime: loaded.readTime || '4 MIN READ',
    autoReadTime: loaded.autoReadTime !== false,
    bodyText,
    relatedTripSlug: loaded.relatedTripSlug || '',
    seoKeyword: loaded.seoKeyword || '',
    seoTitle: loaded.seoTitle || '',
    seoDescription: loaded.seoDescription || '',
    allowIndexing: loaded.allowIndexing !== false,
  }
}

export default function AdminJournalForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(null)
  const [seoOpen, setSeoOpen] = useState(true)

  const [post, setPost] = useState(() => {
    if (id) {
      const existing = getManagedJournalBySlug(id)
      if (existing) return hydrateJournal(existing)
    }
    return createBlankJournalDraft()
  })

  const [activeStep, setActiveStep] = useState(() => {
    if (id) {
      const existing = getManagedJournalBySlug(id)
      if (existing && typeof existing.currentStep === 'number') {
        return Math.min(3, Math.max(0, existing.currentStep))
      }
    }
    return 0
  })

  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [publishedSlug, setPublishedSlug] = useState('')
  const [resumedNote, setResumedNote] = useState(() => {
    if (!id) return ''
    const existing = getManagedJournalBySlug(id)
    if (existing?.status === 'draft' && (existing.currentStep || 0) > 0) {
      const stepLabel = JOURNAL_STEPS[existing.currentStep]?.label || ''
      return `Resumed saved story draft — Step ${existing.currentStep + 1} of ${JOURNAL_STEPS.length} (${stepLabel}).`
    }
    return ''
  })

  const availableTrips = getAllManagedTrips({ includeDrafts: false, excludeAliases: true })
  const rawCoverFileRef = useRef(null)
  const hasInteractedRef = useRef(false)
  const coverInputRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) {
      navigate('/admin')
      return
    }
    setAdmin(JSON.parse(stored))
    syncJournalsFromApi({ includeDrafts: true })
    syncTripsFromApi({ includeDrafts: false })
  }, [navigate])

  useEffect(() => {
    if (!id) return undefined
    const syncFromStore = () => {
      if (hasInteractedRef.current) return
      const existing = getManagedJournalBySlug(id)
      if (existing) {
        const hydrated = hydrateJournal(existing)
        setPost(hydrated)
        setActiveStep(Math.min(3, Math.max(0, hydrated.currentStep || 0)))
      }
    }
    syncFromStore()
    window.addEventListener('fomo-journals-updated', syncFromStore)
    return () => window.removeEventListener('fomo-journals-updated', syncFromStore)
  }, [id])

  const persistNow = async (
    nextPost,
    nextStepIndex = activeStep,
    { syncApi = true, forceStatus } = {}
  ) => {
    const payload = {
      ...nextPost,
      currentStep: nextStepIndex,
      status: forceStatus || nextPost.status || 'draft',
    }
    const saved = await saveManagedJournal(payload, {
      syncApi,
      rawCoverFile: rawCoverFileRef.current,
    })

    if (!id) {
      navigate(`/admin/journal/edit/${saved.id}`, { replace: true })
    }
    return saved
  }

  useEffect(() => {
    if (!hasInteractedRef.current) return undefined
    const timer = setTimeout(() => {
      persistNow(post, activeStep, { syncApi: true })
    }, 650)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post])

  const markDirty = (updater) => {
    hasInteractedRef.current = true
    setPublishedSlug('')
    setPost((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }

  const handleTitleChange = (val) => {
    markDirty((prev) => ({
      ...prev,
      title: val,
      slug: slugTouched ? prev.slug : slugifyTrip(val),
    }))
  }

  const handleField = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (key === 'slug') setSlugTouched(true)
    if (key === 'readTime') {
      markDirty((prev) => ({ ...prev, readTime: val, autoReadTime: false }))
      return
    }
    markDirty((prev) => ({ ...prev, [key]: val }))
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    rawCoverFileRef.current = file
    const compressed = await fileToCompressedDataUrl(file)
    markDirty((prev) => ({ ...prev, image: compressed }))
  }

  const goToStep = async (nextStep) => {
    const clamped = Math.min(3, Math.max(0, nextStep))
    setResumedNote('')
    const nextCompleted = Array.from({ length: clamped }, (_, idx) => idx)
    const updated = { ...post, completedSteps: nextCompleted, currentStep: clamped }
    setPost(updated)
    setActiveStep(clamped)
    await persistNow(updated, clamped, { syncApi: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveAndExitDraft = async () => {
    await persistNow(post, activeStep, { syncApi: true, forceStatus: 'draft' })
    navigate('/admin/journal?tab=drafts')
  }

  const handlePublish = async () => {
    const finalTitle = post.title?.trim() || 'Notes from the Kenyan Trail'
    const nextPayload = {
      ...post,
      title: finalTitle,
      slug: post.slug?.trim() || slugifyTrip(finalTitle),
      status: 'published',
      currentStep: 3,
      completedSteps: [0, 1, 2, 3],
    }
    const saved = await persistNow(nextPayload, 3, {
      syncApi: true,
      forceStatus: 'published',
    })
    setPost((prev) => ({ ...prev, status: 'published', slug: saved.slug, title: saved.title }))
    setPublishedSlug(saved.slug)
  }

  const wordCount = String(post.bodyText || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  const liveReadTime =
    post.autoReadTime !== false && wordCount > 0
      ? estimateReadTime(post.bodyText)
      : post.readTime || '4 MIN READ'

  const completionPct = computeJournalCompletion(post)

  // Effective SEO values (auto-fallback when left empty)
  const effectiveSeoTitle =
    post.seoTitle?.trim() ||
    (post.title?.trim() ? `${post.title.trim()} | FOMO Tours Kenya` : 'Story Title | FOMO Tours Kenya')
  const effectiveSeoDesc =
    post.seoDescription?.trim() ||
    post.excerpt?.trim() ||
    'Planning advice, packing lists and honest Kenyan safari guides from FOMO Tours.'
  const effectiveSlug = post.slug?.trim() || slugifyTrip(post.title || 'story-slug')
  const kw = (post.seoKeyword || '').trim().toLowerCase()
  const kwInTitle = kw ? effectiveSeoTitle.toLowerCase().includes(kw) : false
  const kwInDesc = kw ? effectiveSeoDesc.toLowerCase().includes(kw) : false
  const kwInBody = kw ? String(post.bodyText || '').toLowerCase().includes(kw) : false

  return (
    <AdminLayout admin={admin}>
      {/* Top Bar */}
      <div className="wizard-topbar">
        <div className="wizard-topbar__left">
          <button
            type="button"
            className="wizard-back-btn"
            onClick={() => navigate('/admin/journal')}
            title="Back to Journal Stories"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="admin-page-title">
            <h1>{post.title?.trim() ? post.title : 'Write Journal Story — Step by Step'}</h1>
          </div>
        </div>

        <div className="wizard-topbar__actions">
          {!seoOpen && (
            <button
              type="button"
              className="journal-seo-open-pill"
              onClick={() => setSeoOpen(true)}
            >
              <Search size={13} />
              <span>Open SEO Sidebar (Optional)</span>
            </button>
          )}

          <button type="button" className="wizard-btn-ghost" onClick={handleSaveAndExitDraft}>
            Save &amp; Exit to Drafts
          </button>

          {post.status === 'published' && post.slug && (
            <Link
              to={`/journal/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="wizard-btn-ghost"
            >
              <span>View Live Story</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>

      {resumedNote && (
        <div className="wizard-toast">
          <span>{resumedNote}</span>
          <button type="button" className="wizard-btn-ghost" onClick={() => setResumedNote('')}>
            Got it
          </button>
        </div>
      )}

      {publishedSlug && (
        <div className="wizard-toast">
          <span>
            🎉 <strong>{post.title}</strong> is now live on the Journal &amp; Home page!
          </span>
          <Link
            to={`/journal/${publishedSlug}`}
            target="_blank"
            rel="noreferrer"
            className="wizard-btn-dark"
          >
            <span>Open /journal/{publishedSlug}</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      )}

      {/* 4-Step Stepper */}
      <nav className="wizard-stepper wizard-stepper--4" aria-label="Journal story steps">
        {JOURNAL_STEPS.map((step) => {
          const isCurrent = activeStep === step.index
          const isDone = step.index < activeStep
          return (
            <button
              key={step.key}
              type="button"
              className={`wizard-step-tab ${isCurrent ? 'wizard-step-tab--active' : ''} ${isDone ? 'wizard-step-tab--done' : ''}`}
              onClick={() => goToStep(step.index)}
            >
              <span className="wizard-step-tab__num">{step.index + 1}</span>
              <span className="wizard-step-tab__copy">
                <span className="wizard-step-tab__eyebrow">Step {step.index + 1}</span>
                <span className="wizard-step-tab__label">{step.label}</span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Shell: Optional Left SEO Sidebar + Main Step Wizard */}
      <div className={`journal-studio-shell ${seoOpen ? '' : 'journal-studio-shell--collapsed'}`}>
        {/* ─── OPTIONAL LEFT SEO SIDEBAR ─── */}
        {seoOpen && (
          <aside className="journal-seo-sidebar" aria-label="Optional SEO settings">
            <div className="journal-seo-sidebar__head">
              <div className="journal-seo-sidebar__title-wrap">
                <h2 className="journal-seo-sidebar__title">SEO Settings</h2>
                <span className="journal-seo-optional-pill">Optional</span>
              </div>
              <button
                type="button"
                className="journal-seo-toggle-btn"
                onClick={() => setSeoOpen(false)}
                title="Collapse optional SEO sidebar"
              >
                Hide
              </button>
            </div>

            <p className="journal-seo-hint">
              Leave blank anytime — Google automatically falls back to your story headline &amp;
              lead excerpt.
            </p>

            {/* Live Google Search Preview */}
            <div className="journal-seo-serp">
              <span className="journal-seo-serp__label">Google Search Preview</span>
              <div className="journal-seo-serp__url">
                fomotours.co.ke › journal › {effectiveSlug}
              </div>
              <div className="journal-seo-serp__title">{effectiveSeoTitle}</div>
              <div className="journal-seo-serp__desc">{effectiveSeoDesc}</div>
            </div>

            <div className="wizard-field">
              <label htmlFor="seo-kw">
                Focus Keyword <span>Optional</span>
              </label>
              <input
                id="seo-kw"
                value={post.seoKeyword || ''}
                onChange={handleField('seoKeyword')}
                placeholder="e.g. lake naivasha day trip"
              />
              {kw && (
                <div className="journal-seo-checks">
                  <span className={`journal-seo-check ${kwInTitle ? 'journal-seo-check--pass' : ''}`}>
                    {kwInTitle ? '✓' : '○'} In Title
                  </span>
                  <span className={`journal-seo-check ${kwInDesc ? 'journal-seo-check--pass' : ''}`}>
                    {kwInDesc ? '✓' : '○'} In Meta
                  </span>
                  <span className={`journal-seo-check ${kwInBody ? 'journal-seo-check--pass' : ''}`}>
                    {kwInBody ? '✓' : '○'} In Body
                  </span>
                </div>
              )}
            </div>

            <div className="wizard-field">
              <label htmlFor="seo-title">
                SEO Meta Title <span>{(post.seoTitle || '').length}/60</span>
              </label>
              <input
                id="seo-title"
                value={post.seoTitle || ''}
                onChange={handleField('seoTitle')}
                placeholder={post.title || 'Custom search title (optional)'}
              />
            </div>

            <div className="wizard-field">
              <label htmlFor="seo-desc">
                SEO Meta Description <span>{(post.seoDescription || '').length}/155</span>
              </label>
              <textarea
                id="seo-desc"
                rows={3}
                value={post.seoDescription || ''}
                onChange={handleField('seoDescription')}
                placeholder={post.excerpt || 'Custom search snippet (optional)'}
              />
            </div>

            <label className="journal-seo-switch">
              <span>Allow search indexing</span>
              <input
                type="checkbox"
                checked={post.allowIndexing !== false}
                onChange={handleField('allowIndexing')}
              />
            </label>
          </aside>
        )}

        {/* ─── MAIN STEP CONTAINERS + PLAIN-BG FOOTER ─── */}
        <div className="wizard-main-col">
          {/* STEP 1: HEADLINE & CATEGORY */}
          {activeStep === 0 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>What is this story about?</h2>
                  <p>
                    Choose a category tag, write a clear editorial title, and add the short 1–2
                    sentence teaser shown on Journal cards.
                  </p>
                </div>

                <div className="wizard-field">
                  <label>Story Category</label>
                  <div className="wizard-cat-pills">
                    {JOURNAL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`wizard-cat-pill ${post.category === cat ? 'wizard-cat-pill--active' : ''}`}
                        onClick={() => markDirty((prev) => ({ ...prev, category: cat }))}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="wizard-panel">
                <div className="wizard-fields">
                  <div className="wizard-field">
                    <label htmlFor="jn-title">Story Headline</label>
                    <input
                      id="jn-title"
                      value={post.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. How to plan an effortless Saturday day trip to Lake Naivasha"
                    />
                  </div>

                  <div className="wizard-row">
                    <div className="wizard-field">
                      <label htmlFor="jn-slug">
                        URL Slug <span>/journal/{post.slug || 'story-slug'}</span>
                      </label>
                      <input
                        id="jn-slug"
                        value={post.slug}
                        onChange={handleField('slug')}
                        placeholder="auto-generated-from-headline"
                      />
                    </div>

                    <div className="wizard-field">
                      <label htmlFor="jn-read">
                        Read Time <span>Auto-updates from story length</span>
                      </label>
                      <input
                        id="jn-read"
                        value={liveReadTime}
                        onChange={handleField('readTime')}
                        placeholder="5 MIN READ"
                      />
                    </div>
                  </div>

                  <div className="wizard-field">
                    <label htmlFor="jn-excerpt">
                      Lead Excerpt <span>Appears on Journal cards &amp; article intro</span>
                    </label>
                    <textarea
                      id="jn-excerpt"
                      rows={3}
                      value={post.excerpt}
                      onChange={handleField('excerpt')}
                      placeholder="Write 1–2 engaging sentences that invite travelers to read the story..."
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: HERO COVER PHOTO */}
          {activeStep === 1 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>Upload the story hero image</h2>
                  <p>
                    Displayed on the Journal grid, Home page Journal section, and full-width at
                    the top of the article.
                  </p>
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleCoverUpload}
                />

                <div
                  className="wizard-journal-hero-drop"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {post.image ? (
                    <>
                      <img src={post.image} alt={post.alt || post.title || 'Story cover'} />
                      <div className="wizard-bento__overlay-actions">
                        <span className="wizard-bento__badge">Story Cover Photo</span>
                        <div className="wizard-bento__btns">
                          <button
                            type="button"
                            className="wizard-bento__mini-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              coverInputRef.current?.click()
                            }}
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            className="wizard-bento__mini-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              markDirty((prev) => ({ ...prev, image: '' }))
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="wizard-bento__empty">
                      <Upload size={26} />
                      <strong>Click to upload landscape cover photo</strong>
                      <span>Auto-compressed &amp; saved directly in your draft</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="wizard-panel">
                <div className="wizard-library__top">
                  <span className="wizard-library__title">
                    <Sparkles size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />
                    Or choose from FOMO’s Kenyan photo library:
                  </span>
                </div>
                <div className="wizard-library__thumbs">
                  {LIBRARY_PHOTOS.map((photo) => (
                    <button
                      key={photo.src}
                      type="button"
                      className="wizard-library__thumb"
                      onClick={() => markDirty((prev) => ({ ...prev, image: photo.src }))}
                      title={`Use ${photo.label}`}
                    >
                      <img src={photo.src} alt={photo.label} loading="lazy" />
                    </button>
                  ))}
                </div>

                <div className="wizard-field">
                  <label htmlFor="jn-alt">
                    Image Description / Alt Text <span>Good for SEO &amp; accessibility</span>
                  </label>
                  <input
                    id="jn-alt"
                    value={post.alt}
                    onChange={handleField('alt')}
                    placeholder="e.g. Morning mist rising over Lake Naivasha acacia shoreline"
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 3: WRITE STORY */}
          {activeStep === 2 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>Write the article &amp; link an optional trip</h2>
                  <p>
                    Separate paragraphs with a blank line. Next you will review a full summary
                    before publishing.
                  </p>
                </div>

                <div className="wizard-field">
                  <label htmlFor="jn-body">
                    Article Body{' '}
                    <span>
                      {wordCount} words · {liveReadTime}
                    </span>
                  </label>
                  <textarea
                    id="jn-body"
                    className="wizard-story-editor"
                    rows={11}
                    value={post.bodyText}
                    onChange={handleField('bodyText')}
                    placeholder={
                      'Write your story here...\n\nLeave a blank line between paragraphs for clean editorial spacing on the live page.'
                    }
                  />
                </div>
              </div>

              <div className="wizard-panel">
                <div className="wizard-field">
                  <label htmlFor="jn-trip">
                    Link a Related Trip at Bottom of Story <span>Optional conversion card</span>
                  </label>
                  <select
                    id="jn-trip"
                    value={post.relatedTripSlug}
                    onChange={handleField('relatedTripSlug')}
                  >
                    <option value="">No linked trip</option>
                    {availableTrips.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.title} ({t.duration} · {t.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* STEP 4: PRE-PUBLISH SUMMARY */}
          {activeStep === 3 && (
            <div className="wizard-panel">
              <div className="wizard-panel__head">
                <h2>Review your story before publishing</h2>
                <p>
                  Check your cover card, paragraphs, and optional SEO snippet below. Click{' '}
                  <strong>Edit</strong> on any section to tweak before going live.
                </p>
              </div>

              <div className="wizard-summary-stack">
                {(() => {
                  const missing = []
                  if (!post.title?.trim()) missing.push('Headline')
                  if (!post.image) missing.push('Cover Photo')
                  if (wordCount < 10) missing.push('Story Body')
                  return missing.length === 0 ? (
                    <div className="wizard-summary-readiness">
                      <span>✓ Ready to publish — headline, cover photo, and story body are set.</span>
                      <span>{wordCount} words · {liveReadTime}</span>
                    </div>
                  ) : (
                    <div className="wizard-summary-readiness wizard-summary-readiness--warn">
                      <span>Recommended before publishing: {missing.join(', ')}</span>
                      <span>{completionPct}% complete</span>
                    </div>
                  )
                })()}

                {/* Card & Cover Summary */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">Headline &amp; Cover Card</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="wizard-summary-edit" onClick={() => goToStep(0)}>
                        Edit Headline
                      </button>
                      <button type="button" className="wizard-summary-edit" onClick={() => goToStep(1)}>
                        Edit Photo
                      </button>
                    </div>
                  </div>

                  <div className="wizard-summary-hero">
                    <div
                      style={{
                        width: '100%',
                        height: 108,
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#dfd6c1',
                      }}
                    >
                      <img
                        src={post.image || '/images/diani-coast.jpg'}
                        alt={post.alt || 'Cover'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div>
                      <span className="admin-pkg-type">
                        {post.category} · {liveReadTime}
                      </span>
                      <h4 className="wizard-summary-headline">
                        {post.title || 'Untitled Story Draft'}
                      </h4>
                      <div className="wizard-summary-slug">/journal/{effectiveSlug}</div>
                      {post.excerpt && <p className="wizard-summary-sub">{post.excerpt}</p>}
                    </div>
                  </div>
                </div>

                {/* Story Body Preview */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">
                      Article Body ({wordCount} words)
                    </h3>
                    <button type="button" className="wizard-summary-edit" onClick={() => goToStep(2)}>
                      Edit Story
                    </button>
                  </div>

                  <div className="wizard-summary-days">
                    {(post.bodyText
                      ? post.bodyText
                          .split(/\n\s*\n/)
                          .map((p) => p.trim())
                          .filter(Boolean)
                      : []
                    )
                      .slice(0, 4)
                      .map((para, i) => (
                        <div key={i} className="wizard-summary-day">
                          {para}
                        </div>
                      ))}
                    {!post.bodyText?.trim() && (
                      <div className="wizard-summary-day">No story paragraphs written yet.</div>
                    )}
                  </div>
                </div>

                {/* Optional SEO Summary */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">SEO &amp; Linked Trip</h3>
                    {!seoOpen && (
                      <button
                        type="button"
                        className="wizard-summary-edit"
                        onClick={() => setSeoOpen(true)}
                      >
                        Open SEO Sidebar
                      </button>
                    )}
                  </div>

                  <div className="wizard-summary-facts">
                    <div className="wizard-summary-fact">
                      <span>Search Title</span>
                      <strong>{effectiveSeoTitle}</strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>Focus Keyword</span>
                      <strong>{post.seoKeyword || 'Auto (Optional)'}</strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>Linked Trip</span>
                      <strong>{post.relatedTripSlug ? `/trips/${post.relatedTripSlug}` : 'None'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Footer — on plain background below containers */}
          <div className="wizard-footer">
            <div>
              {activeStep > 0 && (
                <button
                  type="button"
                  className="wizard-btn-ghost"
                  onClick={() => goToStep(activeStep - 1)}
                >
                  <ArrowLeft size={15} />
                  <span>Previous Step</span>
                </button>
              )}
            </div>

            <div className="wizard-footer__right">
              <button type="button" className="wizard-btn-ghost" onClick={handleSaveAndExitDraft}>
                Save Draft for Later
              </button>

              {activeStep < 3 ? (
                <button
                  type="button"
                  className="wizard-btn-primary"
                  onClick={() => goToStep(activeStep + 1)}
                >
                  <span>{activeStep === 2 ? 'Review Summary' : 'Save & Continue'}</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button type="button" className="wizard-btn-primary" onClick={handlePublish}>
                  <Check size={16} strokeWidth={2.6} />
                  <span>
                    {post.status === 'published' ? 'Update Live Story' : 'Publish Story Live'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
