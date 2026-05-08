import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'

const STREAK = 12
const WEEK_DAYS = 5

function FlameIcon() {
  return (
    <span className="text-[1.85rem] leading-none text-secondary drop-shadow-sm" aria-hidden>
      🔥
    </span>
  )
}

export default function StreakCard({ todayMeals = { breakfast: false, lunch: false, dinner: false } }) {
  const { t } = useLanguage()

  return (
    <Card className="overflow-hidden border-secondary/20 bg-gradient-to-br from-[#fffbf8] via-white to-primary-soft/35">
      <div className="rounded-2xl border border-white/80 bg-surface/45 p-6 shadow-inner-well sm:p-7">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <FlameIcon />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-primary sm:text-[2.5rem]">{STREAK}</span>
            <span className="text-sm font-medium text-muted">{t('streakDays')}</span>
          </div>
          <span className="ml-auto max-w-[11rem] text-right text-xs font-medium leading-snug text-muted sm:text-sm">{t('weekProgress').replace('{n}', WEEK_DAYS)}</span>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-border/50 bg-bg/55 p-5 shadow-inner-well sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
          <span className={`text-sm font-medium leading-snug ${todayMeals.breakfast ? 'text-primary' : 'text-muted'}`}>
            {t('todayBreakfast')}: {todayMeals.breakfast ? t('logged') : t('notLogged')}
          </span>
          <span className={`text-sm font-medium leading-snug ${todayMeals.lunch ? 'text-primary' : 'text-muted'}`}>
            {t('todayLunch')}: {todayMeals.lunch ? t('logged') : t('notLogged')}
          </span>
          <span className={`text-sm font-medium leading-snug ${todayMeals.dinner ? 'text-primary' : 'text-muted'}`}>
            {t('todayDinner')}: {todayMeals.dinner ? t('logged') : t('notLogged')}
          </span>
        </div>
      </div>
    </Card>
  )
}
