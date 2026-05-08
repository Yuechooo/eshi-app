import { useMemo, useState, useRef, useEffect } from 'react'
import { Solar } from 'lunar-javascript'
import { useLanguage } from '../../hooks/useLanguage'
import Card from '../ui/Card'

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WELLNESS_TIP_KEYS = ['wellnessTipSun', 'wellnessTipMon', 'wellnessTipTue', 'wellnessTipWed', 'wellnessTipThu', 'wellnessTipFri', 'wellnessTipSat']

function getNearestJieQi(lunar, todayYmd) {
  try {
    const table = lunar.getJieQiTable?.()
    if (!table) return { name: '', isAfter: true }
    const zhTerms = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪']
    let lastBefore = null
    let firstAfter = null
    for (const name of zhTerms) {
      const d = table[name]?.toYmd?.()
      if (!d) continue
      if (d <= todayYmd) lastBefore = name
      else if (!firstAfter) firstAfter = name
    }
    if (lastBefore) return { name: lastBefore, isAfter: true }
    if (firstAfter) return { name: firstAfter, isAfter: false }
  } catch {
    /* jieqi table unavailable */
  }
  return { name: '', isAfter: true }
}

const JIEQI_EN = {
  '冬至': 'Winter Solstice', '小寒': 'Minor Cold', '大寒': 'Major Cold',
  '立春': 'Start of Spring', '雨水': 'Rain Water', '惊蛰': 'Awakening of Insects',
  '春分': 'Spring Equinox', '清明': 'Qingming', '谷雨': 'Grain Rain',
  '立夏': 'Start of Summer', '小满': 'Grain Buds', '芒种': 'Grain in Ear',
  '夏至': 'Summer Solstice', '小暑': 'Minor Heat', '大暑': 'Major Heat',
  '立秋': 'Start of Autumn', '处暑': 'End of Heat', '白露': 'White Dew',
  '秋分': 'Autumn Equinox', '寒露': 'Cold Dew', '霜降': 'Frost Descent',
  '立冬': 'Start of Winter', '小雪': 'Minor Snow', '大雪': 'Major Snow',
}

const ATTR_EN = {
  祭祀: 'Sacrifice', 祈福: 'Prayer', 求嗣: 'Pray for offspring', 开光: 'Consecration',
  嫁娶: 'Marriage', 纳采: 'Betrothal', 移徙: 'Relocation', 入宅: 'Move in',
  安床: 'Set bed', 修造: 'Repair', 动土: 'Groundbreaking', 纳财: 'Accept wealth',
  开市: 'Open business', 交易: 'Trade', 立券: 'Sign contract', 栽种: 'Planting',
  牧养: 'Herding', 纳畜: 'Acquire livestock', 安葬: 'Burial', 修坟: 'Repair tomb',
  立碑: 'Erect tablet', 出行: 'Travel', 解除: 'Remove', 剃头: 'Haircut',
  整手足甲: 'Grooming', 沐浴: 'Bathe', 破土: 'Break ground', 谢土: 'Thank earth',
  斋醮: 'Taoist ritual', 塑绘: 'Painting', 词讼: 'Lawsuit', 开柱眼: 'Open pillar',
  穿井: 'Dig well', 作灶: 'Build stove', 补垣: 'Repair wall', 塞穴: 'Seal hole',
  伐木: 'Cut wood', 合寿木: 'Make coffin', 入殓: 'Encoffin', 移柩: 'Move coffin',
  订盟: 'Alliance', 会友: 'Meet friends', 进人口: 'Add staff', 裁衣: 'Tailor',
  经络: 'Acupuncture', 开仓: 'Open warehouse', 出货财: 'Ship goods', 开厕: 'Build toilet',
  教牛马: 'Train livestock', 求财: 'Seek wealth', 雕刻: 'Carve', 起基: 'Foundation',
  安门: 'Install door', 上梁: 'Raise beam', 开渠: 'Dig canal', 造桥: 'Build bridge',
  盖屋: 'Build house',
}

function getDateData(d, lang, t) {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const ymd = `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const solar = Solar.fromYmd(y, m, day)
  const lunar = solar.getLunar()

  const monthStr = lang === 'zh' ? `${m}月` : d.toLocaleDateString('en-US', { month: 'short' })
  const weekdayStr = t(WEEKDAYS[d.getDay()])

  let lunarStr = lunar.toString()
  if (lang === 'en') lunarStr = `Lunar ${lunar.getMonth()}/${lunar.getDay()}`

  const jieQi = getNearestJieQi(lunar, ymd)
  let jieQiStr = ''
  if (jieQi.name) {
    const termName = lang === 'en' ? (JIEQI_EN[jieQi.name] || jieQi.name) : jieQi.name
    jieQiStr = jieQi.isAfter
      ? (lang === 'zh' ? `${jieQi.name}后` : t('dateAfterTerm').replace('{term}', termName))
      : (lang === 'zh' ? `${jieQi.name}前` : t('dateBeforeTerm').replace('{term}', termName))
  }

  const festivals = [...(solar.getFestivals?.() || []), ...(lunar.getFestivals?.() || [])]
  const yi = lunar.getDayYi?.() || []
  const ji = lunar.getDayJi?.() || []
  const yiList = yi.slice(0, 3)
  const jiList = ji.slice(0, 2)
  const yiStr = lang === 'zh'
    ? yiList.join('、')
    : yiList.map((term) => ATTR_EN[term] || term).join(', ')
  const jiStr = lang === 'zh'
    ? jiList.join('、')
    : jiList.map((term) => ATTR_EN[term] || term).join(', ')
  const attrStr = lang === 'zh'
    ? (yiStr ? `宜${yiStr}` : '') + (jiStr ? (yiStr ? '；忌' : '忌') + jiStr : '') || t('attrExample')
    : (yiStr ? `Favorable: ${yiStr}` : '') + (jiStr ? (yiStr ? '; Avoid: ' : 'Avoid: ') + jiStr : '') || t('attrExample')

  return {
    month: monthStr,
    day,
    weekday: weekdayStr,
    lunarDate: lunarStr,
    jieQi: jieQiStr,
    festival: festivals[0] || '',
    attr: attrStr,
  }
}

function getDateByOffset(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

const tileAdjacent =
  'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-b from-white to-[#f3f2ee] shadow-card ring-1 ring-ink/[0.04] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover'

const tileCenter =
  'flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-[1.25rem] border border-white/95 bg-gradient-to-b from-white to-[#f0efe9] shadow-card ring-2 ring-primary/20 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover'

export default function DateCard({ onViewingDateChange, focusOffset: controlledOffset, onFocusOffsetChange }) {
  const { t, lang } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [internalOffset, setInternalOffset] = useState(0)
  const [slideDir, setSlideDir] = useState(null)
  const prevFocusRef = useRef(0)

  const isControlled = controlledOffset !== undefined && controlledOffset !== null
  const focusOffset = isControlled ? controlledOffset : internalOffset
  const setFocusOffset = isControlled ? (fn) => {
    const next = typeof fn === 'function' ? fn(controlledOffset) : fn
    onFocusOffsetChange?.(next)
  } : setInternalOffset

  const data = useMemo(() => {
    const left = getDateData(getDateByOffset(focusOffset - 1), lang, t)
    const center = getDateData(getDateByOffset(focusOffset), lang, t)
    const right = getDateData(getDateByOffset(focusOffset + 1), lang, t)
    const centerDate = getDateByOffset(focusOffset)
    const dayOfWeek = centerDate.getDay()
    const wellnessTipKey = WELLNESS_TIP_KEYS[dayOfWeek]
    return {
      left,
      center,
      right,
      wellnessTip: t(wellnessTipKey),
    }
  }, [focusOffset, lang, t])

  useEffect(() => {
    onViewingDateChange?.(focusOffset === 0)
  }, [focusOffset, onViewingDateChange])

  useEffect(() => {
    if (prevFocusRef.current === focusOffset) return
    queueMicrotask(() => {
      setSlideDir(prevFocusRef.current > focusOffset ? 'left' : 'right')
      prevFocusRef.current = focusOffset
    })
    const tid = setTimeout(() => setSlideDir(null), 580)
    return () => clearTimeout(tid)
  }, [focusOffset])

  const handleLeftClick = () => {
    setFocusOffset((o) => o - 1)
  }

  const handleCenterClick = () => {
    setExpanded((e) => !e)
  }

  const handleRightClick = () => {
    setFocusOffset((o) => o + 1)
  }

  const slideCenter = slideDir === 'left' ? 'date-tile-slide-left' : slideDir === 'right' ? 'date-tile-slide-right' : ''
  const slideAdjL = slideDir === 'left' ? 'date-tile-adjacent-slide-left' : slideDir === 'right' ? 'date-tile-adjacent-slide-right' : ''

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="rounded-2xl border border-border/45 bg-bg/60 p-5 shadow-inner-well sm:p-6">
          <div className="flex min-h-[6.5rem] items-center justify-center gap-4 sm:gap-5">
            <button
              type="button"
              className={`${tileAdjacent} cursor-pointer ${slideAdjL}`}
              onClick={handleLeftClick}
              title={t('dateViewPrev')}
            >
              <div className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">{data.left.month}</div>
              <div className="text-lg font-bold leading-none text-primary">{data.left.day}</div>
              <div className="text-[0.6rem] font-medium text-muted">{data.left.weekday}</div>
            </button>
            <button
              type="button"
              className={`${tileCenter} cursor-pointer ${slideCenter}`}
              onClick={handleCenterClick}
              aria-expanded={expanded}
              title={t('dateExpandHint')}
            >
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">{data.center.month}</div>
              <div className="font-display text-[2.35rem] font-semibold leading-none tracking-[-0.03em] text-primary sm:text-4xl">{data.center.day}</div>
              <div className="text-[0.72rem] font-medium text-muted">{data.center.weekday}</div>
            </button>
            <button
              type="button"
              className={`${tileAdjacent} cursor-pointer ${slideAdjL}`}
              onClick={handleRightClick}
              title={t('dateViewNext')}
            >
              <div className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">{data.right.month}</div>
              <div className="text-lg font-bold leading-none text-primary">{data.right.day}</div>
              <div className="text-[0.6rem] font-medium text-muted">{data.right.weekday}</div>
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-primary/12 bg-gradient-to-br from-primary-soft/55 via-white/80 to-secondary-soft/35 p-6 shadow-inner-well sm:p-7">
          <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted">{t('wellnessTipLabel')}</span>
          <p className="m-0 font-display text-[1.05rem] font-medium leading-relaxed text-ink sm:text-lg">{data.wellnessTip}</p>
        </div>
      </div>

      <div className={`date-card-expanded ${expanded ? 'expanded' : ''}`}>
        <div className="date-card-expanded-inner px-6 sm:px-8">
          <div className="mb-4 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
            <span>{data.center.lunarDate}</span>
            {data.center.jieQi && <span className="font-medium text-primary"> · {data.center.jieQi}</span>}
            {data.center.festival && <span className="font-medium text-secondary"> · {data.center.festival}</span>}
          </div>
          <div className="rounded-xl border border-border/40 bg-surface/80 p-4 text-sm shadow-card sm:p-5 sm:text-[0.9375rem]">
            <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">{t('attrLabel')}</span>
            <span className="leading-relaxed text-ink">{data.center.attr}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
