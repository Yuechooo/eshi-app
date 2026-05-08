import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'

const ITEMS = [
  { emoji: '🫕', key: 'homeFocus1' },
  { emoji: '🥬', key: 'homeFocus2' },
  { emoji: '🫚', key: 'homeFocus3' },
  { emoji: '🫘', key: 'homeFocus4' },
]

export default function IngredientsFocusCard() {
  const { t } = useLanguage()

  return (
    <Card compact className="h-full border-primary/12 bg-gradient-to-b from-white via-white to-primary-soft/30">
      <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-secondary">{t('homeFocusTag')}</p>
      <h3 className="mb-4 font-display text-lg font-semibold tracking-tight text-ink">{t('homeFocusTitle')}</h3>
      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
        {ITEMS.map(({ emoji, key }) => (
          <li
            key={key}
            className="flex items-center gap-3 rounded-2xl border border-white/80 bg-surface/80 px-3 py-2.5 shadow-card ring-1 ring-ink/[0.04] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-secondary-soft text-lg shadow-inner-well" aria-hidden>
              {emoji}
            </span>
            <span className="text-sm font-medium leading-snug text-ink">{t(key)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
