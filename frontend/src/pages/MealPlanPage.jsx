import { useState, useEffect, useCallback } from 'react'
import {
  getMeals, getIngredients, addMeal, addIngredient,
  deleteMeal, updateMeal, generateMealPlan, generateMealPlanAI, getProfile,
} from '../api'
import { ingredientNamesZh } from '../i18n'
import { useLanguage } from '../hooks/useLanguage'
import { useScheduleContext } from '../hooks/useScheduleContext'
import AddMealForm from '../components/AddMealForm'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'
import { FALLBACK_IMG, getMealImage } from '../data/foodImages'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const MEAL_LABEL_COLOR = {
  breakfast: 'text-amber-700',
  lunch:     'text-emerald-700',
  dinner:    'text-purple-700',
  snack:     'text-pink-700',
}

const MEAL_GRADIENT = {
  breakfast: 'from-amber-100 to-orange-200',
  lunch:     'from-emerald-100 to-teal-200',
  dinner:    'from-purple-100 to-indigo-200',
  snack:     'from-pink-100 to-rose-200',
}

// ─── MealImage component ───────────────────────────────────────────────────────
// Tier 1 → matched Wikimedia photo (exact name or keyword)
// Tier 2 → FALLBACK_IMG (neutral rice congee bowl)
// Tier 3 → soft gradient (if Wikimedia is unreachable)

function MealImage({ name, mealType, className }) {
  const primary = getMealImage(name)
  const urls = primary === FALLBACK_IMG ? [FALLBACK_IMG] : [primary, FALLBACK_IMG]
  const [idx, setIdx] = useState(0)
  const gradient = MEAL_GRADIENT[mealType] ?? MEAL_GRADIENT.lunch

  useEffect(() => { setIdx(0) }, [name, mealType])

  if (idx >= urls.length) {
    return <div className={`bg-gradient-to-br ${gradient} ${className}`} />
  }

  return (
    <img
      src={urls[idx]}
      alt={name}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={() => setIdx(prev => prev + 1)}
    />
  )
}

// ─── Tag helpers ───────────────────────────────────────────────────────────────

const TAG_LABEL_MAP = {
  'warming':            'tagWarming',
  'cooling':            'tagCooling',
  'quick':              'tagQuick',
  'nourishing':         'tagNourishing',
  'protein-rich':       'tagProteinRich',
  'light':              'tagLight',
  'digestion-friendly': 'tagDigestionFriendly',
  'seasonal':           'tagSeasonal',
  'low-oil':            'tagLowOil',
  'busy-day':           'tagBusyDay',
  'fatigue-support':    'tagFatigueSupport',
  'workout-support':    'tagWorkoutSupport',
}

const TAG_COLORS = {
  warming:              'bg-amber-50 text-amber-700 border-amber-200',
  cooling:              'bg-sky-50 text-sky-700 border-sky-200',
  quick:                'bg-emerald-50 text-emerald-700 border-emerald-200',
  nourishing:           'bg-orange-50 text-orange-700 border-orange-200',
  'protein-rich':       'bg-red-50 text-red-700 border-red-200',
  light:                'bg-teal-50 text-teal-700 border-teal-200',
  'digestion-friendly': 'bg-lime-50 text-lime-700 border-lime-200',
  seasonal:             'bg-green-50 text-green-700 border-green-200',
  'low-oil':            'bg-cyan-50 text-cyan-700 border-cyan-200',
  'busy-day':           'bg-slate-50 text-slate-700 border-slate-200',
  'fatigue-support':    'bg-violet-50 text-violet-700 border-violet-200',
  'workout-support':    'bg-rose-50 text-rose-700 border-rose-200',
}

function parseTags(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw) } catch (_) { return [] }
}

function difficultyKey(d) {
  if (d === 'easy')   return 'difficultyEasy'
  if (d === 'medium') return 'difficultyMedium'
  if (d === 'hard')   return 'difficultyHard'
  return null
}

function displayIngredientName(name, lang) {
  if (lang === 'zh' && ingredientNamesZh[name]) return ingredientNamesZh[name]
  return name
}

// ─── Mock content generators ───────────────────────────────────────────────────

function generateIntro(meal, lang) {
  const n = (meal.name || '').toLowerCase()
  const tags = parseTags(meal.tags)
  const pool = {
    en: {
      congee:  'A gentle, warming bowl that soothes the digestive system and restores energy. Best savoured slowly.',
      egg:     'Light, protein-rich, and deeply versatile — a nourishing option that supports strength without heaviness.',
      soup:    'A slow-simmered broth that warms from the inside out, replenishing energy and supporting balance.',
      stirfry: 'Quick, vibrant, and full of natural goodness. Fresh ingredients come together in minutes over high heat.',
      rice:    'A grounding staple that anchors the meal and supports steady energy throughout the day.',
      chicken: 'Lean and gently warming, this dish supports Qi and provides sustained energy.',
      beef:    'Hearty and mineral-rich, a nourishing option ideal for recovery days or cooler weather.',
      salad:   'Crisp and refreshing, this dish brings lightness and clarity — great for clearing the mind.',
      toast:   'Simple, honest, and satisfying — a quick combination that keeps mornings easy and nourishing.',
      default: 'A thoughtfully balanced dish crafted to align with your wellness rhythm for the day.',
    },
    zh: {
      congee:  '一碗温润绵滑的粥，轻抚脾胃，补充元气。慢慢享用，感受食物的温柔。',
      egg:     '清淡而富含蛋白质，鸡蛋既滋补又不易积滞，是一日元气的温柔起点。',
      soup:    '慢火炖煮的汤，由内而外地暖身，帮助恢复精力与平衡。',
      stirfry: '大火翻炒，保留食材本味，快速出锅，鲜活滋味一并端上桌。',
      rice:    '米饭是餐桌的基石，温和易消化，为全天活动提供平稳能量。',
      chicken: '鸡肉温补适中，有助于补气，提供持续而不燥的活力。',
      beef:    '牛肉醇厚，矿物质丰富，适合恢复期或气候转凉时的滋补之选。',
      salad:   '清脆爽口，带来一份轻盈与通透，适合需要清明头脑的时刻。',
      toast:   '简单、踏实、满足感强——忙碌早晨最温柔也最快手的选择。',
      default: '这道膳食用心搭配，贴合您今日的养生节奏与身体需求。',
    },
  }
  const p = lang === 'zh' ? pool.zh : pool.en
  if (n.includes('congee') || n.includes('porridge')) return p.congee
  if (n.includes('egg') || n.includes('scrambled') || n.includes('omelette')) return p.egg
  if (n.includes('soup') || n.includes('broth') || n.includes('stew')) return p.soup
  if (n.includes('stir') || n.includes('fry') || n.includes('wok')) return p.stirfry
  if (n.includes('rice') && !n.includes('porridge')) return p.rice
  if (n.includes('chicken')) return p.chicken
  if (n.includes('beef') || n.includes('braised')) return p.beef
  if (n.includes('salad')) return p.salad
  if (n.includes('toast') || n.includes('sandwich')) return p.toast
  if (tags.includes('nourishing')) return lang === 'zh' ? p.soup : p.soup
  return p.default
}

function detectMethod(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('congee') || n.includes('porridge') || n.includes('gruel')) return 'simmer'
  if (n.includes('stir') || n.includes('wok') || n.includes('fry')) return 'stirfry'
  if (n.includes('soup') || n.includes('broth') || n.includes('stew')) return 'soup'
  if (n.includes('egg') || n.includes('scrambled') || n.includes('omelette')) return 'egg'
  if (n.includes('steam')) return 'steam'
  if (n.includes('salad')) return 'salad'
  if (n.includes('toast') || n.includes('sandwich') || n.includes('bread')) return 'toast'
  if (n.includes('rice') || n.includes('pasta')) return 'simmer'
  return 'default'
}

function generateSteps(meal, lang) {
  const method = detectMethod(meal.name)
  const zh = lang === 'zh'
  const STEPS = {
    simmer: zh ? [
      '将主要谷物用清水淘洗2–3遍至水清。',
      '锅中加入足量清水或高汤，大火烧开。',
      '加入谷物，转小火，保持轻微沸腾状态。',
      '小火慢煮20–30分钟，期间轻轻搅拌防止粘底。',
      '最后5分钟加入其余食材，调味后盛碗享用。',
    ] : [
      'Rinse the grain in cold water until the water runs clear.',
      'Bring plenty of water or broth to a boil in a medium pot.',
      'Add the grain, reduce heat to low, and keep at a gentle simmer.',
      'Cook for 20–30 minutes, stirring occasionally to prevent sticking.',
      'Stir in any remaining ingredients in the final 5 minutes, season lightly, and serve warm.',
    ],
    stirfry: zh ? [
      '将所有食材洗净，蔬菜和蛋白质切成大小均匀的片或块。',
      '锅（最好是炒锅）大火烧热，加入少量食用油。',
      '先下蛋白质大火翻炒2–3分钟，至表面微黄熟透。',
      '加入蔬菜，继续大火翻炒3–4分钟，保持爽脆口感。',
      '加酱油和少许盐调味，立即出锅，配米饭趁热享用。',
    ] : [
      'Wash and cut all vegetables and protein into even, bite-sized pieces.',
      'Heat a wok or large pan over high heat and add a small drizzle of oil.',
      'Add the protein and stir-fry for 2–3 minutes until lightly browned.',
      'Add the vegetables and toss briskly for another 3–4 minutes, keeping them crisp.',
      'Season with soy sauce and a pinch of salt. Serve immediately over rice.',
    ],
    soup: zh ? [
      '将所有食材洗净去皮，根据需要切块或切片。',
      '锅中加入高汤或清水，中火煮至轻微沸腾。',
      '加入主要食材，转小火。',
      '小火慢炖25–35分钟，至食材软烂入味。',
      '品尝咸淡，加盐调味，盛入碗中即可享用。',
    ] : [
      'Prepare all ingredients — rinse, peel, and roughly chop as needed.',
      'Pour broth or water into a pot and warm over medium heat until gently simmering.',
      'Add the main ingredients and reduce heat to low.',
      'Simmer slowly for 25–35 minutes until everything is tender and the flavours meld.',
      'Taste and adjust seasoning. Ladle into bowls and serve warm.',
    ],
    egg: zh ? [
      '将鸡蛋打入碗中，加入一小撮盐，充分打散。',
      '如有配料（蔬菜、葱花等），轻轻拌入蛋液中。',
      '平底锅中加少量油，中小火预热。',
      '倒入蛋液，待边缘开始凝固后轻柔翻炒或翻面。',
      '趁蛋液略嫩时出锅，立即上桌风味最佳。',
    ] : [
      'Crack the eggs into a bowl, add a pinch of salt, and whisk until smooth.',
      'Fold in any additions — chopped vegetables, herbs, or a splash of broth.',
      'Heat a non-stick pan over medium-low heat with a small amount of oil.',
      'Pour in the egg mixture and cook gently, stirring softly until just set.',
      'Remove from heat while slightly soft — they finish cooking off the heat. Serve at once.',
    ],
    steam: zh ? [
      '将食材处理好，根据食谱需要腌制或调味。',
      '蒸锅中加足量水，大火烧开。',
      '将食材摆放在蒸碗或蒸板上。',
      '放入蒸锅，中火蒸至建议时长（通常8–15分钟）。',
      '小心取出，淋上葱油或酱汁，立即上桌。',
    ] : [
      'Prepare and season the main ingredient as directed.',
      'Fill a steamer or pot with water and bring to a boil over high heat.',
      'Arrange the ingredient on a heatproof plate or in the steaming basket.',
      'Steam over medium heat for the recommended time (usually 8–15 minutes).',
      'Remove carefully, drizzle with any sauce or garnish, and serve right away.',
    ],
    salad: zh ? [
      '将所有蔬菜彻底清洗，充分沥干水分。',
      '将食材切成或撕成一口大小的形状，放入大碗。',
      '在小碗中调制酱汁——橄榄油、柠檬汁、一小撮盐搅匀即可。',
      '将酱汁淋在沙拉上，轻柔翻拌，确保均匀裹住。',
      '立即享用，口感最为新鲜爽脆。',
    ] : [
      'Wash all greens and vegetables thoroughly, then pat or spin completely dry.',
      'Tear or slice ingredients into easy, bite-sized portions.',
      'Whisk together a simple dressing — olive oil, a squeeze of lemon, and a pinch of salt.',
      'Drizzle the dressing over the salad and toss gently until lightly coated.',
      'Serve straight away for the best crunch and freshness.',
    ],
    toast: zh ? [
      '将面包片放入烤面包机，烤至金黄酥脆（约2–3分钟）。',
      '在烤面包的同时，准备好配料——煎鸡蛋、切好的蔬菜或抹酱。',
      '将配料整齐叠放在烤好的面包上。',
      '撒上少量调味料——现磨黑胡椒或新鲜香草效果绝佳。',
      '趁热立即享用，口感最酥脆。',
    ] : [
      'Place the bread in a toaster and toast until golden and crisp.',
      'While it toasts, prepare your toppings — cook an egg, slice vegetables, or spread any paste.',
      'Layer the toppings generously onto the warm toast.',
      'Add a pinch of seasoning — freshly cracked pepper or a sprinkle of herbs.',
      'Eat immediately while the toast is still warm and crisp.',
    ],
    default: zh ? [
      '将所有食材洗净，根据需要削皮、切块或称量备用。',
      '锅中加少量油，中火加热至油温适中。',
      '按烹饪时间由长到短依次加入食材。',
      '适时翻炒或搅拌，煮至所有食材熟透。',
      '加盐和喜欢的调料调味，趁热盛出享用。',
    ] : [
      'Wash and prepare all ingredients — peel, slice, or measure as needed.',
      'Heat your pan or pot over medium heat with a small amount of oil.',
      'Add ingredients in order, starting with those that take the longest to cook.',
      'Stir or check regularly until everything is cooked through.',
      'Season gently with salt and any preferred condiments. Serve warm.',
    ],
  }
  return STEPS[method] || STEPS.default
}

// ─── Wellness insights (mock) ──────────────────────────────────────────────────

function buildInsights(meals, profile, lang) {
  const proteinKeywords = ['chicken', 'beef', 'egg', 'fish', 'tofu', 'bean', 'pork', 'shrimp', 'salmon']
  const proteinCount = meals.filter(m =>
    (m.ingredients || []).some(i => proteinKeywords.some(k => i.ingredient_name?.toLowerCase().includes(k)))
    || parseTags(m.tags).includes('protein-rich')
  ).length

  const warmCount = meals.filter(m =>
    parseTags(m.tags).some(tg => ['warming', 'nourishing'].includes(tg))
  ).length

  const quickCount = meals.filter(m =>
    (m.cooking_time != null && m.cooking_time <= 20) || parseTags(m.tags).includes('quick')
  ).length

  const seasonal = (profile?.seasonal_need || '').toLowerCase()
  const seasonLabel = seasonal.includes('spring') ? 'spring'
    : seasonal.includes('summer') ? 'summer'
    : seasonal.includes('autumn') ? 'autumn'
    : seasonal.includes('winter') ? 'winter'
    : null

  const total = meals.length || 1
  const zh = lang === 'zh'

  return [
    {
      icon: '🥩',
      title: zh ? '蛋白质均衡' : 'Protein balance',
      body: zh
        ? `本周共有 ${proteinCount} 份膳食富含优质蛋白质，有助于维持体力和肌肉修复。`
        : `${proteinCount} of your ${total} meals include a quality protein source — supporting energy and recovery.`,
    },
    {
      icon: '🫖',
      title: zh ? '温热食物比例' : 'Warm food balance',
      body: zh
        ? `约 ${Math.round((warmCount / total) * 100)}% 的膳食为温热或滋补食物，贴合中医养生原则。`
        : `About ${Math.round((warmCount / total) * 100)}% of meals are warming or nourishing — in line with TCM balance.`,
    },
    {
      icon: '⚡',
      title: zh ? '快手餐准备' : 'Quick-meal readiness',
      body: zh
        ? `共有 ${quickCount} 份餐可在 20 分钟内完成，忙碌时仍能保持健康饮食。`
        : `${quickCount} meals can be ready in under 20 minutes, keeping healthy eating realistic on busy days.`,
    },
    {
      icon: '🌿',
      title: zh ? '应季食材' : 'Seasonal alignment',
      body: seasonLabel
        ? (zh
          ? `本周膳食融入了${seasonLabel === 'spring' ? '春季养肝' : seasonLabel === 'summer' ? '夏季清热' : seasonLabel === 'autumn' ? '秋季润肺' : '冬季养肾'}的饮食理念。`
          : `Your plan reflects ${seasonLabel} seasonal guidance — ${seasonLabel === 'spring' ? 'liver-supporting greens' : seasonLabel === 'summer' ? 'heat-clearing foods' : seasonLabel === 'autumn' ? 'lung-moistening ingredients' : 'kidney-nourishing warmth'}.`)
        : (zh
          ? '在个人资料中设置季节侧重，可获得更有针对性的应季膳食建议。'
          : 'Set a seasonal focus in your profile to get targeted seasonal meal guidance.'),
    },
  ]
}

function buildRuleSummary(profile, lang) {
  const zh = lang === 'zh'
  const parts = []
  const busyCount = (profile?.busy_days || '').split(',').filter(Boolean).length
  if (profile?.schedule_intensity === 'scheduleIntensityHeavy' || busyCount >= 3) {
    parts.push(zh
      ? '由于您本周日程较繁忙，大部分快手餐控制在 20 分钟内，减少烹饪压力。'
      : 'Since your week looks busy, most meals are kept quick — under 20 minutes — to reduce cooking stress.')
  }
  const cond = (profile?.body_condition || '').toLowerCase()
  if (cond.includes('cool') || cond.includes('偏寒') || cond.includes('deficient')) {
    parts.push(zh
      ? '针对您的偏寒体质，计划避免了生冷食物，多选温热滋补型菜肴。'
      : 'For your cool constitution, the plan favours warming, nourishing dishes over raw or cold foods.')
  }
  const goal = (profile?.health_goal || '').toLowerCase()
  if (goal.includes('digestion') || goal.includes('脾胃')) {
    parts.push(zh
      ? '您的脾胃调理目标已纳入考量，推荐了易消化的粥品与蒸煮类食物。'
      : 'Your digestion goal is reflected in easy-to-digest porridges and steamed dishes throughout the week.')
  }
  if (parts.length === 0) {
    parts.push(zh
      ? '根据您的个人档案与日程安排，本周膳食兼顾了营养均衡与实际操作性。'
      : 'Meals were selected to balance your profile preferences with practical cooking for the week.')
  }
  return parts.join(' ')
}

// ─── Schedule-aware helpers ────────────────────────────────────────────────────

const SCHED_TAG_BADGE = {
  workout:      { labelKey: 'schedBadgeWorkout',      cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  lateNight:    { labelKey: 'schedBadgeLateNight',    cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  lowEnergy:    { labelKey: 'schedBadgeLowEnergy',    cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  socialDinner: { labelKey: 'schedBadgeSocialDinner', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
}

function DayScheduleBadge({ level, tags, t }) {
  const levelBadge =
    level === 'very-busy' ? { label: t('schedBadgeVeryBusy'), cls: 'bg-orange-100 text-orange-700 border-orange-200' }
    : level === 'busy'    ? { label: t('schedBadgeBusy'),     cls: 'bg-amber-100 text-amber-700 border-amber-200' }
    : level === 'light'   ? { label: t('schedBadgeLight'),    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : null

  if (!levelBadge && (!tags || tags.length === 0)) return null

  return (
    <div className="mb-3 flex flex-wrap gap-1">
      {levelBadge && (
        <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold ${levelBadge.cls}`}>
          {levelBadge.label}
        </span>
      )}
      {(tags || []).map(tag => {
        const cfg = SCHED_TAG_BADGE[tag]
        if (!cfg) return null
        return (
          <span key={tag} className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-medium ${cfg.cls}`}>
            {t(cfg.labelKey)}
          </span>
        )
      })}
    </div>
  )
}

function generateScheduleReason(meal, daySchedule, lang) {
  if (!daySchedule) return null
  const zh = lang === 'zh'
  const { level, tags } = daySchedule
  const parts = []

  if (level === 'very-busy') {
    parts.push(zh
      ? `今天日程非常繁忙，Eshi 优先选择了准备时间短、操作最简单的餐食，减少烹饪压力。`
      : `With a very busy schedule today, Eshi picked a quick, minimal-prep meal to keep cooking stress low.`)
  } else if (level === 'busy') {
    parts.push(zh
      ? `今天日程较忙，Eshi 为您选择了快手、少步骤的餐食，确保您仍能好好吃饭。`
      : `With a busy day ahead, this meal was chosen for its speed and simplicity — still nourishing, just low-fuss.`)
  } else if (level === 'light') {
    parts.push(zh
      ? `今天日程轻松，Eshi 为您搭配了更完整、更滋补的膳食，适合慢慢享用。`
      : `With a lighter schedule today, this meal is more complete and nourishing — great for taking your time.`)
  }

  if ((tags || []).includes('workout')) {
    parts.push(zh
      ? `今天是运动日，这份餐食含有更多蛋白质，帮助肌肉修复与体能恢复。`
      : `Since today is a workout day, this meal is higher in protein to support muscle recovery.`)
  }
  if ((tags || []).includes('lateNight') || (tags || []).includes('lowEnergy')) {
    parts.push(zh
      ? `考虑到今天精力不足或有熬夜情况，推荐温热、容易消化的食物，轻养脾胃。`
      : `With low energy or a late night, this warm and easy-to-digest meal is gentle on your system.`)
  }
  if ((tags || []).includes('socialDinner')) {
    parts.push(zh
      ? `今天有聚餐安排，早餐和午餐保持清淡，为晚间聚餐留出空间。`
      : `Since you have a social dinner today, earlier meals are kept lighter to balance the day.`)
  }

  if (parts.length === 0) {
    parts.push(zh
      ? `这道餐食符合您的个人体质与今日节奏，搭配自然、温和滋补。`
      : `This meal fits your wellness profile and today's rhythm — balanced and naturally nourishing.`)
  }

  return parts.join(' ')
}

// ─── Meal Detail Modal ─────────────────────────────────────────────────────────

function MealDetailModal({ meal, daySchedule, onClose, t, lang }) {
  const labelColor = MEAL_LABEL_COLOR[meal.meal_type] || MEAL_LABEL_COLOR.breakfast
  const tags = parseTags(meal.tags)
  const diffKey = difficultyKey(meal.difficulty)
  const intro = generateIntro(meal, lang)
  const steps = generateSteps(meal, lang)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 bg-ink/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[1.75rem] bg-[#faf9f6] shadow-2xl ring-1 ring-ink/[0.04]"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative overflow-hidden rounded-t-[2rem] sm:rounded-t-[1.75rem]">
          <MealImage
            name={meal.name}
            mealType={meal.meal_type}
            className="h-52 w-full"
            w={600}
            h={312}
          />
          {/* Gradient overlay so text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-xl leading-none text-ink shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label={t('mealDetailClose')}
          >
            ×
          </button>
          {/* Meal name overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-8">
            <span className={`text-xs font-semibold uppercase tracking-wider ${labelColor} drop-shadow`}>
              {t(meal.meal_type)}
            </span>
            <h2 className="mt-0.5 font-display text-xl font-bold leading-tight text-white drop-shadow">
              {meal.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-5">
          {/* Badges row */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {meal.cooking_time && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted">
                ⏱ {t('cookMin').replace('{n}', meal.cooking_time)}
              </span>
            )}
            {diffKey && (
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted">
                {t(diffKey)}
              </span>
            )}
          </div>

          {/* Introduction */}
          <p className="mb-5 text-sm leading-relaxed text-muted">{intro}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${TAG_COLORS[tag] || 'bg-border/30 text-muted border-border'}`}
                >
                  {TAG_LABEL_MAP[tag] ? t(TAG_LABEL_MAP[tag]) : tag}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          {meal.ingredients?.length > 0 && (
            <section className="mb-5">
              <h3 className="mb-2.5 text-sm font-semibold text-ink">{t('mealDetailIngredients')}</h3>
              <ul className="space-y-1.5">
                {meal.ingredients.map((ing, i) => (
                  <li key={ing.ingredient_id ?? i} className="flex items-center gap-2 text-sm text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    <span className="font-medium">
                      {displayIngredientName(ing.ingredient_name, lang)}
                    </span>
                    {(ing.quantity || ing.unit) && (
                      <span className="text-muted">
                        {ing.quantity ? `${ing.quantity}` : ''}{ing.unit ? ` ${ing.unit}` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Cooking steps */}
          <section className="mb-5">
            <h3 className="mb-2.5 text-sm font-semibold text-ink">{t('mealDetailSteps')}</h3>
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Notes */}
          {meal.notes && (
            <div className="mb-5 rounded-xl border border-border bg-surface px-4 py-3">
              <p className="mb-0.5 text-xs font-semibold text-muted">{t('mealDetailNotes')}</p>
              <p className="text-sm leading-relaxed text-ink">{meal.notes}</p>
            </div>
          )}

          {/* Why recommended (AI-generated) */}
          {meal.why_recommended && (
            <div className="rounded-[1rem] border border-primary/15 bg-primary-soft/60 px-4 py-3.5">
              <p className="mb-1 text-xs font-semibold text-primary">{t('mealDetailWhy')}</p>
              <p className="text-sm leading-relaxed text-ink">{meal.why_recommended}</p>
            </div>
          )}

          {/* Schedule-aware explanation */}
          {(() => {
            const reason = generateScheduleReason(meal, daySchedule, lang)
            if (!reason) return null
            const isHighIntensity = daySchedule?.level === 'very-busy' || daySchedule?.level === 'busy'
            return (
              <div className={[
                'mt-3 rounded-[1rem] border px-4 py-3.5',
                isHighIntensity
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-emerald-200 bg-emerald-50',
              ].join(' ')}>
                <p className={`mb-1 text-xs font-semibold ${isHighIntensity ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {t('mealWhySchedContext')}
                </p>
                <p className="text-sm leading-relaxed text-ink">{reason}</p>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// ─── Compact meal card (grid view) ────────────────────────────────────────────

function MealCard({ meal, onClick, t }) {
  const labelColor = MEAL_LABEL_COLOR[meal.meal_type] || MEAL_LABEL_COLOR.breakfast

  return (
    <li
      className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      {/* Food photo */}
      <MealImage
        name={meal.name}
        mealType={meal.meal_type}
        className="h-40 w-full"
        w={400}
        h={240}
      />
      {/* Info strip */}
      <div className="px-3 py-2.5">
        <span className={`text-[0.6rem] font-semibold uppercase tracking-wide ${labelColor}`}>
          {t(meal.meal_type)}
        </span>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{meal.name}</p>
      </div>
    </li>
  )
}

// ─── Manage-mode meal item ─────────────────────────────────────────────────────

function SwapMealItem({ meal, swapFrom, onSwap, onSetSwapFrom, onEdit, onDelete, t }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center gap-3 p-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
          <MealImage name={meal.name} mealType={meal.meal_type} className="h-full w-full" w={96} h={96} />
        </div>
        <div className="min-w-0">
          <p className={`text-[0.6rem] font-semibold uppercase tracking-wide ${MEAL_LABEL_COLOR[meal.meal_type] || ''}`}>
            {t(meal.meal_type)}
          </p>
          <p className="truncate text-sm font-semibold text-ink">{meal.name}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {swapFrom ? (
            swapFrom.id !== meal.id && (
              <Button variant="action" onClick={() => onSwap(swapFrom, meal)}>{t('swapMeal')}</Button>
            )
          ) : (
            <>
              <button type="button" className="rounded-full border border-transparent px-2 py-1 text-xs text-muted hover:border-border hover:bg-bg hover:text-primary" onClick={() => onEdit(meal)} title={t('edit')}>✎</button>
              <button type="button" className="rounded-full border border-transparent px-2 py-1 text-xs text-muted hover:border-border hover:bg-bg hover:text-primary" onClick={() => onSetSwapFrom(meal)} title={t('swapMeal')}>⇄</button>
              <button type="button" className="rounded-full border border-transparent px-2 py-1 text-xs text-muted hover:border-border hover:bg-bg hover:text-accent" onClick={() => onDelete(meal.id)} title={t('delete')}>×</button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MealPlanPage() {
  const { t, lang } = useLanguage()
  const { schedule } = useScheduleContext()
  const [meals, setMeals] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [swapFrom, setSwapFrom] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [planSummary, setPlanSummary] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mealsData, ingredientsData, profileData] = await Promise.all([
        getMeals(), getIngredients(), getProfile(),
      ])
      setMeals(mealsData)
      setIngredients(ingredientsData)
      setProfile(profileData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const handleAdd = async (data) => {
    if (data.id) {
      await updateMeal(data.id, { name: data.name, day_of_week: data.day_of_week, meal_type: data.meal_type, notes: data.notes, ingredients: data.ingredients })
      setEditingMeal(null)
    } else {
      await addMeal(data)
    }
    setShowAddMeal(false)
    refresh()
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      await generateMealPlan()
      setPlanSummary(buildRuleSummary(profile, lang))
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateAI = async () => {
    setGeneratingAI(true)
    setError(null)
    try {
      const result = await generateMealPlanAI()
      if (result.plan_summary) setPlanSummary(result.plan_summary)
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setGeneratingAI(false)
    }
  }

  const toIngPayload = (ings) =>
    (ings || []).map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity ?? 1, unit: i.unit }))

  const handleSwap = useCallback(async (mealA, mealB) => {
    await Promise.all([
      updateMeal(mealA.id, { name: mealA.name, day_of_week: mealB.day_of_week, meal_type: mealB.meal_type, notes: mealA.notes, ingredients: toIngPayload(mealA.ingredients) }),
      updateMeal(mealB.id, { name: mealB.name, day_of_week: mealA.day_of_week, meal_type: mealA.meal_type, notes: mealB.notes, ingredients: toIngPayload(mealB.ingredients) }),
    ])
    setSwapFrom(null)
    refresh()
  }, [])

  const handleDelete = async (id) => {
    await deleteMeal(id)
    refresh()
  }

  const handleEdit = (meal) => {
    setSelectedMeal(null)
    setEditingMeal(meal)
    setShowAddMeal(true)
  }

  const byDay = DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  meals.forEach(m => { if (byDay[m.day_of_week]) byDay[m.day_of_week].push(m) })

  const insights = !loading && meals.length > 0 ? buildInsights(meals, profile, lang) : []

  if (loading) return <div className="py-16 text-center text-sm text-muted">{t('loading')}</div>
  if (error) return <div className="py-16 text-center text-sm text-accent">{t('error')}: {error}. {t('errorBackend')}</div>

  return (
    <section className="pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle className="mb-0">{t('weeklyMealPlan')}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleGenerate} disabled={generating || generatingAI}>
            {generating ? t('loading') : t('generateMealPlan')}
          </Button>
          <Button onClick={handleGenerateAI} disabled={generating || generatingAI}>
            {generatingAI ? t('generatingAI') : t('generateMealPlanAI')}
          </Button>
          <Button variant="secondary" onClick={() => setIsEditMode(v => !v)}>
            {isEditMode ? (lang === 'zh' ? '完成' : 'Done') : (lang === 'zh' ? '管理' : 'Manage')}
          </Button>
          <Button variant="secondary" onClick={() => { setEditingMeal(null); setShowAddMeal(true) }}>
            {t('addMeal')}
          </Button>
        </div>
      </div>
      <p className="mb-8 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">{t('generateMealPlanHint')}</p>

      {(showAddMeal || editingMeal) && (
        <AddMealForm
          ingredients={ingredients}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddMeal(false); setEditingMeal(null) }}
          showAddIngredient={showAddIngredient}
          setShowAddIngredient={setShowAddIngredient}
          onAddIngredient={addIngredient}
          onIngredientAdded={refresh}
          editMeal={editingMeal}
        />
      )}

      {swapFrom && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-primary/15 bg-primary-soft/80 px-5 py-4 text-sm font-medium text-primary shadow-inner-well">
          <span>{t('swapMealWith')}</span>
          <Button variant="ghost" size="sm" onClick={() => setSwapFrom(null)}>{t('cancelSwap')}</Button>
        </div>
      )}

      {/* Schedule-aware plan summary — always visible */}
      <div className="mb-8 rounded-[1.25rem] border border-primary/15 bg-primary-soft/50 px-6 py-4 shadow-card">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary/70">
          {t('mealPlanSchedSummaryTitle')}
        </p>
        <p className="text-sm leading-relaxed text-ink">{t('mealPlanSchedSummaryBody')}</p>
      </div>

      {planSummary && (
        <div className="mb-8 rounded-[1.25rem] border border-primary/15 bg-primary-soft/60 px-6 py-5 shadow-card">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary/70">
            {t('whyTheseMeals')}
          </p>
          <p className="text-sm leading-relaxed text-ink">{planSummary}</p>
        </div>
      )}

      {/* 7-day grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
        {DAYS.map(day => (
          <Card key={day}>
            <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-primary">{t(day)}</h3>
            <DayScheduleBadge
              level={schedule[day]?.level || 'normal'}
              tags={schedule[day]?.tags || []}
              t={t}
            />
            {byDay[day].length === 0 ? (
              <p className="text-sm italic text-muted">{t('noMeals')}</p>
            ) : (
              <ul className="m-0 list-none space-y-3 p-0">
                {byDay[day].map(m => (
                  isEditMode ? (
                    <SwapMealItem
                      key={m.id}
                      meal={m}
                      swapFrom={swapFrom}
                      onSwap={handleSwap}
                      onSetSwapFrom={setSwapFrom}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      t={t}
                    />
                  ) : (
                    <MealCard
                      key={m.id}
                      meal={m}
                      onClick={() => setSelectedMeal(m)}
                      t={t}
                    />
                  )
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>

      {/* Wellness Insights */}
      {insights.length > 0 && (
        <div className="mt-12">
          <SectionTitle className="mb-6">{t('wellnessInsights')}</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map(ins => (
              <div key={ins.title} className="rounded-[1.25rem] border border-border bg-surface px-5 py-4 shadow-card">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl leading-none">{ins.icon}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{ins.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-ink">{ins.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          daySchedule={schedule[selectedMeal.day_of_week]}
          onClose={() => setSelectedMeal(null)}
          t={t}
          lang={lang}
        />
      )}
    </section>
  )
}
