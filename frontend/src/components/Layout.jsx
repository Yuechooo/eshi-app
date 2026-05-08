import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { getProfile } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import Button from './ui/Button'
import BottomNav from './BottomNav'

const BODY_OPTS = ['bodyWarm', 'bodyCool', 'bodyBalanced', 'bodyQiDeficient', 'bodyDamp', 'bodyOther']
const SEASONAL_OPTS = ['seasonalSpring', 'seasonalSummer', 'seasonalAutumn', 'seasonalWinter', 'seasonalNone']
const GOAL_OPTS = ['goalImmunity', 'goalWeight', 'goalEnergy', 'goalSleep', 'goalDigestion', 'goalStress', 'goalOther']

function fmt(t, val, opts) {
  if (!val) return ''
  return opts?.includes(val) ? t(val) : val
}

const navLinkClass = ({ isActive }) =>
  [
    'rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-[color,background,box-shadow,border-color] duration-200',
    isActive
      ? 'border-primary/25 bg-primary-soft text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-primary/15'
      : 'border-border/80 bg-surface/90 text-muted shadow-card hover:border-primary/30 hover:text-primary hover:shadow-card-hover',
  ].join(' ')

export default function Layout() {
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const isProfilePage = location.pathname === '/profile'
  const [profile, setProfile] = useState(null)
  const [scrollY, setScrollY] = useState(0)
  const scrolled = scrollY > 10

  const fetchProfile = () => {
    getProfile()
      .then(p => setProfile(p))
      .catch(() => setProfile(null))
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    const onProfileUpdate = () => fetchProfile()
    window.addEventListener('profile-updated', onProfileUpdate)
    return () => window.removeEventListener('profile-updated', onProfileUpdate)
  }, [])

  useEffect(() => {
    let raf = null
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        raf = null
      })
    }
    queueMicrotask(() => setScrollY(window.scrollY))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const hour = new Date().getHours()
  const greetingKey = hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening'
  const greeting = t(greetingKey)
  const displayName = profile?.display_name || ''
  const name = displayName?.trim() || (lang === 'zh' ? '用户' : 'there')

  const hasSavedUser = profile && (
    (profile.display_name || '').trim() ||
    (profile.body_condition || '').trim() ||
    (profile.seasonal_need || '').trim() ||
    (profile.health_goal || '').trim() ||
    (profile.birth_year != null && profile.birth_year !== '') ||
    (profile.dietary_preference || '').trim() ||
    (profile.allergies || '').trim() ||
    (profile.notes || '').trim()
  )
  const sumParts = []
  if (profile?.body_condition) sumParts.push(fmt(t, profile.body_condition, BODY_OPTS))
  if (profile?.seasonal_need) sumParts.push(fmt(t, profile.seasonal_need, SEASONAL_OPTS))
  if (profile?.health_goal) {
    const goals = String(profile.health_goal).split(',').map(g => g.trim()).filter(Boolean)
    goals.forEach(g => sumParts.push(fmt(t, g, GOAL_OPTS)))
  }
  const summaryText = sumParts.length ? sumParts.join(' · ') : null
  const summaryBtnText = [(profile?.display_name || '').trim() || '—', summaryText].filter(Boolean).join(' · ')

  const SCROLL_RANGE = 100
  const progress = Math.min(scrollY / SCROLL_RANGE, 1)
  const greetingStyle = {
    opacity: 1 - progress,
    transform: `translateY(-${0.5 * progress}rem)`,
    marginTop: `${0.75 * (1 - progress)}rem`,
    marginBottom: 0,
    maxHeight: `${5 * (1 - progress)}rem`,
    paddingTop: `${0.5 * (1 - progress)}em`,
    paddingBottom: `${0.5 * (1 - progress)}em`,
  }

  return (
    <div className="relative mx-auto min-h-dvh max-w-[1100px] px-4 pb-32 pt-5 sm:px-6 md:pb-12 md:pt-6">
      <header
        className={[
          'sticky top-0 z-20 -mx-4 mb-7 flex flex-col-reverse gap-3 rounded-b-[1.25rem] border-b border-white/70 bg-bg/88 px-4 pb-4 pt-3 backdrop-blur-xl sm:-mx-6 sm:mb-8 sm:px-6',
          scrolled ? 'shadow-card' : '',
        ].join(' ')}
      >
        <div
          className="overflow-hidden text-left font-display text-2xl font-semibold italic leading-[1.15] tracking-[-0.02em] text-ink sm:text-[1.75rem]"
          style={greetingStyle}
        >
          {greeting}, {name}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <NavLink to="/" className="font-logo text-[1.65rem] font-semibold leading-none text-primary no-underline transition-transform hover:translate-y-[-2px] sm:text-3xl">
            {t('appTitle')}
          </NavLink>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex gap-1 self-start rounded-2xl border border-white/80 bg-surface/95 p-1 shadow-card ring-1 ring-ink/[0.04] sm:self-auto">
              <button
                type="button"
                className={[
                  'rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
                  lang === 'en' ? 'bg-primary-soft text-primary shadow-inner-well' : 'text-muted hover:text-primary',
                ].join(' ')}
                onClick={() => setLang('en')}
              >
                {t('langEnglish')}
              </button>
              <button
                type="button"
                className={[
                  'rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
                  lang === 'zh' ? 'bg-primary-soft text-primary shadow-inner-well' : 'text-muted hover:text-primary',
                ].join(' ')}
                onClick={() => setLang('zh')}
              >
                {t('langChinese')}
              </button>
            </div>
            <nav className="hidden flex-wrap gap-2 md:flex">
              <NavLink to="/" end className={navLinkClass}>
                {t('navHome')}
              </NavLink>
              <NavLink to="/meal-plan" className={navLinkClass}>
                {t('navMealPlan')}
              </NavLink>
              <NavLink to="/diet" className={navLinkClass}>
                {t('navDiet')}
              </NavLink>
              <NavLink to="/grocery" className={navLinkClass}>
                {t('navGroceryList')}
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                {t('navProfile')}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      {isProfilePage && (
        <div className="mb-8 flex flex-col gap-3 sm:mb-10">
          {hasSavedUser && (
            <button
              type="button"
              className="w-full rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white to-[#f9f7f3] px-5 py-4 text-left text-sm font-semibold text-primary shadow-card ring-1 ring-ink/[0.035] transition-[box-shadow,border-color] hover:shadow-card-hover"
              onClick={() => navigate('/profile', { state: { openModal: true } })}
            >
              {summaryBtnText}
            </button>
          )}
          <Button variant="secondary" className="w-full py-3" onClick={() => navigate('/profile', { state: { addNew: true } })}>
            {hasSavedUser ? t('addNewUserInfo') : t('addNewUser')}
          </Button>
        </div>
      )}
      <main className="md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
