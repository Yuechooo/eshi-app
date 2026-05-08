import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'
import MoodImageStrip from './MoodImageStrip'

export default function WarmGreetingBlock() {
  const { t } = useLanguage()

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="relative min-w-0 flex-1 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-soft/70 via-white/90 to-secondary-soft/50 p-6 shadow-inner-well sm:p-7">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">{t('homeDailyRibbon')}</p>
          <p className="mb-3 font-display text-xl font-semibold leading-snug tracking-tight text-ink sm:text-2xl">{t('homeDailyLead')}</p>
          <p className="text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{t('homeDailyBody')}</p>
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-secondary/15 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-8 left-1/2 h-20 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl sm:left-8 sm:translate-x-0" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col justify-center lg:w-[46%]">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">{t('homeMoodStripLabel')}</p>
          <MoodImageStrip />
        </div>
      </div>
    </Card>
  )
}
