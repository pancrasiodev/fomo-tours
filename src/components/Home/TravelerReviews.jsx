import './TravelerReviews.css'

const ROW_ONE = [
  {
    id: 'r1',
    quote:
      'I am 71 and traveled solo. By evening two around the Mara campfire I had nine friends and a standing sundowner table.',
    name: 'Dorothy Kane',
    trip: 'Maasai Mara & Amboseli',
    avatarBg: 'url(/images/tourists.webp)',
    avatarPos: '62% 44%',
    avatarSize: '280%',
  },
  {
    id: 'r2',
    quote:
      'Six of us in the Land Cruiser, a window each, and a guide who spotted a leopard from 400 meters.',
    name: 'Arjun Mehta',
    trip: 'Maasai Mara & Lake Nakuru Safari',
    avatarBg: 'url(/images/tourists.webp)',
    avatarPos: '22% 36%',
    avatarSize: '270%',
  },
  {
    id: 'r3',
    quote:
      'We never touched a suitcase or worried about a transfer. Our host Amina knew every dhow captain along Diani Beach by name.',
    name: 'Hannah Whitfield',
    trip: 'Diani Coast & Wasini Escape',
    avatarBg: 'url(/images/tourists.webp)',
    avatarPos: '96% 48%',
    avatarSize: '290%',
  },
  {
    id: 'r4',
    quote:
      'Our guide read the clouds better than any weather app. Kilimanjaro cleared completely on our very first sunrise drive.',
    name: 'Marcus Bell',
    trip: 'Amboseli & Tsavo Red Elephants',
    avatarBg: 'url(/images/Kilimanjaro.webp)',
    avatarPos: 'center',
    avatarSize: 'cover',
  },
]

const ROW_TWO = [
  {
    id: 'r5',
    quote:
      'They had our private Mara conservancy camp locked in seven months out. Friends who booked elsewhere ended up an hour outside the gate.',
    name: 'Daniel Reyes',
    trip: 'Great Wildebeest Migration',
    avatarBg: 'url(/images/safari-trip.webp)',
    avatarPos: 'center',
    avatarSize: 'cover',
  },
  {
    id: 'r6',
    quote:
      'The full-day dhow sail to Kisite reef was the best day of our year. Small boat, empty sandbanks, lunch grilled right on board.',
    name: 'Sofia Brandt',
    trip: 'Diani Coast & Indian Ocean',
    avatarBg: 'url(/images/dhow-sunset.jpg)',
    avatarPos: '78% center',
    avatarSize: 'cover',
  },
  {
    id: 'r7',
    quote:
      'I have done wildlife trips before. This was the first where we sat down with Maasai conservancy elders, not just drove past.',
    name: 'Robert Hale',
    trip: 'Rift Valley Lakes & Mara',
    avatarBg: 'url(/images/lake-naivasha.jpg)',
    avatarPos: 'center',
    avatarSize: 'cover',
  },
  {
    id: 'r8',
    quote:
      'Two nights in the northern conservancy was the right call. Watching lions at dawn with nobody else around made the whole week.',
    name: 'Layla Osei',
    trip: 'Maasai Mara & Samburu Trail',
    avatarBg: 'url(/images/giraffe-hero.webp)',
    avatarPos: 'center 25%',
    avatarSize: 'cover',
  },
]

function ReviewCard({ item }) {
  return (
    <article className="rev-card">
      <div className="rev-card__stars" aria-label="5 out of 5 stars">
        ★★★★★
      </div>
      <p className="rev-card__quote">{item.quote}</p>
      <div className="rev-card__author">
        <span
          className="rev-card__avatar"
          style={{
            backgroundImage: item.avatarBg,
            backgroundPosition: item.avatarPos,
            backgroundSize: item.avatarSize,
          }}
          aria-hidden="true"
        />
        <div className="rev-card__meta">
          <strong className="rev-card__name">{item.name}</strong>
          <span className="rev-card__trip">{item.trip}</span>
        </div>
      </div>
    </article>
  )
}

export default function TravelerReviews() {
  return (
    <section className="reviews-sec">
      <div className="reviews-sec__header">
        <div className="reviews-sec__header-inner">
          <span className="reviews-sec__eyebrow">REVIEWS</span>
          <h2 className="reviews-sec__heading">
            What travelers say when they get home
          </h2>
        </div>
      </div>

      <div className="reviews-sec__marquee-wrap">
        <div className="reviews-sec__row">
          <div className="reviews-sec__track reviews-sec__track--left">
            {[...ROW_ONE, ...ROW_ONE].map((item, idx) => (
              <ReviewCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        <div className="reviews-sec__row">
          <div className="reviews-sec__track reviews-sec__track--right">
            {[...ROW_TWO, ...ROW_TWO].map((item, idx) => (
              <ReviewCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
