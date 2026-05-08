import { Link, Navigate, useParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import Button from '../components/ui/Button'
import { DEMO_PROFILE, getDietFoodById } from '../data/dietFoods'

function pillClass() {
  return 'rounded-full border border-primary/15 bg-primary-soft/60 px-2.5 py-0.5 text-[0.65rem] font-medium text-primary sm:text-xs'
}

function DetailSection({ children }) {
  return (
    <section className="rounded-[1.375rem] border border-white/90 bg-surface/95 p-5 shadow-card ring-1 ring-ink/[0.035] sm:p-7">{children}</section>
  )
}

function dedupeBilingualTags(tags) {
  const seen = new Set()
  return tags.filter((t) => {
    const key = `${t.zh}\t${t.en}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function matchedSuitabilityReasons(food, lang) {
  const tags = lang === 'zh' ? DEMO_PROFILE.personalizationTagsZh : DEMO_PROFILE.personalizationTagsEn
  const tagSet = new Set(tags)
  return food.suitabilityReasons.filter((r) => {
    const tag = lang === 'zh' ? r.profileTagZh : r.profileTagEn
    if (tagSet.has(tag)) return true
    /* Student budget wording in recipes vs prefs copy */
    return lang !== 'zh' && tag === 'Student budget' && tagSet.has('Student-friendly')
  })
}

export default function DietFoodDetailPage() {
  const { foodId } = useParams()
  const { lang, t } = useLanguage()
  const food = foodId ? getDietFoodById(foodId) : null

  if (!foodId || !food) {
    return <Navigate to="/diet" replace />
  }

  if (!food.cautions || !food.foodNature) {
    return <Navigate to="/diet" replace />
  }

  const name = lang === 'zh' ? food.nameZh : food.nameEn
  const intro = lang === 'zh' ? food.introZh : food.introEn
  const titleTagBlob = lang === 'zh'
    ? DEMO_PROFILE.personalizationTagsZh.join(' / ')
    : DEMO_PROFILE.personalizationTagsEn.join(' / ')
  const suitabilityLead = t('dietDetailSuitabilityLead').replace('{tags}', titleTagBlob)
  const reasons = matchedSuitabilityReasons(food, lang)

  const heroTags = dedupeBilingualTags([
    ...food.bodyConditionTags,
    ...food.benefitTags,
    ...food.recipeTags,
    ...food.categoryTags,
  ])

  return (
    <article className="pb-24 sm:pb-28">
      <div className="mb-5 flex justify-start">
        <Button variant="ghost" size="sm" as={Link} to="/diet" className="-ml-1 no-underline">
          <span aria-hidden className="text-lg leading-none">←</span>
          {t('dietDetailBack')}
        </Button>
      </div>

      <div className="overflow-hidden rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white to-[#faf8f4] shadow-card ring-1 ring-ink/[0.04]">
        <div className="relative aspect-[16/9] max-h-[min(420px,55vh)] w-full bg-bg sm:aspect-[21/9]">
          <img src={food.image} alt={name} className="h-full w-full object-cover" loading="eager" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-white drop-shadow-md sm:text-3xl">{name}</h1>
            <p className="mt-1 text-sm font-medium text-white/92 drop-shadow">{lang === 'zh' ? food.nameEn : food.nameZh}</p>
          </div>
        </div>
        <div className="border-t border-white/70 p-5 sm:p-8">
          <p className="m-0 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{intro}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {heroTags.map((tag, i) => (
              <span key={`h-${food.id}-${i}`} className={pillClass()}>
                {lang === 'zh' ? tag.zh : tag.en}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <DetailSection>
          <h2 className="mt-0 font-display text-lg font-semibold text-ink sm:text-xl">{suitabilityLead}</h2>
          {reasons.length === 0 ? (
            <p className="m-0 text-sm text-muted">{t('dietDetailSuitabilityEmpty')}</p>
          ) : (
            <ul className="m-0 list-none space-y-3 p-0">
              {reasons.map((row, i) => (
                <li
                  key={`${food.id}-s-${i}`}
                  className="rounded-2xl border border-primary/[0.12] bg-primary-soft/35 px-4 py-3 text-sm leading-relaxed text-ink"
                >
                  <span className="font-semibold text-primary">{lang === 'zh' ? row.profileTagZh : row.profileTagEn}</span>
                  <span className="text-muted">{lang === 'zh' ? ' · ' : ' · '}</span>
                  {lang === 'zh' ? row.zh : row.en}
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        <DetailSection>
          <h2 className="mt-0 mb-4 font-display text-lg font-semibold text-ink sm:text-xl">{t('dietDetailCautionsTitle')}</h2>
          <div className="space-y-4 text-sm leading-relaxed text-ink">
            <p>{lang === 'zh' ? food.cautions.summaryZh : food.cautions.summaryEn}</p>
            <div>
              <p className="m-0 mb-1 font-semibold text-ink">{t('dietDetailWhoLess')}</p>
              <p className="m-0 text-muted">{lang === 'zh' ? food.cautions.whoLessZh : food.cautions.whoLessEn}</p>
            </div>
            <div>
              <p className="m-0 mb-1 font-semibold text-ink">{t('dietDetailSituations')}</p>
              <p className="m-0 text-muted">{lang === 'zh' ? food.cautions.situationsZh : food.cautions.situationsEn}</p>
            </div>
            <p className="m-0 border-t border-border/70 pt-3 text-xs text-muted italic">{t('dietDetailDisclaimer')}</p>
          </div>
        </DetailSection>

        <DetailSection>
          <h2 className="mt-0 mb-4 font-display text-lg font-semibold text-ink sm:text-xl">{t('dietDetailNatureTitle')}</h2>
          <dl className="m-0 space-y-2 text-sm leading-relaxed">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <dt className="m-0 font-semibold text-ink">{t('dietDetailNatureFlavorLine')}</dt>
              <dd className="m-0 text-muted">
                {lang === 'zh' ? food.foodNature.propertyZh : food.foodNature.propertyEn}
                {' · '}
                {lang === 'zh' ? food.foodNature.flavorZh : food.foodNature.flavorEn}
              </dd>
            </div>
            <div>
              <dt className="m-0 font-semibold text-ink">{t('dietDetailNatureClassification')}</dt>
              <dd className="m-0 mt-1 text-muted">{lang === 'zh' ? food.foodNature.classificationZh : food.foodNature.classificationEn}</dd>
            </div>
            <div>
              <dt className="m-0 font-semibold text-ink">{t('dietDetailNatureSuitable')}</dt>
              <dd className="m-0 mt-1 text-muted">{lang === 'zh' ? food.foodNature.suitableZh : food.foodNature.suitableEn}</dd>
            </div>
          </dl>
        </DetailSection>

        <DetailSection>
          <h2 className="mt-0 mb-4 font-display text-lg font-semibold text-ink sm:text-xl">{t('dietDetailBenefitsTitle')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(food.benefits ?? []).map((card, i) => (
              <div
                key={`${food.id}-b-${i}`}
                className="rounded-2xl border border-white/90 bg-bg/85 p-4 ring-1 ring-ink/[0.03]"
              >
                <h3 className="m-0 text-sm font-semibold text-primary">{lang === 'zh' ? card.titleZh : card.titleEn}</h3>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-muted">{lang === 'zh' ? card.bodyZh : card.bodyEn}</p>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection>
          <h2 className="mt-0 mb-4 font-display text-lg font-semibold text-ink sm:text-xl">{t('dietDetailChooseTitle')}</h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            {food.chooseTips.map((tip, i) => (
              <li key={`${food.id}-c-${i}`}>{lang === 'zh' ? tip.zh : tip.en}</li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection>
          <h2 className="mt-0 mb-5 font-display text-lg font-semibold text-ink sm:text-xl">{t('dietDetailRecipesTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {food.recipes.map((r, i) => (
              <div
                key={`${food.id}-r-${i}`}
                className="flex flex-col rounded-2xl border border-white/90 bg-gradient-to-b from-white to-[#faf8f4] p-4 shadow-card ring-1 ring-ink/[0.035]"
              >
                <h3 className="m-0 text-base font-semibold text-ink">{lang === 'zh' ? r.nameZh : r.nameEn}</h3>
                <p className="mt-3 mb-3 flex-1 text-sm leading-relaxed text-muted">{lang === 'zh' ? r.descZh : r.descEn}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] font-medium text-muted sm:text-xs">
                  <span>{t('dietDetailCookTime').replace('{n}', String(r.minutes))}</span>
                  <span>{t('dietDetailDifficulty')}{lang === 'zh' ? '：' : ': '}{lang === 'zh' ? r.difficultyZh : r.difficultyEn}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(r.tags ?? []).map((tag, ti) => (
                    <span key={`${food.id}-${i}-tg-${ti}`} className={pillClass()}>
                      {lang === 'zh' ? tag.zh : tag.en}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>
    </article>
  )
}
