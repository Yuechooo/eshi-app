import { useState, useCallback, useRef, useMemo } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import DateCard from '../components/home/DateCard'
import StreakCard from '../components/home/StreakCard'
import RecommendationCard from '../components/home/RecommendationCard'
import QuickActionsCard from '../components/home/QuickActionsCard'
import CalendarPicker from '../components/home/CalendarPicker'
import SectionTitle from '../components/ui/SectionTitle'
import WarmGreetingBlock from '../components/home/WarmGreetingBlock'
import SeasonalWellnessBlock from '../components/home/SeasonalWellnessBlock'
import IngredientsFocusCard from '../components/home/IngredientsFocusCard'
import AvoidTodayCard from '../components/home/AvoidTodayCard'
import HomeRitualStrip from '../components/home/HomeRitualStrip'
import CommunityFeed from '../components/home/CommunityFeed'

function getDaysOffset(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / 86400000)
}

function dateWithOffset(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

export default function HomePage() {
  const { t } = useLanguage()
  const [isViewingToday, setIsViewingToday] = useState(true)
  const [focusOffset, setFocusOffset] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [todayMeals, setTodayMeals] = useState({ breakfast: false, lunch: false, dinner: false })
  const calendarAnchorRef = useRef(null)

  const viewDate = useMemo(() => dateWithOffset(focusOffset), [focusOffset])

  const toggleMeal = useCallback((meal) => {
    setTodayMeals((m) => ({ ...m, [meal]: !m[meal] }))
  }, [])

  const handleCalendarSelect = useCallback((date) => {
    const today = new Date()
    const offset = getDaysOffset(today, date)
    setFocusOffset(offset)
    setIsViewingToday(offset === 0)
  }, [])

  return (
    <section className="mx-auto max-w-2xl space-y-7 pb-16 sm:space-y-8 sm:pb-20">
      <WarmGreetingBlock />

      <section className="relative">
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <div className="relative flex min-w-10 shrink-0 items-center" ref={calendarAnchorRef}>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-surface/90 text-muted shadow-card ring-1 ring-ink/[0.04] transition-[color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:text-primary hover:shadow-card-hover"
              onClick={() => setCalendarOpen((o) => !o)}
              title={t('calOpen')}
              aria-label={t('calOpen')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
            <CalendarPicker
              open={calendarOpen}
              onClose={() => setCalendarOpen(false)}
              onSelect={handleCalendarSelect}
              anchorRef={calendarAnchorRef}
            />
          </div>
          <SectionTitle
            as="h2"
            className={`mb-0 flex-1 text-center transition-opacity duration-500 ${!isViewingToday ? 'pointer-events-none opacity-0' : ''}`}
          >
            {t('dateToday')}
          </SectionTitle>
          <div className="h-11 w-11 shrink-0" aria-hidden />
        </div>
        <DateCard
          focusOffset={focusOffset}
          onFocusOffsetChange={setFocusOffset}
          onViewingDateChange={useCallback((v) => setIsViewingToday(v), [])}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle className="mb-0 text-lg sm:text-xl">{t('homeSeasonSectionTitle')}</SectionTitle>
        <SeasonalWellnessBlock date={viewDate} />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <IngredientsFocusCard />
        <AvoidTodayCard />
      </div>

      <section>
        <SectionTitle className="mb-3 sm:mb-4">{t('streakTitle')}</SectionTitle>
        <StreakCard todayMeals={todayMeals} />
      </section>

      <section>
        <SectionTitle className="mb-3 sm:mb-4">{t('recTitle')}</SectionTitle>
        <RecommendationCard todayMeals={todayMeals} onToggleMeal={toggleMeal} />
      </section>

      <section className="space-y-3">
        <SectionTitle className="mb-0 text-lg sm:text-xl">{t('homeRitualSectionTitle')}</SectionTitle>
        <HomeRitualStrip />
      </section>

      <section>
        <SectionTitle className="mb-3 sm:mb-4">{t('quickActions')}</SectionTitle>
        <QuickActionsCard />
      </section>

      <div className="pt-2">
        <CommunityFeed />
      </div>
    </section>
  )
}
