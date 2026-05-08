import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAY_SHORT_ZH = ['日', '一', '二', '三', '四', '五', '六']

function getDaysInMonth(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days = last.getDate()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  const remainder = cells.length % 7
  if (remainder > 0) for (let i = 0; i < 7 - remainder; i++) cells.push(null)
  return cells
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function isToday(d) {
  return isSameDay(d, new Date())
}

const MONTHS_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function CalendarPicker({ open, onClose, onSelect, anchorRef }) {
  const { t, lang } = useLanguage()
  const [viewDate, setViewDate] = useState(() => new Date())
  const [mode, setMode] = useState('calendar')
  const popoverRef = useRef(null)

  useEffect(() => {
    if (!open) return
    queueMicrotask(() => {
      setViewDate(new Date())
      setMode('calendar')
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose?.()
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (mode === 'calendar') onClose?.()
        else setMode('calendar')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose, anchorRef, mode])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = lang === 'zh'
    ? `${month + 1}月`
    : viewDate.toLocaleDateString('en-US', { month: 'long' })
  const weekdays = lang === 'zh' ? WEEKDAY_SHORT_ZH : WEEKDAY_SHORT
  const cells = getDaysInMonth(year, month)

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1))
  const handleNextMonth = () => setViewDate(new Date(year, month + 1))

  const handleDayClick = (day) => {
    if (!day) return
    const d = new Date(year, month, day)
    onSelect?.(d)
    onClose?.()
  }

  const handleMonthSelect = (m) => {
    setViewDate(new Date(year, m, 1))
    setMode('calendar')
  }

  const handleYearSelect = (y) => {
    setViewDate(new Date(y, month, 1))
    setMode('calendar')
  }

  const months = lang === 'zh' ? MONTHS_ZH : MONTHS_EN
  const yearRange = 6
  const years = Array.from({ length: yearRange * 2 + 1 }, (_, i) => year - yearRange + i)

  if (!open) return null

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full z-30 mt-3 min-w-[280px] rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white to-[#f9f7f3] p-5 shadow-popover ring-1 ring-ink/[0.05] animate-[calendar-picker-in_0.3s_cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-bg text-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          onClick={handlePrevMonth}
          aria-label={t('calPrevMonth')}
        >
          ‹
        </button>
        <span className="flex items-center gap-1 text-sm font-semibold text-ink">
          <button type="button" className="rounded-md px-2 py-1 transition-colors hover:bg-primary-soft hover:text-primary" onClick={() => setMode('month')}>
            {monthName}
          </button>
          <button type="button" className="rounded-md px-2 py-1 transition-colors hover:bg-primary-soft hover:text-primary" onClick={() => setMode('year')}>
            {year}
          </button>
        </span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-bg text-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          onClick={handleNextMonth}
          aria-label={t('calNextMonth')}
        >
          ›
        </button>
      </div>

      {mode === 'calendar' && (
        <>
          <div className="mb-2 grid grid-cols-7 gap-0.5">
            {weekdays.map((w, i) => (
              <span key={i} className="text-center text-[0.7rem] font-medium text-muted">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <span key={i} className="pointer-events-none aspect-square min-w-8" />
              const d = new Date(year, month, day)
              const today = isToday(d)
              return (
                <button
                  key={i}
                  type="button"
                  className={[
                    'aspect-square min-w-8 rounded-md border-0 text-sm transition-colors',
                    today
                      ? 'bg-primary-soft font-semibold text-primary hover:bg-primary hover:text-surface'
                      : 'bg-transparent text-ink hover:bg-primary-soft hover:text-primary',
                  ].join(' ')}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </>
      )}

      {mode === 'month' && (
        <div className="grid grid-cols-4 gap-1">
          {months.map((name, m) => (
            <button
              key={m}
              type="button"
              className={[
                'rounded-md border-0 px-2 py-2 text-sm transition-colors',
                m === month ? 'bg-primary-soft font-semibold text-primary' : 'bg-transparent text-ink hover:bg-primary-soft hover:text-primary',
              ].join(' ')}
              onClick={() => handleMonthSelect(m)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {mode === 'year' && (
        <div className="grid max-h-[200px] grid-cols-4 gap-1 overflow-y-auto">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={[
                'rounded-md border-0 px-2 py-2 text-sm transition-colors',
                y === year ? 'bg-primary-soft font-semibold text-primary' : 'bg-transparent text-ink hover:bg-primary-soft hover:text-primary',
              ].join(' ')}
              onClick={() => handleYearSelect(y)}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
