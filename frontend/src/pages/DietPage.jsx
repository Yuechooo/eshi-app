import { useMemo, useState, useCallback } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import SectionTitle from '../components/ui/SectionTitle'
import Button from '../components/ui/Button'
import DietFilterGroup from '../components/diet/DietFilterGroup'
import DietFoodCard from '../components/diet/DietFoodCard'
import { DIET_FOODS, DEMO_PROFILE, foodMatchesFilters } from '../data/dietFoods'
import { DIET_FILTER_GROUPS } from '../data/dietFilters'

export default function DietPage() {
  const { lang, t } = useLanguage()
  const [activeIds, setActiveIds] = useState(() => new Set())

  const toggleFilter = useCallback((id) => {
    setActiveIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearFilters = useCallback(() => setActiveIds(new Set()), [])

  const filtered = useMemo(
    () => DIET_FOODS.filter((f) => foodMatchesFilters(f, activeIds)),
    [activeIds]
  )

  const profile = DEMO_PROFILE
  const constitution = lang === 'zh' ? profile.constitutionZh : profile.constitutionEn
  const needs = lang === 'zh' ? profile.needsZh.join(' · ') : profile.needsEn.join(' · ')
  const prefs = lang === 'zh' ? profile.prefsZh.join(' · ') : profile.prefsEn.join(' · ')

  return (
    <section className="pb-20 sm:pb-24">
      <header className="mb-8 sm:mb-10">
        <SectionTitle className="mb-2">{t('dietTitle')}</SectionTitle>
        <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{t('dietSubtitle')}</p>
      </header>

      <div className="mb-7 rounded-[1.375rem] border border-primary/10 bg-white/70 p-4 shadow-card ring-1 ring-ink/[0.03] sm:p-5">
        <div className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
            {t('dietLegendGreen')}
          </p>
          <p className="m-0 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden />
            {t('dietLegendOrange')}
          </p>
          <p className="m-0 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden />
            {t('dietLegendOutOfSeason')}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-[1.375rem] border border-primary/12 bg-gradient-to-br from-primary-soft/50 via-white/90 to-secondary-soft/30 p-5 shadow-card ring-1 ring-ink/[0.04] sm:p-6">
        <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">{t('dietProfileRibbon')}</p>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm sm:text-[0.9375rem]">
          <li>
            <span className="font-semibold text-ink">{t('dietProfileConstitution')} </span>
            <span className="text-muted">{constitution}</span>
          </li>
          <li>
            <span className="font-semibold text-ink">{t('dietProfileNeeds')} </span>
            <span className="text-muted">{needs}</span>
          </li>
          <li>
            <span className="font-semibold text-ink">{t('dietProfilePrefs')} </span>
            <span className="text-muted">{prefs}</span>
          </li>
        </ul>
        <p className="mt-4 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted sm:text-sm">{t('dietProfileNote')}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 font-display text-lg font-semibold text-ink sm:text-xl">{t('dietBrowseTitle')}</h2>
        {activeIds.size > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            {t('dietClearFilters')}
          </Button>
        )}
      </div>

      <div className="mb-8 rounded-[1.375rem] border border-white/90 bg-surface/90 p-5 shadow-card ring-1 ring-ink/[0.035] sm:p-7">
        {DIET_FILTER_GROUPS.map((group) => (
          <DietFilterGroup
            key={group.id}
            titleKey={group.titleKey}
            filters={group.filters}
            activeIds={activeIds}
            onToggle={toggleFilter}
          />
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">
        {t('dietResultCount')
          .replace('{n}', String(filtered.length))
          .replace('{total}', String(DIET_FOODS.length))}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-bg/80 py-12 text-center text-sm text-muted">{t('dietEmpty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((food) => (
            <DietFoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </section>
  )
}
