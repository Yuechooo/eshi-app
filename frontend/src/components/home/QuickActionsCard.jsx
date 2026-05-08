import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'
import Button from '../ui/Button'

const BODY_STATES = [
  { key: 'bodyTired', id: 'tired' },
  { key: 'bodyHeat', id: 'heat' },
  { key: 'bodyAppetite', id: 'appetite' },
  { key: 'bodyStress', id: 'stress' },
  { key: 'bodySleep', id: 'sleep' },
]

const linkPrimary =
  'inline-flex w-full items-center justify-center rounded-2xl border border-primary/90 bg-primary px-5 py-3.5 text-center text-sm font-semibold text-surface shadow-[0_4px_14px_-4px_rgba(139,168,136,0.55)] no-underline transition-[filter,transform] hover:brightness-[1.04] active:scale-[0.99]'

const linkGhost =
  'inline-flex w-full items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-b from-white to-[#f6f4f0] px-5 py-3.5 text-center text-sm font-semibold text-ink shadow-card ring-1 ring-ink/[0.04] no-underline transition-[box-shadow,border-color,color,transform] hover:border-primary/25 hover:text-primary hover:shadow-card-hover active:scale-[0.99]'

export default function QuickActionsCard() {
  const { t } = useLanguage()
  const [selectedState, setSelectedState] = useState(null)

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/meal-plan" className={linkPrimary}>
          {t('quickPlanWeek')}
        </Link>
        <Link to="/grocery" className={linkGhost}>
          {t('quickGrocery')}
        </Link>
        <Link to="/meal-plan" className={linkGhost}>
          {t('quickLogMeals')}
        </Link>
        <Button as={Link} to="/profile" variant="secondary" className="w-full justify-center py-3.5 no-underline">
          {t('quickProfile')}
        </Button>
      </div>
      <div className="mt-6 rounded-2xl border border-border/50 bg-bg/50 p-5 shadow-inner-well sm:mt-7 sm:p-6">
        <span className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted">{t('bodyStateLabel')}</span>
        <div className="flex flex-wrap gap-2.5">
          {BODY_STATES.map(({ key, id }) => (
            <button
              key={id}
              type="button"
              className={[
                'rounded-full border px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm',
                selectedState === id
                  ? 'border-primary bg-primary-soft text-primary shadow-inner-well ring-1 ring-primary/15'
                  : 'border-border/80 bg-surface/90 text-muted shadow-card hover:border-primary/35 hover:text-primary',
              ].join(' ')}
              onClick={() => setSelectedState(selectedState === id ? null : id)}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
