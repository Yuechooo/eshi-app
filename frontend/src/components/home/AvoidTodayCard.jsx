import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'

const ITEMS = [
  { emoji: '🧊', key: 'homeAvoid1' },
  { emoji: '🌙', key: 'homeAvoid2' },
  { emoji: '🥗', key: 'homeAvoid3' },
  { emoji: '⏰', key: 'homeAvoid4' },
]

export default function AvoidTodayCard() {
  const { t } = useLanguage()

  return (
    <Card compact className="h-full border-secondary/15 bg-gradient-to-b from-white via-[#fffbf8] to-secondary-soft/25">
      <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-secondary">{t('homeAvoidTag')}</p>
      <h3 className="mb-4 font-display text-lg font-semibold tracking-tight text-ink">{t('homeAvoidTitle')}</h3>
      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
        {ITEMS.map(({ emoji, key }) => (
          <li
            key={key}
            className="flex items-center gap-3 rounded-2xl border border-white/80 bg-surface/85 px-3 py-2.5 shadow-card ring-1 ring-ink/[0.04] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-soft/80 to-primary-soft/50 text-lg shadow-inner-well"
              aria-hidden
            >
              {emoji}
            </span>
            <span className="text-sm font-medium leading-snug text-ink">{t(key)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
