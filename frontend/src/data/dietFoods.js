/**
 * Mock diet foods — all curated as suitable for demo profile:
 * 偏寒 / spleen + damp + weight-friendly, 少油 易做 学生预算
 * Tags use ids that match FILTER_IDS in dietFilters.js
 */
import { FOOD_DETAIL_EXTRAS } from './foodDetailExtras'

/**
 * Tags shown in suitability section heading (演示用户画像).
 * Order: constitution wording + wellness needs + daily prefs.
 */
export const DEMO_PROFILE = {
  constitutionZh: '偏寒',
  constitutionEn: 'Cool-leaning',
  needsZh: ['健脾', '祛湿', '减脂'],
  needsEn: ['Spleen support', 'Dampness', 'Lighter meals'],
  prefsZh: ['少油', '易做', '学生预算'],
  prefsEn: ['Less oil', 'Easy prep', 'Student-friendly'],
  /** For detail title 「适合「…」的人食用」 — use fuller constitution label first */
  personalizationTagsZh: ['偏寒体质', '健脾', '祛湿', '减脂', '少油', '易做', '快手', '学生预算'],
  personalizationTagsEn: ['Cool-leaning constitution', 'Spleen support', 'Dampness', 'Lighter meals', 'Less oil', 'Easy prep', 'Quick prep', 'Student-friendly'],
}

/** @typedef {{ zh: string, en: string }} Bilingual */
/** @typedef {{ id: string, nameZh: string, nameEn: string, descZh: string, descEn: string, image: string, ingredientIds: string[], benefitIds: string[], recipeIds: string[], bodyNoteZh: string, bodyNoteEn: string, displayTags: Bilingual[], introZh: string, introEn: string, categoryTags: Bilingual[], benefitTags: Bilingual[], recipeTags: Bilingual[], bodyConditionTags: Bilingual[], suitabilityReasons: { profileTagZh: string, profileTagEn: string, zh: string, en: string }[], cautions: object, foodNature: object, benefits: { titleZh: string, titleEn: string, bodyZh: string, bodyEn: string }[], chooseTips: Bilingual[], recipes: object[], foodBenefitCards: { titleZh: string, titleEn: string, bodyZh: string, bodyEn: string }[] }} DietFood */

const SEASONAL_TAG = { zh: '非应季', en: 'Out of season' }

// Demo-only season mismatch map.
// Mark some foods as "not currently in season" so the UI shows the orange tag.
const SEASONALITY_MAP = {
  'pumpkin': false,
  'winter-melon': false,
  'purple-sweet-potato': false,
  'walnuts': false,
  'lotus-root': false,
  'snow-fungus': false,
} /** @type {Record<string, boolean>} */

function classifyFoodTemp(propertyZh) {
  const p = String(propertyZh ?? '')
  if (p.includes('性寒') || p.includes('性凉') || p.includes('偏凉') || p.includes('凉') || p.includes('冷')) return 'cold'
  if (p.includes('性温') || p.includes('偏温') || p.includes('温')) return 'warm'
  return 'neutral'
}

function makeMatchTag(profileTagZh, profileTagEn) {
  const zh =
    profileTagZh.includes('体质') || profileTagZh.includes('减') ? `适合${profileTagZh}` : profileTagZh
  const en =
    profileTagEn.toLowerCase().includes('constitution') || profileTagEn.toLowerCase().includes('lighter') || profileTagZh.includes('减')
      ? `Suitable for ${profileTagEn}`
      : profileTagEn
  return { zh, en }
}

function computeUserTags(food) {
  const userSetZh = new Set(DEMO_PROFILE.personalizationTagsZh)

  const matchByKey = new Map() // key: profileTagZh
  const matchKeys = new Set()

  for (const r of food.suitabilityReasons || []) {
    if (!userSetZh.has(r.profileTagZh)) continue
    matchByKey.set(r.profileTagZh, makeMatchTag(r.profileTagZh, r.profileTagEn))
    matchKeys.add(r.profileTagZh)
  }

  const foodTemp = classifyFoodTemp(food.foodNature?.propertyZh)

  // Ensure core tags exist even if the detail extras don't explicitly include them.
  const hasSpleen = food.benefitIds?.includes('ben_spleen')
  const hasDamp = food.benefitIds?.includes('ben_damp')
  const hasWeight = food.benefitIds?.includes('ben_weight') || food.recipeIds?.includes('rec_lowfat')
  const hasLessOil = food.recipeIds?.includes('rec_lowfat')

  if (userSetZh.has('偏寒体质') && foodTemp !== 'cold') {
    matchByKey.set('偏寒体质', makeMatchTag('偏寒体质', 'Cool-leaning constitution'))
    matchKeys.add('偏寒体质')
  }
  if (userSetZh.has('健脾') && hasSpleen) {
    matchByKey.set('健脾', makeMatchTag('健脾', 'Spleen support'))
    matchKeys.add('健脾')
  }
  if (userSetZh.has('祛湿') && hasDamp) {
    matchByKey.set('祛湿', makeMatchTag('祛湿', 'Dampness'))
    matchKeys.add('祛湿')
  }
  if (userSetZh.has('减脂') && hasWeight) {
    matchByKey.set('减脂', makeMatchTag('减脂', 'Lighter meals'))
    matchKeys.add('减脂')
  }
  if (userSetZh.has('少油') && hasLessOil) {
    matchByKey.set('少油', makeMatchTag('少油', 'Less oil'))
    matchKeys.add('少油')
  }

  const cautionByKey = new Map()

  // Constitution mismatch: cold foods conflict with偏寒体质.
  if (userSetZh.has('偏寒体质') && foodTemp === 'cold' && !matchKeys.has('偏寒体质')) {
    cautionByKey.set('偏寒体质', { zh: '偏寒体质少吃', en: 'Cool-leaning constitution: eat less' })
  }

  // Weight/diet mismatch.
  if (userSetZh.has('减脂') && !hasWeight && !matchKeys.has('减脂')) {
    cautionByKey.set('减脂', { zh: '减脂少吃', en: 'Lighter meals: eat less' })
  }

  // Dampness period: example calls out cold/raw foods.
  if (userSetZh.has('祛湿') && foodTemp === 'cold' && !matchKeys.has('祛湿')) {
    cautionByKey.set('祛湿', { zh: '祛湿期少吃', en: 'Dampness-draining: eat less' })
  }

  // Oil preference mismatch.
  if (userSetZh.has('少油') && !hasLessOil && !matchKeys.has('少油')) {
    cautionByKey.set('少油', { zh: '少油期少吃', en: 'Less oil: eat less' })
  }

  return {
    userMatchTags: [...matchByKey.values()],
    userCautionTags: [...cautionByKey.values()],
  }
}

function mergeFoodDetailRow(base) {
  const x = FOOD_DETAIL_EXTRAS[base.id] || {}
  const cards = x.foodBenefitCards ?? []
  const { userMatchTags, userCautionTags } = computeUserTags({
    ...base,
    foodNature: x.foodNature,
    benefitIds: base.benefitIds,
    recipeIds: base.recipeIds,
    suitabilityReasons: x.suitabilityReasons ?? [],
  })
  const isSeasonal = SEASONALITY_MAP[base.id] ?? true
  return {
    ...base,
    introZh: x.introZh ?? base.descZh,
    introEn: x.introEn ?? base.descEn,
    categoryTags: x.categoryTags ?? [],
    benefitTags: x.benefitTags ?? [],
    recipeTags: x.recipeTags ?? [],
    bodyConditionTags: x.bodyConditionTags ?? [],
    suitabilityReasons: x.suitabilityReasons ?? [],
    cautions: x.cautions,
    foodNature: x.foodNature,
    foodBenefitCards: cards,
    benefits: cards,
    chooseTips: x.chooseTips ?? [],
    recipes: x.recipes ?? [],
    userMatchTags,
    userCautionTags,
    isSeasonal,
    seasonalTag: isSeasonal ? null : SEASONAL_TAG,
  }
}

const DIET_FOODS_BASE = [
  {
    id: 'millet-porridge',
    nameZh: '小米粥', nameEn: 'Millet porridge',
    descZh: '温和养胃，易消化，适合偏寒体质早餐。',
    descEn: 'Gentle on the stomach, easy to digest — a warm breakfast for cooler constitutions.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_grain', 'ing_lixia'],
    benefitIds: ['ben_spleen', 'ben_stomach', 'ben_weight'],
    recipeIds: ['rec_breakfast', 'rec_congee', 'rec_quick'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '五谷杂粮', en: 'Whole grains' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '养胃', en: 'Stomach' },
      { zh: '低脂', en: 'Low-fat' },
      { zh: '快手', en: 'Quick' },
    ],
  },
  {
    id: 'chinese-yam',
    nameZh: '山药', nameEn: 'Chinese yam',
    descZh: '平补脾肺肾，蒸煮最宜，少油易做。',
    descEn: 'Supports spleen, lung, and kidney in a balanced way; steam or braise with minimal oil.',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_root', 'ing_lixia'],
    benefitIds: ['ben_kidney', 'ben_spleen', 'ben_qi'],
    recipeIds: ['rec_home', 'rec_soup', 'rec_staple'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '根菜', en: 'Roots' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '补肾', en: 'Kidney' },
    ],
  },
  {
    id: 'red-dates',
    nameZh: '红枣', nameEn: 'Red dates',
    descZh: '补中益气、养血安神，甜而温润。',
    descEn: 'Traditionally used to nourish qi and blood and calm the spirit — warm and naturally sweet.',
    image: 'https://images.unsplash.com/photo-1587735243475-64d498f89fbc?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_fruit', 'ing_lixia'],
    benefitIds: ['ben_qi', 'ben_calm', 'ben_skin'],
    recipeIds: ['rec_soup', 'rec_congee', 'rec_home'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '水果', en: 'Fruit' },
      { zh: '补气血', en: 'Qi & blood' },
      { zh: '安神', en: 'Calming' },
    ],
  },
  {
    id: 'spinach',
    nameZh: '菠菜', nameEn: 'Spinach',
    descZh: '绿叶疏肝养血，快炒或焯水少油即可。',
    descEn: 'Leafy greens for the liver and blood — a quick blanch or light stir-fry keeps oil low.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_leaf'],
    benefitIds: ['ben_skin', 'ben_blood', 'ben_spleen'],
    recipeIds: ['rec_home', 'rec_quick', 'rec_lowfat'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '绿叶菜', en: 'Leafy greens' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '低脂', en: 'Low-fat' },
      { zh: '快手', en: 'Quick' },
    ],
  },
  {
    id: 'black-beans',
    nameZh: '黑豆', nameEn: 'Black beans',
    descZh: '补肾利水，适合与杂粮同煮，学生电饭煲友好。',
    descEn: 'Kidney-supporting legume; cooks well with grains — dorm-friendly in a rice cooker.',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_bean', 'ing_grain'],
    benefitIds: ['ben_kidney', 'ben_damp', 'ben_weight'],
    recipeIds: ['rec_congee', 'rec_soup', 'rec_staple'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '豆制品', en: 'Soy & beans' },
      { zh: '补肾', en: 'Kidney' },
      { zh: '祛湿', en: 'Dampness' },
    ],
  },
  {
    id: 'pumpkin',
    nameZh: '南瓜', nameEn: 'Pumpkin',
    descZh: '甘温益气，健脾养胃，蒸煮最省事。',
    descEn: 'Naturally sweet and warming; steams quickly for easy, low-oil meals.',
    image: 'https://images.unsplash.com/photo-1508061253366-f7aa15859fc7?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_gourd', 'ing_root'],
    benefitIds: ['ben_spleen', 'ben_stomach', 'ben_weight'],
    recipeIds: ['rec_home', 'rec_staple', 'rec_quick'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '瓜豆', en: 'Gourds & beans' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '养胃', en: 'Stomach' },
    ],
  },
  {
    id: 'winter-melon',
    nameZh: '冬瓜', nameEn: 'Winter melon',
    descZh: '利水消肿、清热不伤正，宜清炖少油。',
    descEn: 'Light and clearing for excess fluid; gentle simmer keeps it mild for mixed constitutions.',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_gourd'],
    benefitIds: ['ben_damp', 'ben_heat', 'ben_weight'],
    recipeIds: ['rec_soup', 'rec_home', 'rec_lowfat'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '瓜豆', en: 'Gourds' },
      { zh: '清热', en: 'Cooling' },
      { zh: '祛湿', en: 'Dampness' },
      { zh: '低脂', en: 'Low-fat' },
    ],
  },
  {
    id: 'shiitake',
    nameZh: '香菇', nameEn: 'Shiitake mushroom',
    descZh: '菌类扶正，助健脾祛湿，快炒煲汤皆宜。',
    descEn: 'Mushrooms to support immunity and spleen; great in soups or quick stir-fries.',
    image: 'https://images.unsplash.com/photo-1593560368968-4f88661761fb?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_fungi'],
    benefitIds: ['ben_spleen', 'ben_damp', 'ben_qi'],
    recipeIds: ['rec_soup', 'rec_home', 'rec_quick'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '菌藻', en: 'Mushrooms' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '祛湿', en: 'Dampness' },
    ],
  },
  {
    id: 'egg',
    nameZh: '鸡蛋', nameEn: 'Egg',
    descZh: '优质蛋白，蒸蛋水煮最省时少油。',
    descEn: 'Complete protein — steamed or soft-boiled for minimal oil and fast prep.',
    image: 'https://images.unsplash.com/photo-1586191582151-f738afec2c1d?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_dairy'],
    benefitIds: ['ben_skin', 'ben_weight', 'ben_qi'],
    recipeIds: ['rec_breakfast', 'rec_home', 'rec_quick'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '蛋奶', en: 'Eggs & dairy' },
      { zh: '低脂', en: 'Low-fat' },
      { zh: '快手', en: 'Quick' },
      { zh: '早餐', en: 'Breakfast' },
    ],
  },
  {
    id: 'tofu',
    nameZh: '豆腐', nameEn: 'Tofu',
    descZh: '植物蛋白清淡，红烧清蒸皆可控制用油量。',
    descEn: 'Plant protein that stays light — braise or steam to control oil easily.',
    image: 'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_bean'],
    benefitIds: ['ben_skin', 'ben_weight', 'ben_heat'],
    recipeIds: ['rec_home', 'rec_veg', 'rec_lowfat'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '豆制品', en: 'Soy foods' },
      { zh: '低脂餐', en: 'Low-fat' },
      { zh: '素食', en: 'Vegetarian' },
    ],
  },
  {
    id: 'crucian-carp',
    nameZh: '鲫鱼', nameEn: 'Crucian carp',
    descZh: '健脾利湿，汤色奶白少油可做到。',
    descEn: 'Classic fish for spleen and dampness support — a milky broth with little added oil.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_seafood'],
    benefitIds: ['ben_spleen', 'ben_damp', 'ben_qi'],
    recipeIds: ['rec_soup', 'rec_home'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '水产', en: 'Seafood' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '祛湿', en: 'Dampness' },
    ],
  },
  {
    id: 'chicken-breast',
    nameZh: '鸡胸肉', nameEn: 'Chicken breast',
    descZh: '低脂高蛋白，水煎或低温少油快熟。',
    descEn: 'Lean protein for lighter plates — pan-sear or poach with minimal oil, cooks fast.',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_meat'],
    benefitIds: ['ben_weight', 'ben_skin', 'ben_qi'],
    recipeIds: ['rec_lowfat', 'rec_quick', 'rec_home'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '肉类', en: 'Meat' },
      { zh: '低脂', en: 'Low-fat' },
      { zh: '快手', en: 'Quick' },
    ],
  },
  {
    id: 'purple-sweet-potato',
    nameZh: '紫薯', nameEn: 'Purple sweet potato',
    descZh: '粗粮饱腹，蒸煮即可，适合控制体重。',
    descEn: 'Fiber-rich whole food — steam until tender for an easy, filling side.',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63d7e9383?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_root', 'ing_grain'],
    benefitIds: ['ben_weight', 'ben_skin', 'ben_spleen'],
    recipeIds: ['rec_staple', 'rec_breakfast', 'rec_quick'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '根菜', en: 'Roots' },
      { zh: '五谷杂粮', en: 'Grains' },
      { zh: '减肥', en: 'Weight' },
    ],
  },
  {
    id: 'walnuts',
    nameZh: '核桃', nameEn: 'Walnuts',
    descZh: '补肾温肺，少量佐粥或沙拉即可。',
    descEn: 'Kidney and lung support in small amounts — crush into porridge or sprinkle on greens.',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_nut'],
    benefitIds: ['ben_kidney', 'ben_lung', 'ben_calm'],
    recipeIds: ['rec_congee', 'rec_breakfast', 'rec_home'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '坚果', en: 'Nuts' },
      { zh: '补肾', en: 'Kidney' },
      { zh: '润肺', en: 'Lung' },
    ],
  },
  {
    id: 'snow-fungus',
    nameZh: '银耳', nameEn: 'Snow fungus',
    descZh: '滋阴润肺，甜汤少糖亦清甜。',
    descEn: 'Yin-nourishing for the lungs — simmer as a lightly sweet soup with modest sugar.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_fungi'],
    benefitIds: ['ben_lung', 'ben_skin', 'ben_heat'],
    recipeIds: ['rec_soup', 'rec_home'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '菌藻', en: 'Fungi' },
      { zh: '润肺', en: 'Lung' },
      { zh: '养颜', en: 'Radiance' },
    ],
  },
  {
    id: 'lotus-root',
    nameZh: '莲藕', nameEn: 'Lotus root',
    descZh: '健脾开胃，凉拌快炒或炖汤皆可。',
    descEn: 'Crisp segments for spleen and appetite — quick salad, stir-fry, or slow soup.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_root'],
    benefitIds: ['ben_spleen', 'ben_stomach', 'ben_qi'],
    recipeIds: ['rec_cold', 'rec_home', 'rec_soup'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '根菜', en: 'Roots' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '凉菜', en: 'Cold dish' },
    ],
  },
  {
    id: 'chicken-soup',
    nameZh: '鸡汤', nameEn: 'Chicken soup',
    descZh: '温补气血，去浮油后更清爽少负担。',
    descEn: 'Warming broth for qi and blood — skim fat for a cleaner, lighter bowl.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_meat', 'ing_lixia'],
    benefitIds: ['ben_qi', 'ben_stomach', 'ben_spleen'],
    recipeIds: ['rec_soup', 'rec_home'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '肉类', en: 'Meat' },
      { zh: '煲汤', en: 'Soup' },
      { zh: '补气血', en: 'Qi & blood' },
    ],
  },
  {
    id: 'corn',
    nameZh: '玉米', nameEn: 'Corn',
    descZh: '粗粮健脾，水煮或微波，学生党友好。',
    descEn: 'Whole grain fiber for the spleen — boil or microwave in minutes, budget-friendly.',
    image: 'https://images.unsplash.com/photo-1551754655-1902da39a858?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_grain'],
    benefitIds: ['ben_spleen', 'ben_weight', 'ben_damp'],
    recipeIds: ['rec_staple', 'rec_breakfast', 'rec_quick'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '五谷杂粮', en: 'Grains' },
      { zh: '健脾', en: 'Spleen' },
      { zh: '快手', en: 'Quick' },
    ],
  },
  {
    id: 'napa-cabbage',
    nameZh: '大白菜', nameEn: 'Napa cabbage',
    descZh: '清甜润燥，快炒或上汤，少油也好吃。',
    descEn: 'Mild and hydrating — quick stir-fry or light broth with minimal oil.',
    image: 'https://images.unsplash.com/photo-1628773822500-88138a3aa6a2?auto=format&fit=crop&w=600&q=75',
    ingredientIds: ['ing_leaf'],
    benefitIds: ['ben_lung', 'ben_heat', 'ben_weight'],
    recipeIds: ['rec_home', 'rec_quick', 'rec_soup'],
    bodyNoteZh: '适合偏寒体质', bodyNoteEn: 'Cool-leaning friendly',
    displayTags: [
      { zh: '绿叶菜', en: 'Leafy greens' },
      { zh: '润肺', en: 'Lung' },
      { zh: '低脂', en: 'Low-fat' },
      { zh: '快手', en: 'Quick' },
    ],
  },
]

export const DIET_FOODS = DIET_FOODS_BASE.map(mergeFoodDetailRow)

export function getDietFoodById(id) {
  return DIET_FOODS.find((f) => f.id === id) ?? null
}

export function foodMatchesFilters(food, activeFilterIds) {
  if (!activeFilterIds.size) return true
  const ids = [...activeFilterIds]
  const ing = ids.filter((id) => id.startsWith('ing_'))
  const ben = ids.filter((id) => id.startsWith('ben_'))
  const rec = ids.filter((id) => id.startsWith('rec_'))
  const okIng = ing.length === 0 || ing.some((id) => food.ingredientIds.includes(id))
  const okBen = ben.length === 0 || ben.some((id) => food.benefitIds.includes(id))
  const okRec = rec.length === 0 || rec.some((id) => food.recipeIds.includes(id))
  return okIng && okBen && okRec
}
