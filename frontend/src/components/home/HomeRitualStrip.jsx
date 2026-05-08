import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'

const RITUALS = [
  { emoji: '🍵', titleKey: 'homeRitualTeaTitle', bodyKey: 'homeRitualTeaBody' },
  { emoji: '🚶', titleKey: 'homeRitualWalkTitle', bodyKey: 'homeRitualWalkBody' },
  { emoji: '🌙', titleKey: 'homeRitualSleepTitle', bodyKey: 'homeRitualSleepBody' },
]

export default function HomeRitualStrip() {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {RITUALS.map(({ emoji, titleKey, bodyKey }) => (
        <Card key={titleKey} compact className="border-white/90 bg-gradient-to-b from-white to-bg/80">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft/80 text-xl shadow-inner-well" aria-hidden>
              {emoji}
            </span>
            <h3 className="font-display text-base font-semibold leading-tight text-ink">{t(titleKey)}</h3>
          </div>
          <p className="text-xs leading-relaxed text-muted sm:text-sm">{t(bodyKey)}</p>
        </Card>
      ))}
    </div>
  )
}
