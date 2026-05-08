import { useLanguage } from '../../hooks/useLanguage'

const MOOD_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=480&q=80',
    altKey: 'homeMoodAlt1',
  },
  {
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=480&q=80',
    altKey: 'homeMoodAlt2',
  },
  {
    src: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=480&q=80',
    altKey: 'homeMoodAlt3',
  },
  {
    src: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=480&q=80',
    altKey: 'homeMoodAlt4',
  },
]

export default function MoodImageStrip() {
  const { t } = useLanguage()

  return (
    <div
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={t('homeMoodStripAria')}
    >
      {MOOD_IMAGES.map((item) => (
        <figure
          key={item.altKey}
          className="group relative h-[5.5rem] w-[7.25rem] shrink-0 snap-start overflow-hidden rounded-2xl shadow-card ring-1 ring-ink/[0.06] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:h-28 sm:w-36"
        >
          <img
            src={item.src}
            alt={t(item.altKey)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-80" />
        </figure>
      ))}
    </div>
  )
}
