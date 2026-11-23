import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Calendar, ChevronDown, Plus } from 'lucide-react'
import { DESTINATION_BLURBS } from '../data/siteData.js'
import { API_BASE } from '../config/api.js'
import { getManagedTripBySlug } from '../utils/tripStore.js'
import { renderLinkedParagraph, usePageSeo } from '../utils/seo.jsx'
import {
  createClientBooking,
  formatBookingMoney,
  initiateMpesaStkPush,
  checkMpesaStkStatus,
  saveGuestBookingRef,
} from '../utils/bookingStore.js'
import PreFooterCta from '../components/Home/PreFooterCta.jsx'
import './SafariDetailPage.css'

const TRAVELER_OPTIONS = [
  '1 traveler',
  '2 travelers',
  '3 travelers',
  '4 travelers',
  '5+ travelers (private group)',
]

function normalizeApiTrip(data) {
  const pkg = data.package || {}
  const days = Array.isArray(data.days) ? data.days : []
  const dates = Array.isArray(data.dates) ? data.dates : []
  const galleryRows = Array.isArray(data.gallery) ? data.gallery : []

  let inclusions = []
  try {
    inclusions = pkg.inclusions ? JSON.parse(pkg.inclusions) : []
  } catch {
    inclusions = []
  }

  const sideOne = pkg.gallery?.[0] || galleryRows[0]?.image_url || '/images/safari-trip.webp'
  const sideTwo = pkg.gallery?.[1] || galleryRows[1]?.image_url || '/images/sun-rise-drive.webp'

  const rawFirstDate = dates[0]?.departure_date || dates[0]?.start_date || pkg.departures?.[0]?.departure_date
  const firstDate = rawFirstDate
    ? new Date(rawFirstDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : pkg.nextDeparture || 'Fixed Departure'

  return {
    apiId: pkg.db_id || pkg.id,
    slug: pkg.slug,
    tripType: pkg.tripType || 'multi_day',
    departures: dates.length > 0 ? dates : Array.isArray(pkg.departures) ? pkg.departures : [],
    title: pkg.title || 'Kenyan Safari',
    seoTitle: pkg.seoTitle || '',
    seoDescription: pkg.seoDescription || '',
    duration: pkg.duration || `${days.length || 5} days`,
    groupSize: pkg.groupSize || pkg.group_size || 'Private & Scheduled Departures',
    level: pkg.level || pkg.difficulty || 'Easy',
    bestSeason: pkg.bestSeason || pkg.best_season || 'June to March',
    meetingPoint: pkg.meetingPoint || '',
    depositNote: pkg.depositNote || '',
    destination: pkg.destination || pkg.destinations || pkg.location || 'Maasai Mara',
    location: pkg.location || pkg.destinations || 'Kenya',
    price: pkg.price
      ? String(pkg.price).startsWith('$') || String(pkg.price).startsWith('KSh')
        ? pkg.price
        : `KSh ${Number(pkg.price).toLocaleString()}`
      : 'KSh 185,000',
    nextDeparture: firstDate,
    subtitle:
      pkg.subtitle ||
      pkg.short_description ||
      'Private and scheduled safari departures across Kenya, led by salaried local guides.',
    image: pkg.image || pkg.hero_image || '/images/wildbeast.webp',
    gallery: [sideOne, sideTwo],
    overview: Array.isArray(pkg.overview)
      ? pkg.overview
      : pkg.description
        ? String(pkg.description)
            .split(/\n\s*\n/)
            .filter(Boolean)
        : [
            'Every route is scouted firsthand by our Nairobi team with dedicated Kenyan guides and custom 4x4 Land Cruisers.',
          ],
    itinerary: Array.isArray(pkg.itinerary)
      ? pkg.itinerary
      : days.length > 0
        ? days.map((d) => ({
            day: `Day ${d.day_number}: ${d.title}`,
            desc: d.description || '',
          }))
        : [
            {
              day: 'Day 1: Arrival & Welcome Experience',
              desc: 'Meet your Kenyan guide on arrival and begin your guided adventure.',
            },
          ],
    included:
      Array.isArray(pkg.included) && pkg.included.length > 0
        ? pkg.included
        : inclusions.length > 0
          ? inclusions
          : [
              'Dedicated Kenyan safari guide throughout',
              'Round-trip transport and bottled drinking water',
            ],
    excluded: Array.isArray(pkg.excluded) ? pkg.excluded : [],
    whatToCarry: Array.isArray(pkg.whatToCarry) ? pkg.whatToCarry : [],
  }
}

export default function SafariDetailPage() {
  const { slug } = useParams()

  const [managedMatch, setManagedMatch] = useState(() => getManagedTripBySlug(slug))
  const [apiTrip, setApiTrip] = useState(null)
  const [loadingApi, setLoadingApi] = useState(!managedMatch)
  const [notFound, setNotFound] = useState(false)

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [traveler] = useState(() => {
    try {
      const raw = localStorage.getItem('fomo_traveler')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [checkoutMode, setCheckoutMode] = useState(traveler ? 'account' : 'guest')
  const [activeBookingRef, setActiveBookingRef] = useState('')
  const [copiedRef, setCopiedRef] = useState(false)

  const [stkState, setStkState] = useState({
    status: 'idle', // 'idle' | 'sending' | 'pending' | 'completed' | 'failed'
    checkoutRequestId: '',
    amountKes: 0,
    tillNumber: '9689363',
    receipt: '',
    message: '',
  })
  const [form, setForm] = useState({
    name: traveler?.name || '',
    email: traveler?.email || '',
    phone: traveler?.phone || '',
    departureDate: '',
    travelers: '1 traveler',
    paymentPlan: 'lipa_pole_pole', // 'full' | 'lipa_pole_pole'
    customDeposit: '',
    mpesaCode: '',
    notes: '',
  })

  useEffect(() => {
    const syncStore = () => {
      setManagedMatch(getManagedTripBySlug(slug))
    }
    syncStore()
    window.addEventListener('fomo-trips-updated', syncStore)
    return () => window.removeEventListener('fomo-trips-updated', syncStore)
  }, [slug])

  useEffect(() => {
    setSubmitted(false)
    let cancelled = false
    if (!managedMatch) {
      setLoadingApi(true)
    }
    setNotFound(false)

    fetch(`${API_BASE}/api/packages/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setApiTrip(normalizeApiTrip(data))
          setLoadingApi(false)
          setNotFound(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingApi(false)
          if (!managedMatch) {
            setNotFound(true)
          }
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug, managedMatch])

  const trip = apiTrip || managedMatch

  const tripSchema = trip
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TouristTrip',
            name: trip.title,
            description: trip.seoDescription || trip.subtitle || '',
            touristType: ['Adventure travelers', 'Wildlife enthusiasts', 'Families and solo travelers'],
            itinerary: Array.isArray(trip.itinerary)
              ? trip.itinerary.map((it, idx) => ({
                  '@type': 'Day',
                  name: `Day ${it.day || idx + 1}: ${it.title || ''}`,
                  description: it.desc || '',
                }))
              : [],
            offers: {
              '@type': 'Offer',
              price: trip.price ? String(trip.price).replace(/\D/g, '') || '0' : '0',
              priceCurrency: trip.price && trip.price.includes('$') ? 'USD' : 'KES',
              availability: 'https://schema.org/InStock',
              validFrom: '2026-01-01',
              url: `https://fomotours.co.ke/trips/${trip.slug || slug}`,
            },
            provider: {
              '@type': 'TravelAgency',
              name: 'FOMO Tours',
              url: 'https://fomotours.co.ke',
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://fomotours.co.ke',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Kenya Safaris',
                item: 'https://fomotours.co.ke/trips',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: trip.title,
                item: `https://fomotours.co.ke/trips/${trip.slug || slug}`,
              },
            ],
          },
        ],
      }
    : null

  usePageSeo({
    title: trip ? (trip.seoTitle?.trim() || `${trip.title} | FOMO Tours Kenya`) : '',
    description: trip ? (trip.seoDescription?.trim() || trip.subtitle || '') : '',
    canonicalPath: trip ? `/trips/${trip.slug || slug}` : '',
    image: trip?.image || '/images/wildbeast.webp',
    schema: tripSchema,
  })

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const guestMatch = String(form.travelers || '1').match(/\d+/)
  const numGuests = guestMatch ? Number(guestMatch[0]) : 2
  const rawPrice = String(trip?.price || '')
  const tripCurrency = rawPrice.includes('$') ? 'USD' : 'KSh'
  const unitPrice = Number(rawPrice.replace(/[^0-9.]/g, '') || 0)
  const totalTripCost = unitPrice * numGuests
  const calcDeposit =
    tripCurrency === 'KSh'
      ? (totalTripCost <= 50 ? Math.max(1, Math.round(totalTripCost * 0.3) || 1) : Math.max(1000, Math.round((totalTripCost * 0.3) / 100) * 100))
      : (totalTripCost <= 10 ? Math.max(1, Math.round(totalTripCost * 0.3) || 1) : Math.max(50, Math.round(totalTripCost * 0.3)))
  const minDeposit = Math.min(totalTripCost, Math.max(1, calcDeposit))
  const depositFloor = totalTripCost <= 50 ? 1 : minDeposit
  const chosenDeposit =
    form.customDeposit !== '' && Number(form.customDeposit) >= depositFloor
      ? Math.min(totalTripCost, Number(form.customDeposit))
      : minDeposit
  const dueToday = form.paymentPlan === 'lipa_pole_pole' ? chosenDeposit : totalTripCost
  const remainingLater = Math.max(0, totalTripCost - dueToday)

  const scheduledDepartures = useMemo(() => {
    const rawList =
      Array.isArray(trip?.departures) && trip.departures.length > 0
        ? trip.departures
        : Array.isArray(trip?.dates) && trip.dates.length > 0
          ? trip.dates
          : []

    if (rawList.length > 0) {
      return rawList.map((d, idx) => {
        const depStr = d.departure_date || d.start_date
        const retStr = d.return_date || d.end_date
        const depDate = depStr ? new Date(depStr) : null
        const retDate = retStr ? new Date(retStr) : null

        const formattedDep =
          depDate && !isNaN(depDate.getTime())
            ? depDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : depStr || 'Scheduled Departure'
        const formattedRet =
          retDate && !isNaN(retDate.getTime())
            ? retDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''

        const dateRange =
          formattedRet && formattedRet !== formattedDep
            ? `${formattedDep} – ${formattedRet}`
            : formattedDep

        const available =
          d.slots_available !== undefined ? d.slots_available : d.slots_total || 8
        const statusBadge =
          available <= 3
            ? ` (${available} seats left · Selling Fast)`
            : available
              ? ` (${available} seats left)`
              : ''

        return {
          id: d.id || `${depStr}-${idx}`,
          value: depStr || `dep-${idx}`,
          dateRange,
          label: `${dateRange}${statusBadge}`,
          departureDate: depStr,
          returnDate: retStr,
          slotsAvailable: available,
        }
      })
    }

    const nextDep = trip?.nextDeparture || 'December 18, 2026'
    return [
      {
        id: 'dep-primary',
        value: '2026-12-18',
        dateRange: nextDep,
        label: `${nextDep} (Guaranteed Departure · 6 seats left)`,
        departureDate: '2026-12-18',
        slotsAvailable: 6,
      },
      {
        id: 'dep-upcoming-1',
        value: '2027-01-16',
        dateRange: 'January 16 – 20, 2027',
        label: 'January 16 – 20, 2027 (Scheduled Departure · 10 seats left)',
        departureDate: '2027-01-16',
        slotsAvailable: 10,
      },
      {
        id: 'dep-upcoming-2',
        value: '2027-02-13',
        dateRange: 'February 13 – 17, 2027',
        label: 'February 13 – 17, 2027 (Scheduled Departure · 12 seats left)',
        departureDate: '2027-02-13',
        slotsAvailable: 12,
      },
    ]
  }, [trip])

  useEffect(() => {
    if (scheduledDepartures.length > 0 && !form.departureDate) {
      setForm((prev) => ({ ...prev, departureDate: scheduledDepartures[0].value }))
    }
  }, [scheduledDepartures, form.departureDate])

  const [verifyingPayment, setVerifyingPayment] = useState(false)

  const handleVerifyPaymentStatus = async () => {
    setVerifyingPayment(true)
    try {
      if (stkState.checkoutRequestId) {
        const res = await checkMpesaStkStatus(stkState.checkoutRequestId)
        if (res.state === 'completed') {
          setStkState((prev) => ({
            ...prev,
            status: 'completed',
            receipt: res.reference || prev.receipt,
            message: `M-Pesa payment confirmed (${res.reference || 'Received'}). A confirmation email has been dispatched to ${form.email || 'your email'}.`,
          }))
          return
        }
      }

      // Also check booking lookup by reference and email
      if (activeBookingRef) {
        const lookupRes = await fetch(`${API_BASE}/bookings/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_ref: activeBookingRef, email: form.email || '' }),
        })
        if (lookupRes.ok) {
          const data = await lookupRes.json()
          const b = data.booking
          const isPaid = b && (b.payment_status === 'paid' || b.payment_status === 'completed' || Number(b.amount_paid) > 0)
          const hasPmt = data.payments && data.payments.some((p) => p.status === 'completed')
          if (isPaid || hasPmt) {
            const receipt = b?.mpesa_receipt || data.payments?.find((p) => p.status === 'completed')?.reference || 'CONFIRMED'
            setStkState((prev) => ({
              ...prev,
              status: 'completed',
              receipt: receipt,
              message: `M-Pesa payment confirmed (${receipt}). A confirmation email has been dispatched to ${form.email || 'your email'}.`,
            }))
            return
          }
        }
      }

      setStkState((prev) => ({
        ...prev,
        status: 'pending',
        message: 'Payment is still being processed by Safaricom. If you have already entered your PIN on your phone, wait 5 seconds and click "Verify Payment Status" again.',
      }))
    } catch {
      setStkState((prev) => ({
        ...prev,
        message: 'Network check timed out. Please click "Verify Payment Status" again in a few moments.',
      }))
    } finally {
      setVerifyingPayment(false)
    }
  }

  useEffect(() => {
    if (stkState.status !== 'pending' || !stkState.checkoutRequestId) return undefined

    let cancelled = false
    const timer = setInterval(async () => {
      try {
        const res = await checkMpesaStkStatus(stkState.checkoutRequestId)
        if (cancelled) return
        if (res.state === 'completed') {
          setStkState((prev) => ({
            ...prev,
            status: 'completed',
            receipt: res.reference || prev.receipt,
            message: `M-Pesa payment confirmed (${res.reference || 'Received'}). A confirmation email has been dispatched to ${form.email || 'your email'}.`,
          }))
          clearInterval(timer)
        } else if (res.state === 'failed') {
          const desc = String(res.resultDesc || '').toLowerCase()
          if (desc.includes('processing') || desc.includes('being processed')) {
            // Keep polling quietly while handset PIN is entered
            return
          }
          setStkState((prev) => ({
            ...prev,
            status: 'failed',
            message: res.resultDesc || 'M-Pesa prompt was cancelled or timed out.',
          }))
          clearInterval(timer)
        }
      } catch {
        // Keep polling quietly while awaiting handset PIN
      }
    }, 2200)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [stkState.status, stkState.checkoutRequestId, form.email])

  const triggerStkForBooking = async (bookingId) => {
    setStkState((prev) => ({ ...prev, status: 'sending', message: 'Sending M-Pesa prompt to your phone…' }))
    try {
      const stk = await initiateMpesaStkPush({
        bookingId,
        phone: form.phone,
        amount: dueToday,
        currency: tripCurrency,
        paymentPlan: form.paymentPlan,
        note:
          form.paymentPlan === 'lipa_pole_pole'
            ? 'Client Lipa Pole Pole deposit via M-Pesa Express'
            : 'Client full trip payment via M-Pesa Express',
      })
      setStkState({
        status: 'pending',
        checkoutRequestId: stk.checkoutRequestId,
        amountKes: stk.amountKes,
        tillNumber: stk.tillNumber || '9689363',
        receipt: '',
        message:
          stk.message ||
          `Enter your M-Pesa PIN on ${form.phone} to pay KSh ${Number(stk.amountKes || 0).toLocaleString()} (Till ${stk.tillNumber || '9689363'}).`,
      })
    } catch (err) {
      setStkState({
        status: 'failed',
        checkoutRequestId: '',
        amountKes: 0,
        tillNumber: '9689363',
        receipt: '',
        message: err.message || 'Could not initiate M-Pesa prompt. Your booking is saved and our team will assist.',
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trip || submitting) return
    setSubmitting(true)

    try {
      const cleanRef = (form.mpesaCode || '').trim().toUpperCase()
      const initialPaid = cleanRef ? dueToday : 0
      const planNote =
        form.paymentPlan === 'lipa_pole_pole'
          ? `Lipa Pole Pole selected (First deposit: ${formatBookingMoney(dueToday, tripCurrency)}, Balance: ${formatBookingMoney(remainingLater, tripCurrency)}).`
          : `Pay Full Amount selected (${formatBookingMoney(totalTripCost, tripCurrency)}).`

      const generatedRef = `FOMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

      const created = await createClientBooking({
        id: generatedRef,
        booking_ref: generatedRef,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        package_title: trip.title,
        package_slug: trip.slug || slug,
        departure_date: form.departureDate || scheduledDepartures[0]?.value || '',
        num_guests: numGuests,
        currency: tripCurrency,
        total_amount: totalTripCost,
        initial_paid: initialPaid,
        payment_plan: form.paymentPlan,
        payment_method: 'M-Pesa',
        mpesa_receipt: cleanRef,
        payment_note: cleanRef
          ? `Submitted by client (${form.paymentPlan === 'lipa_pole_pole' ? 'Lipa Pole Pole deposit' : 'Full payment'})`
          : '',
        notes: [planNote, form.notes].filter(Boolean).join(' '),
      })

      const bookingRef = created?.booking_ref || created?.id || generatedRef
      setActiveBookingRef(bookingRef)
      saveGuestBookingRef(bookingRef)
      setSubmitted(true)

      if (cleanRef) {
        setStkState({
          status: 'completed',
          checkoutRequestId: '',
          amountKes: 0,
          tillNumber: '9689363',
          receipt: cleanRef,
          message: `Recorded M-Pesa code ${cleanRef}.`,
        })
      } else if (dueToday > 0 && bookingRef) {
        await triggerStkForBooking(bookingRef)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingApi) {
    return (
      <div className="tdetail-page">
        <div className="tdetail-state">
          <p>Loading trip itinerary&hellip;</p>
        </div>
      </div>
    )
  }

  if (notFound || !trip) {
    return (
      <div className="tdetail-page">
        <div className="tdetail-state">
          <span className="tdetail-eyebrow">TRIP NOT FOUND</span>
          <h1>We could not find that exact departure</h1>
          <p>
            It may have moved or finished for the season. Browse all of our
            Kenyan routes on scheduled fixed departure dates.
          </p>
          <Link to="/trips" className="tdetail-state__btn">
            <span>Browse all trips</span>
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    )
  }

  const isDayTrip =
    trip.tripType === 'day_trip' ||
    String(trip.duration || '').toLowerCase().startsWith('1 day')

  const overviewParagraphs = Array.isArray(trip.overview) && trip.overview.length > 0
    ? trip.overview
    : trip.overviewText
      ? String(trip.overviewText).split(/\n\s*\n/).filter(Boolean)
      : ['Scouted firsthand by our Nairobi team with relaxed pacing and salaried Kenyan guides.']

  const destKey = Object.keys(DESTINATION_BLURBS).find((k) =>
    (trip.destination || '').toLowerCase().includes(k.toLowerCase())
  )
  const destInfo = (destKey && DESTINATION_BLURBS[destKey]) || {
    name: trip.destination || 'Kenya',
    image: trip.image || '/images/wildbeast.webp',
    description:
      'Scouted firsthand by our Kenyan guides, with time left in every itinerary to enjoy where you are.',
  }

  return (
    <div className="tdetail-page">
      {/* 1. Editorial Header */}
      <header className="tdetail-header-wrap">
        <div className="tdetail-header">
          <div className="tdetail-header__left">
            <nav className="tdetail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/trips">ALL TRIPS</Link>
              <span aria-hidden="true">/</span>
              <span>{(trip.location || trip.destination || 'KENYA').toUpperCase()}</span>
            </nav>

            <h1 className="tdetail-title">{trip.title}</h1>
          </div>

          <p className="tdetail-subtitle">
            {trip.subtitle ||
              'Private and scheduled Kenyan getaways led by dedicated local guides.'}
          </p>
        </div>
      </header>

      {/* 2. Asymmetric 3-Photo Bento Gallery */}
      <section className="tdetail-gallery-wrap" aria-label="Trip gallery">
        <div className="tdetail-gallery">
          <div className="tdetail-gallery__main">
            <img src={trip.image || '/images/wildbeast.webp'} alt={trip.title} />
          </div>

          <div className="tdetail-gallery__side">
            <img
              src={trip.gallery?.[0] || trip.image || '/images/safari-trip.webp'}
              alt={`${trip.destination || 'Kenya'} wildlife and scenery`}
              loading="lazy"
            />
          </div>

          <div className="tdetail-gallery__side">
            <img
              src={trip.gallery?.[1] || trip.image || '/images/sun-rise-drive.webp'}
              alt={`${trip.destination || 'Kenya'} landscape`}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 3. Main Two-Column Content + Sticky Availability Sidebar */}
      <section className="tdetail-body-wrap">
        <div className="tdetail-body">
          {/* Left Column */}
          <div className="tdetail-main">
            {/* 4-Column Facts Strip (adapts automatically for 1-Day Trips!) */}
            <dl className="tdetail-facts">
              <div className="tdetail-fact">
                <dt>LENGTH</dt>
                <dd>{trip.duration || (isDayTrip ? '1 day' : '3 days')}</dd>
              </div>
              <div className="tdetail-fact">
                <dt>GROUP SIZE</dt>
                <dd>{trip.groupSize || 'Private & Scheduled'}</dd>
              </div>
              <div className="tdetail-fact">
                <dt>PACE</dt>
                <dd>{trip.level || 'Easy'}</dd>
              </div>
              <div className="tdetail-fact">
                {isDayTrip && trip.meetingPoint ? (
                  <>
                    <dt>MEETING POINT</dt>
                    <dd>{trip.meetingPoint}</dd>
                  </>
                ) : (
                  <>
                    <dt>BEST SEASON</dt>
                    <dd>{trip.bestSeason || 'All year'}</dd>
                  </>
                )}
              </div>
            </dl>

            {/* Overview */}
            <div className="tdetail-section">
              <h2 className="tdetail-h2">Overview</h2>
              <div className="tdetail-prose">
                {overviewParagraphs.map((para, idx) => renderLinkedParagraph(para, idx))}
              </div>
            </div>

            {/* Day by day OR Day schedule */}
            {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
              <div className="tdetail-section tdetail-section--divided">
                <h2 className="tdetail-h2">
                  {isDayTrip ? 'Day schedule' : 'Day by day'}
                </h2>
                <div className="tdetail-days">
                  {trip.itinerary.map((item, idx) => (
                    <div key={idx} className="tdetail-day">
                      <h3 className="tdetail-day__title">
                        {item.day ||
                          (item.title ? `${item.time}: ${item.title}` : item.time)}
                      </h3>
                      <p className="tdetail-day__desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What is included & What is excluded */}
            <div className="tdetail-section tdetail-section--divided">
              {trip.excluded?.length > 0 ? (
                <div className="tdetail-checklists-grid">
                  <div>
                    <h2 className="tdetail-h2">What is included</h2>
                    <ul className="tdetail-included">
                      {(trip.included || []).map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="tdetail-h2">What is excluded</h2>
                    <ul className="tdetail-included tdetail-included--excluded">
                      {trip.excluded.map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="tdetail-h2">What is included</h2>
                  <ul className="tdetail-included">
                    {(trip.included || []).map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Optional What to Carry section (ideal for 1-Day Trips) */}
            {Array.isArray(trip.whatToCarry) && trip.whatToCarry.length > 0 && (
              <div className="tdetail-section tdetail-section--divided">
                <h2 className="tdetail-h2">What to carry</h2>
                <ul className="tdetail-included">
                  {trip.whatToCarry.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* About the Destination Card */}
            <Link
              to={`/trips?destination=${encodeURIComponent(destInfo.name)}`}
              className="tdetail-dest-card"
            >
              <div className="tdetail-dest-card__thumb">
                <img src={destInfo.image} alt={destInfo.name} loading="lazy" />
              </div>

              <div className="tdetail-dest-card__copy">
                <span className="tdetail-dest-card__eyebrow">
                  ABOUT THE DESTINATION
                </span>
                <h3 className="tdetail-dest-card__name">{destInfo.name}</h3>
                <p className="tdetail-dest-card__desc">{destInfo.description}</p>
              </div>
            </Link>
          </div>

          {/* Right Sticky Availability Card */}
          <aside className="tdetail-sidebar" aria-label="Check trip availability">
            <div className="tdetail-book-card">
              {submitted ? (
                <div className="tdetail-book-card__success">
                  <span className="tdetail-eyebrow">
                    {stkState.status === 'completed' ? 'PAYMENT CONFIRMED' : 'BOOKING RECEIVED'}
                  </span>
                  <h2>
                    {stkState.status === 'completed'
                      ? form.paymentPlan === 'lipa_pole_pole'
                        ? 'Lipa Pole Pole deposit confirmed!'
                        : 'Trip paid in full!'
                      : form.paymentPlan === 'lipa_pole_pole'
                        ? 'Your Lipa Pole Pole booking is in'
                        : 'Your trip booking is in'}
                  </h2>

                  {stkState.status !== 'idle' && (
                    <div
                      className={`tdetail-stk-banner ${
                        stkState.status === 'completed'
                          ? 'tdetail-stk-banner--paid'
                          : stkState.status === 'failed'
                            ? 'tdetail-stk-banner--failed'
                            : ''
                      }`}
                    >
                      <span className="tdetail-stk-banner__kicker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {stkState.status === 'sending' && (
                          <>
                            <span className="tdetail-btn-spinner" />
                            <span>SENDING M-PESA PROMPT…</span>
                          </>
                        )}
                        {stkState.status === 'pending' && (
                          <>
                            <span className="tdetail-live-pulse" />
                            <span>CHECK YOUR PHONE · TILL {stkState.tillNumber}</span>
                          </>
                        )}
                        {stkState.status === 'completed' && `M-PESA CONFIRMED ${stkState.receipt ? `· ${stkState.receipt}` : ''}`}
                        {stkState.status === 'failed' && 'M-PESA PROMPT NOT COMPLETED'}
                      </span>
                      <p className="tdetail-stk-banner__text">
                        {stkState.status === 'pending'
                          ? `A prompt for KSh ${Number(dueToday).toLocaleString()} was sent to ${form.phone}. Please enter your M-Pesa PIN on your phone. This screen will update automatically.`
                          : stkState.message}
                      </p>
                    </div>
                  )}

                  {stkState.status === 'completed' && (
                    <div
                      style={{
                        margin: '16px 0',
                        padding: '14px 18px',
                        background: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#166534',
                        lineHeight: '1.5',
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '15px' }}>✓ Confirmation Email Dispatched</strong>
                      A confirmation email containing your itinerary voucher, payment receipt, and guest tracking link has been sent to <strong>{form.email}</strong>.
                    </div>
                  )}

                  {form.paymentPlan === 'lipa_pole_pole' && totalTripCost > 0 && (
                    <div className="tdetail-tracker-card" style={{ marginTop: '14px', marginBottom: '16px' }}>
                      {(() => {
                        const pct = Math.round((dueToday / totalTripCost) * 100)
                        return (
                          <div
                            className="tdetail-tracker-bar"
                            style={{
                              height: '22px',
                              background: '#EAE3D5',
                              borderRadius: '999px',
                              position: 'relative',
                              overflow: 'hidden',
                              marginBottom: '14px',
                            }}
                          >
                            <div
                              className="tdetail-tracker-fill"
                              style={{
                                width: `${Math.min(100, Math.max(12, pct))}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #E8622A 0%, #F59E0B 100%)',
                                borderRadius: '999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '60px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  color: '#FFFFFF',
                                  whiteSpace: 'nowrap',
                                  padding: '0 6px',
                                }}
                              >
                                {pct >= 30 ? `${pct}% Cleared` : `${pct}%`}
                              </span>
                            </div>
                          </div>
                        )
                      })()}

                      <div className="tdetail-tracker-stats">
                        <div className="tdetail-tracker-stat">
                          <span className="tdetail-tracker-label">Paid So Far</span>
                          <strong className="tdetail-tracker-value tdetail-tracker-value--paid">
                            {formatBookingMoney(dueToday, tripCurrency)}
                          </strong>
                        </div>
                        <div className="tdetail-tracker-divider" />
                        <div className="tdetail-tracker-stat">
                          <span className="tdetail-tracker-label">Balance Left</span>
                          <strong className="tdetail-tracker-value tdetail-tracker-value--balance">
                            {formatBookingMoney(remainingLater, tripCurrency)}
                          </strong>
                        </div>
                        <div className="tdetail-tracker-divider" />
                        <div className="tdetail-tracker-stat">
                          <span className="tdetail-tracker-label">Total Safari</span>
                          <strong className="tdetail-tracker-value">
                            {formatBookingMoney(totalTripCost, tripCurrency)}
                          </strong>
                        </div>
                      </div>

                      <div className="tdetail-tracker-milestones">
                        <div className="tdetail-milestone tdetail-milestone--active">
                          <span className="tdetail-milestone-circle">✓</span>
                          <span className="tdetail-milestone-text">Deposit</span>
                        </div>
                        <div className="tdetail-milestone-line" />
                        <div className="tdetail-milestone">
                          <span className="tdetail-milestone-circle">2</span>
                          <span className="tdetail-milestone-text">Installments</span>
                        </div>
                        <div className="tdetail-milestone-line" />
                        <div className="tdetail-milestone">
                          <span className="tdetail-milestone-circle">3</span>
                          <span className="tdetail-milestone-text">Clearance</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeBookingRef && (
                    <div className="tdetail-ref-banner">
                      <span className="tdetail-ref-label">YOUR BOOKING REFERENCE</span>
                      <div className="tdetail-ref-row">
                        <strong className="tdetail-ref-code">{activeBookingRef}</strong>
                        <button
                          type="button"
                          className="tdetail-ref-copy"
                          onClick={() => {
                            navigator.clipboard?.writeText(activeBookingRef)
                            setCopiedRef(true)
                            setTimeout(() => setCopiedRef(false), 2000)
                          }}
                        >
                          {copiedRef ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="tdetail-ref-hint">
                        Save this reference to track your itinerary and installments as a guest anytime.
                      </p>
                    </div>
                  )}

                  <p>
                    Thank you{form.name ? `, ${form.name}` : ''}. You selected{' '}
                    <strong>
                      {form.paymentPlan === 'lipa_pole_pole'
                        ? `Lipa Pole Pole (${formatBookingMoney(dueToday, tripCurrency)} deposit today · ${formatBookingMoney(remainingLater, tripCurrency)} in flexible installments)`
                        : `Full Payment (${formatBookingMoney(totalTripCost, tripCurrency)} for ${numGuests} traveler${numGuests > 1 ? 's' : ''})`}
                    </strong>{' '}
                    for <strong>{trip.title}</strong>.
                  </p>

                  <div className="tdetail-stk-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link
                      to={`/my-trips?ref=${encodeURIComponent(activeBookingRef)}&email=${encodeURIComponent(form.email)}`}
                      className="tdetail-dash-btn"
                      style={{
                        display: 'block',
                        background: '#E8622A',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        fontWeight: '700',
                        padding: '13px 18px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        boxShadow: '0 3px 12px rgba(232,98,42,0.25)',
                      }}
                    >
                      Track Booking as Guest / View Voucher &rarr;
                    </Link>

                    {stkState.status !== 'completed' && (
                      <button
                        type="button"
                        className="tdetail-stk-retry"
                        onClick={handleVerifyPaymentStatus}
                        disabled={verifyingPayment}
                        style={{
                          background: '#14120E',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: '700',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        {verifyingPayment ? 'Checking Safaricom status…' : '✓ Verify Payment Status'}
                      </button>
                    )}

                    {(stkState.status === 'failed' || stkState.status === 'pending') && activeBookingRef && (
                      <button
                        type="button"
                        className="tdetail-stk-retry"
                        onClick={() => triggerStkForBooking(activeBookingRef)}
                        style={{
                          background: '#F4EFE6',
                          color: '#14120E',
                          border: '1px solid #D8CFC0',
                          fontWeight: '600',
                          padding: '11px 18px',
                          borderRadius: '10px',
                        }}
                      >
                        Resend M-Pesa Prompt
                      </button>
                    )}

                    <Link
                      to={`/dashboard?ref=${encodeURIComponent(activeBookingRef)}&email=${encodeURIComponent(form.email)}`}
                      style={{
                        fontSize: '13px',
                        color: '#706B62',
                        textAlign: 'center',
                        textDecoration: 'underline',
                        marginTop: '4px',
                      }}
                    >
                      Manage Safari in Customer Dashboard
                    </Link>

                    <button
                      type="button"
                      className="tdetail-book-card__reset"
                      onClick={() => {
                        setSubmitted(false)
                        setStkState({
                          status: 'idle',
                          checkoutRequestId: '',
                          amountKes: 0,
                          tillNumber: '9689363',
                          receipt: '',
                          message: '',
                        })
                      }}
                    >
                      Edit booking details
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="tdetail-book-card__price-row">
                    <span className="tdetail-book-card__muted">from</span>
                    <strong className="tdetail-book-card__price">
                      {trip.price || 'Ask'}
                    </strong>
                    <span className="tdetail-book-card__muted">per person</span>
                  </div>

                  {trip.depositNote && (
                    <p className="tdetail-book-card__deposit">{trip.depositNote}</p>
                  )}

                  {/* Guest vs Account Checkout Selector */}
                  <div className="tdetail-checkout-mode" role="group" aria-label="Checkout Option">
                    <button
                      type="button"
                      className={`tdetail-mode-btn ${checkoutMode === 'guest' ? 'tdetail-mode-btn--active' : ''}`}
                      onClick={() => setCheckoutMode('guest')}
                    >
                      <span>Checkout as Guest</span>
                    </button>
                    <button
                      type="button"
                      className={`tdetail-mode-btn ${checkoutMode === 'account' ? 'tdetail-mode-btn--active' : ''}`}
                      onClick={() => {
                        if (traveler) {
                          setCheckoutMode('account')
                        } else {
                          window.location.href = `/login?redirect=/trips/${trip.slug || slug}`
                        }
                      }}
                    >
                      <span>{traveler ? `Logged in: ${traveler.name.split(' ')[0]}` : 'Sign in'}</span>
                    </button>
                  </div>

                  <form className="tdetail-form" onSubmit={handleSubmit}>
                    <div className="tdetail-field">
                      <label htmlFor="td-name">Your name</label>
                      <input
                        id="td-name"
                        type="text"
                        value={form.name}
                        onChange={updateField('name')}
                        placeholder="Jane Smith"
                        required
                      />
                    </div>

                    <div className="tdetail-field">
                      <label htmlFor="td-email">Email</label>
                      <input
                        id="td-email"
                        type="email"
                        value={form.email}
                        onChange={updateField('email')}
                        placeholder="jane@email.com"
                        required
                      />
                    </div>

                    <div className="tdetail-field">
                      <label htmlFor="td-phone">Phone / M-Pesa number</label>
                      <input
                        id="td-phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateField('phone')}
                        placeholder="+254 712 345 678"
                        required
                      />
                    </div>

                    <div className="tdetail-field">
                      <label htmlFor="td-departure-date">Fixed Departure Date</label>
                      <div className="tdetail-field__select-wrap">
                        <select
                          id="td-departure-date"
                          value={form.departureDate || scheduledDepartures[0]?.value || ''}
                          onChange={updateField('departureDate')}
                          required
                        >
                          {scheduledDepartures.map((d) => (
                            <option key={d.id || d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="tdetail-field__chevron"
                          aria-hidden="true"
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#787267', marginTop: '4px', display: 'block' }}>
                        All FOMO safaris run on fixed group departure dates.
                      </span>
                    </div>

                    <div className="tdetail-field">
                      <label htmlFor="td-travelers">Travelers</label>
                      <div className="tdetail-field__select-wrap">
                        <select
                          id="td-travelers"
                          value={form.travelers}
                          onChange={updateField('travelers')}
                        >
                          {TRAVELER_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="tdetail-field__chevron"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {totalTripCost > 0 && (
                      <div className="tdetail-field">
                        <label>How would you like to pay?</label>
                        <div className="tdetail-pay-options">
                          <button
                            type="button"
                            className={`tdetail-pay-card ${form.paymentPlan === 'full' ? 'tdetail-pay-card--active' : ''}`}
                            onClick={() => setForm((p) => ({ ...p, paymentPlan: 'full' }))}
                          >
                            <div className="tdetail-pay-card__top">
                              <span className="tdetail-pay-card__title">Pay All</span>
                              <span className="tdetail-pay-card__dot" />
                            </div>
                            <div className="tdetail-pay-card__amount">
                              {formatBookingMoney(totalTripCost, tripCurrency)}
                            </div>
                            <span className="tdetail-pay-card__sub">
                              100% upfront for {numGuests} {numGuests === 1 ? 'guest' : 'guests'}
                            </span>
                          </button>

                          <button
                            type="button"
                            className={`tdetail-pay-card ${form.paymentPlan === 'lipa_pole_pole' ? 'tdetail-pay-card--active' : ''}`}
                            onClick={() =>
                              setForm((p) => ({ ...p, paymentPlan: 'lipa_pole_pole' }))
                            }
                          >
                            <div className="tdetail-pay-card__top">
                              <span className="tdetail-pay-card__title">Lipa Pole Pole</span>
                              <span className="tdetail-pay-card__dot" />
                            </div>
                            <div className="tdetail-pay-card__amount">
                              {formatBookingMoney(minDeposit, tripCurrency)}
                            </div>
                            <span className="tdetail-pay-card__sub">
                              30% deposit now · balance in installments
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {totalTripCost > 0 && form.paymentPlan === 'lipa_pole_pole' && (
                      <div className="tdetail-tracker-card" style={{ margin: '14px 0 16px' }}>
                        <div className="tdetail-deposit-customizer">
                          <div className="tdetail-deposit-customizer__header">
                            <label htmlFor="td-deposit" className="tdetail-deposit-customizer__title">
                              Specify amount to pay today
                            </label>
                            <span className="tdetail-deposit-customizer__hint">
                              Min deposit: {formatBookingMoney(depositFloor, tripCurrency)}
                            </span>
                          </div>
                          <p className="tdetail-deposit-customizer__sub">
                            Type any amount to reduce your remaining safari balance:
                          </p>
                          <div className="tdetail-deposit-input-wrap">
                            <span className="tdetail-deposit-currency">{tripCurrency}</span>
                            <input
                              id="td-deposit"
                              className="tdetail-deposit-input"
                              type="number"
                              min={depositFloor}
                              max={totalTripCost}
                              value={form.customDeposit !== '' ? form.customDeposit : minDeposit}
                              onChange={updateField('customDeposit')}
                            />
                          </div>

                          <div className="tdetail-deposit-presets">
                            <button
                              type="button"
                              className={`tdetail-preset-chip ${Number(form.customDeposit || minDeposit) === minDeposit ? 'tdetail-preset-chip--active' : ''}`}
                              onClick={() => setForm((p) => ({ ...p, customDeposit: minDeposit }))}
                            >
                              <Plus size={11} strokeWidth={2.4} aria-hidden="true" />
                              <span>Min Deposit ({formatBookingMoney(minDeposit, tripCurrency)})</span>
                            </button>
                            {totalTripCost > minDeposit && (
                              <button
                                type="button"
                                className={`tdetail-preset-chip ${Number(form.customDeposit) === Math.round(totalTripCost * 0.5) ? 'tdetail-preset-chip--active' : ''}`}
                                onClick={() =>
                                  setForm((p) => ({ ...p, customDeposit: Math.round(totalTripCost * 0.5) }))
                                }
                              >
                                <Plus size={11} strokeWidth={2.4} aria-hidden="true" />
                                <span>50% ({formatBookingMoney(Math.round(totalTripCost * 0.5), tripCurrency)})</span>
                              </button>
                            )}
                            {totalTripCost > minDeposit && (
                              <button
                                type="button"
                                className={`tdetail-preset-chip ${Number(form.customDeposit) === totalTripCost ? 'tdetail-preset-chip--active' : ''}`}
                                onClick={() => setForm((p) => ({ ...p, customDeposit: totalTripCost }))}
                              >
                                <Plus size={11} strokeWidth={2.4} aria-hidden="true" />
                                <span>Pay All ({formatBookingMoney(totalTripCost, tripCurrency)})</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="tdetail-tracker-stats">
                          <div className="tdetail-tracker-stat">
                            <span className="tdetail-tracker-label">First Deposit</span>
                            <strong className="tdetail-tracker-value tdetail-tracker-value--paid">
                              {formatBookingMoney(dueToday, tripCurrency)}
                            </strong>
                          </div>
                          <div className="tdetail-tracker-divider" />
                          <div className="tdetail-tracker-stat">
                            <span className="tdetail-tracker-label">Balance Left</span>
                            <strong className="tdetail-tracker-value tdetail-tracker-value--balance">
                              {formatBookingMoney(remainingLater, tripCurrency)}
                            </strong>
                          </div>
                          <div className="tdetail-tracker-divider" />
                          <div className="tdetail-tracker-stat">
                            <span className="tdetail-tracker-label">Total Safari</span>
                            <strong className="tdetail-tracker-value">
                              {formatBookingMoney(totalTripCost, tripCurrency)}
                            </strong>
                          </div>
                        </div>

                        <div className="tdetail-tracker-milestones">
                          <div className="tdetail-milestone tdetail-milestone--active">
                            <span className="tdetail-milestone-circle">1</span>
                            <span className="tdetail-milestone-text">Deposit Today</span>
                          </div>
                          <div className="tdetail-milestone-line" />
                          <div className="tdetail-milestone">
                            <span className="tdetail-milestone-circle">2</span>
                            <span className="tdetail-milestone-text">Installments</span>
                          </div>
                          <div className="tdetail-milestone-line" />
                          <div className="tdetail-milestone">
                            <span className="tdetail-milestone-circle">3</span>
                            <span className="tdetail-milestone-text">Safari Voucher</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="tdetail-field">
                      <label htmlFor="td-mpesa">M-Pesa Code (optional if already paid)</label>
                      <input
                        id="td-mpesa"
                        type="text"
                        value={form.mpesaCode}
                        onChange={updateField('mpesaCode')}
                        placeholder="e.g. SJK84M2P9Q"
                      />
                    </div>

                    <div className="tdetail-field">
                      <label htmlFor="td-notes">Anything we should know?</label>
                      <textarea
                        id="td-notes"
                        rows={2}
                        value={form.notes}
                        onChange={updateField('notes')}
                        placeholder={
                          isDayTrip
                            ? 'Pickup point, dietary requirements, or room requests.'
                            : 'Dietary preferences, room setup, or special requests.'
                        }
                      />
                    </div>

                    {submitting && (
                      <div
                        style={{
                          margin: '12px 0',
                          padding: '12px 16px',
                          background: '#FFF8EB',
                          border: '1.5px solid #F59E0B',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span className="tdetail-btn-spinner" style={{ borderColor: '#D97706', borderTopColor: 'transparent' }} />
                        <span style={{ fontSize: '13px', color: '#92400E', fontWeight: '600' }}>
                          Connecting to Safaricom… Sending M-Pesa prompt to {form.phone}
                        </span>
                      </div>
                    )}

                    {totalTripCost > 0 && (
                      <div
                        className="tdetail-submit-amount-strip"
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          padding: '12px 4px 8px',
                          margin: '8px 0 4px',
                          borderTop: '1px solid #EAE3D5',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: '#6E685D',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {form.paymentPlan === 'lipa_pole_pole' ? 'Amount Due Today' : 'Total Amount Due'}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '22px', fontWeight: '900', color: '#14120E', letterSpacing: '-0.02em' }}>
                            {formatBookingMoney(dueToday, tripCurrency)}
                          </strong>
                          {form.paymentPlan === 'lipa_pole_pole' && remainingLater > 0 && (
                            <span style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#E8622A' }}>
                              ({formatBookingMoney(remainingLater, tripCurrency)} balance pole pole)
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="tdetail-form__submit"
                      disabled={submitting}
                      style={{
                        opacity: submitting ? 0.75 : 1,
                        cursor: submitting ? 'wait' : 'pointer',
                      }}
                    >
                      <span>
                        {submitting ? 'Contacting Safaricom…' : 'Pay Now'}
                      </span>
                      <span
                        className="tdetail-form__submit-circle"
                        aria-hidden="true"
                      >
                        {submitting ? (
                          <span className="tdetail-btn-spinner" />
                        ) : (
                          <ArrowRight size={14} strokeWidth={2.2} />
                        )}
                      </span>
                    </button>

                    <p className="tdetail-form__note">
                      {form.paymentPlan === 'lipa_pole_pole'
                        ? 'Reserve your seat with a 30% deposit and pay the rest pole pole before departure.'
                        : 'Pay 100% upfront or switch to Lipa Pole Pole installments anytime.'}
                    </p>
                  </form>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* 4. Private Departure Pre-Footer CTA */}
      <PreFooterCta
        heading="Prefer this trip privately?"
        description="Book full private vehicle buyouts for your friends, family or team on our fixed calendar departures. Tell us your party size and preferences."
      />
    </div>
  )
}
