import { useLanguage } from '../../hooks/useLanguage'
import { getSeasonBand } from '../../lib/season'

const SEASON_IMAGES = {
  spring: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  summer: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  autumn: 'https://images.unsplash.com/photo-1505253758473-96b7017fcd40?auto=format&fit=crop&w=800&q=80',
  winter: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
}

export default function SeasonalWellnessBlock({ date = new Date() }) {
  const { t } = useLanguage()
  const season = getSeasonBand(date)
  const titleKey = `homeSeason${season.charAt(0).toUpperCase() + season.slice(1)}Title`
  const bodyKey = `homeSeason${season.charAt(0).toUpperCase() + season.slice(1)}Body`
  const altKey = `homeSeason${season.charAt(0).toUpperCase() + season.slice(1)}Alt`

  return (
    <div className="overflow-hidden rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white to-[#f8f6f2] shadow-card ring-1 ring-ink/[0.035] transition-shadow duration-300 hover:shadow-card-hover">
      <div className="grid md:grid-cols-12 md:items-stretch">
        <div className="relative h-44 md:col-span-5 md:h-auto md:min-h-[220px]">
          <img
            src={SEASON_IMAGES[season]}
            alt={t(altKey)}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-ink/15 md:to-ink/35" />
        </div>
        <div className="flex flex-col justify-center border-t border-white/60 bg-gradient-to-br from-white/95 to-primary-soft/25 p-6 md:col-span-7 md:border-l md:border-t-0 md:p-8">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-secondary">{t('homeSeasonEyebrow')}</p>
          <h2 className="mb-3 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">{t(titleKey)}</h2>
          <p className="text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{t(bodyKey)}</p>
        </div>
      </div>
    </div>
  )
}
