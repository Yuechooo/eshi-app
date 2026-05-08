import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'

export default function RecommendationCard({ todayMeals = {}, onToggleMeal }) {
  const { t } = useLanguage()

  const checkClass = (done) =>
    [
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] text-sm transition-[border-color,background,color,box-shadow] duration-200',
      done
        ? 'border-primary bg-primary text-surface shadow-[0_2px_8px_-2px_rgba(139,168,136,0.45)]'
        : 'border-border/90 bg-surface/90 text-transparent shadow-card hover:border-primary/50',
    ].join(' ')

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="divide-y divide-border/70">
        <div className="flex items-center gap-4 px-6 py-4 sm:gap-5 sm:px-8 sm:py-5">
          <button
            type="button"
            className={checkClass(todayMeals.breakfast)}
            onClick={() => onToggleMeal?.('breakfast')}
            aria-label={t('recCheckIn')}
            aria-pressed={todayMeals.breakfast}
          >
            {todayMeals.breakfast ? '✓' : ''}
          </button>
          <span className="w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-wide text-muted sm:w-28 sm:text-sm">{t('recBreakfast')}</span>
          <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-ink sm:text-[0.9375rem]">{t('recBreakfastExample')}</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 sm:gap-5 sm:px-8 sm:py-5">
          <button
            type="button"
            className={checkClass(todayMeals.lunch)}
            onClick={() => onToggleMeal?.('lunch')}
            aria-label={t('recCheckIn')}
            aria-pressed={todayMeals.lunch}
          >
            {todayMeals.lunch ? '✓' : ''}
          </button>
          <span className="w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-wide text-muted sm:w-28 sm:text-sm">{t('recLunch')}</span>
          <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-ink sm:text-[0.9375rem]">{t('recLunchExample')}</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 sm:gap-5 sm:px-8 sm:py-5">
          <button
            type="button"
            className={checkClass(todayMeals.dinner)}
            onClick={() => onToggleMeal?.('dinner')}
            aria-label={t('recCheckIn')}
            aria-pressed={todayMeals.dinner}
          >
            {todayMeals.dinner ? '✓' : ''}
          </button>
          <span className="w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-wide text-muted sm:w-28 sm:text-sm">{t('recDinner')}</span>
          <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-ink sm:text-[0.9375rem]">{t('recDinnerExample')}</span>
        </div>
        <div className="flex flex-col gap-2 border-t border-dashed border-border/80 bg-bg/35 px-6 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-6">
          <span className="w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-wide text-muted sm:w-28 sm:text-sm">{t('recSuggestion')}</span>
          <span className="text-sm font-medium leading-relaxed text-ink sm:text-[0.9375rem]">{t('recSuggestionExample')}</span>
        </div>
      </div>
    </Card>
  )
}
