import { useLanguage } from '../../hooks/useLanguage'

export default function DietFilterGroup({ titleKey, filters, activeIds, onToggle }) {
  const { t } = useLanguage()

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-ink sm:text-base">{t(titleKey)}</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, key }) => {
          const on = activeIds.has(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className={[
                'rounded-full border px-3.5 py-2 text-xs font-semibold transition-[background,border-color,color,box-shadow,transform] duration-200 sm:px-4 sm:text-sm',
                on
                  ? 'border-primary/30 bg-primary text-surface shadow-[0_2px_10px_-3px_rgba(139,168,136,0.45)] ring-1 ring-primary/20'
                  : 'border-white/90 bg-surface/95 text-ink shadow-card ring-1 ring-ink/[0.04] hover:border-primary/25 hover:text-primary',
              ].join(' ')}
            >
              {t(key)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
