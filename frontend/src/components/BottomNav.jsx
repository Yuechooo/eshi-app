import { NavLink } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 4l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V10.5Z" />
      <path d="M9 21.5V12h6v9.5" />
    </svg>
  )
}

function IconPlan() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="M8 14h2M12 14h2M16 14h2M8 17.5h2M12 17.5h2" />
    </svg>
  )
}

function IconDiet() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4.5c-2.8 0-5 2-5 4.5 0 2.2 1.5 3.8 3.2 5.5.6.6 1 1.2 1.3 2 .3.8.5 1.7.5 2.5v2.5h.5a2 2 0 0 0 4 0h.5v-2.5c0-.8.2-1.7.5-2.5.3-.8.7-1.4 1.3-2 1.7-1.7 3.2-3.3 3.2-5.5 0-2.5-2.2-4.5-5-4.5Z" />
      <path d="M8.5 9.5h7" />
    </svg>
  )
}

function IconGrocery() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8h15l-1.5 11H7.5L6 8Z" />
      <path d="M6 8 5.5 5H3.5M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8.5" r="3.25" />
      <path d="M5.5 20.5c.8-3.5 3.6-5.5 6.5-5.5s5.7 2 6.5 5.5" />
    </svg>
  )
}

const itemClass = ({ isActive }) =>
  [
    'flex min-w-0 flex-1 max-w-[4.25rem] flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 transition-[color,background,transform,box-shadow] duration-200 sm:max-w-[5rem] sm:gap-1 sm:px-1.5 sm:py-2',
    isActive
      ? 'bg-primary-soft text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-primary/15'
      : 'text-muted hover:text-primary active:scale-[0.97]',
  ].join(' ')

const labelClass = 'max-w-full truncate text-center text-[0.6rem] font-semibold leading-tight tracking-wide sm:text-[0.65rem]'

export default function BottomNav() {
  const { t } = useLanguage()

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
      aria-label={t('appTitle')}
    >
      <div className="pointer-events-auto mx-auto max-w-lg px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-1 sm:px-3">
        <div
          className={[
            'flex items-stretch justify-between gap-0 rounded-[1.35rem] border border-white/80',
            'bg-surface/92 px-0.5 py-1.5 shadow-bar backdrop-blur-xl sm:px-1 sm:py-2',
            'ring-1 ring-ink/[0.05]',
          ].join(' ')}
        >
          <NavLink to="/" end className={itemClass} title={t('navHome')}>
            <IconHome />
            <span className={labelClass}>{t('navHome')}</span>
          </NavLink>
          <NavLink to="/meal-plan" className={itemClass} title={t('navMealPlan')}>
            <IconPlan />
            <span className={labelClass}>{t('navMealPlan')}</span>
          </NavLink>
          <NavLink to="/diet" className={itemClass} title={t('navDiet')}>
            <IconDiet />
            <span className={labelClass}>{t('navDiet')}</span>
          </NavLink>
          <NavLink to="/grocery" className={itemClass} title={t('navGroceryList')}>
            <IconGrocery />
            <span className={labelClass}>{t('navGroceryList')}</span>
          </NavLink>
          <NavLink to="/profile" className={itemClass} title={t('navProfile')}>
            <IconProfile />
            <span className={labelClass}>{t('navProfile')}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
