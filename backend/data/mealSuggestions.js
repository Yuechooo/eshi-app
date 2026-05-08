/**
 * Meal suggestions for auto-generation.
 * Busy day meals: simple, fast (≤15 min)
 * Free day meals: nourishing, can be slow-cooked
 * Ingredients by English name – resolved to IDs at runtime
 * Metadata: hasDairy, hasGreens, nourishing, cooling – for profile-based filtering
 */

const DAIRY_INGREDIENTS = ['milk', 'cheese', 'butter', 'yogurt'];
const COOLING_INGREDIENTS = ['bananas', 'lemons', 'yogurt', 'spinach', 'lettuce'];
const GREEN_INGREDIENTS = ['spinach', 'broccoli', 'lettuce', 'greens'];
const NOURISHING_INGREDIENTS = ['chicken broth', 'bone broth', 'eggs', 'potatoes', 'rice'];

const tagMeal = (meal) => {
  const ingNames = meal.ingredients.map(i => i.name.toLowerCase());
  return {
    ...meal,
    hasDairy: ingNames.some(n => DAIRY_INGREDIENTS.some(d => n.includes(d) || d.includes(n))),
    hasGreens: ingNames.some(n => GREEN_INGREDIENTS.some(g => n.includes(g) || g.includes(n))),
    nourishing: ingNames.some(n => NOURISHING_INGREDIENTS.some(x => n.includes(x) || x.includes(n))),
    cooling: ingNames.some(n => COOLING_INGREDIENTS.some(c => n.includes(c) || c.includes(n))),
  };
};

const BUSY_MEALS = [
  { name: 'Rice porridge + Banana', meal_type: 'breakfast', ingredients: [{ name: 'Rice', qty: 0.5, unit: 'cup' }, { name: 'Bananas', qty: 1, unit: 'pcs' }] },
  { name: 'Toast + Eggs', meal_type: 'breakfast', ingredients: [{ name: 'Bread', qty: 2, unit: 'pcs' }, { name: 'Eggs', qty: 2, unit: 'pcs' }] },
  { name: 'Yogurt + Fruit', meal_type: 'breakfast', ingredients: [{ name: 'Yogurt', qty: 1, unit: 'container' }, { name: 'Apples', qty: 1, unit: 'pcs' }] },
  { name: 'Scrambled Eggs + Spinach', meal_type: 'breakfast', ingredients: [{ name: 'Eggs', qty: 2, unit: 'pcs' }, { name: 'Spinach', qty: 1, unit: 'handful' }] },
  { name: 'Quick Stir-fry Chicken', meal_type: 'lunch', ingredients: [{ name: 'Chicken breast', qty: 0.5, unit: 'lbs' }, { name: 'Broccoli', qty: 1, unit: 'bunch' }] },
  { name: 'Pasta with Butter', meal_type: 'lunch', ingredients: [{ name: 'Pasta', qty: 1, unit: 'serving' }, { name: 'Butter', qty: 1, unit: 'tbsp' }] },
  { name: 'Rice + Egg', meal_type: 'lunch', ingredients: [{ name: 'Rice', qty: 1, unit: 'cup' }, { name: 'Eggs', qty: 1, unit: 'pcs' }] },
  { name: 'Sandwich + Salad', meal_type: 'lunch', ingredients: [{ name: 'Bread', qty: 2, unit: 'pcs' }, { name: 'Lettuce', qty: 0.5, unit: 'head' }, { name: 'Tomatoes', qty: 1, unit: 'pcs' }] },
  { name: 'Grilled Chicken Salad', meal_type: 'dinner', ingredients: [{ name: 'Chicken breast', qty: 0.5, unit: 'lbs' }, { name: 'Lettuce', qty: 0.5, unit: 'head' }] },
  { name: 'Rice + Stir-fry Veggies', meal_type: 'dinner', ingredients: [{ name: 'Rice', qty: 1, unit: 'cup' }, { name: 'Broccoli', qty: 0.5, unit: 'bunch' }, { name: 'Carrots', qty: 0.5, unit: 'lbs' }] },
  { name: 'Omelette with Veggies', meal_type: 'dinner', ingredients: [{ name: 'Eggs', qty: 3, unit: 'pcs' }, { name: 'Spinach', qty: 1, unit: 'handful' }, { name: 'Tomatoes', qty: 0.5, unit: 'pcs' }] },
].map(tagMeal)

const FREE_MEALS = [
  { name: 'Congee with Egg', meal_type: 'breakfast', ingredients: [{ name: 'Rice', qty: 0.5, unit: 'cup' }, { name: 'Eggs', qty: 1, unit: 'pcs' }] },
  { name: 'Rice Porridge + Spinach', meal_type: 'breakfast', ingredients: [{ name: 'Rice', qty: 0.5, unit: 'cup' }, { name: 'Spinach', qty: 1, unit: 'bag' }] },
  { name: 'Steamed Egg', meal_type: 'breakfast', ingredients: [{ name: 'Eggs', qty: 2, unit: 'pcs' }, { name: 'Chicken broth', qty: 0.5, unit: 'cup' }] },
  { name: 'Braised Chicken + Vegetables', meal_type: 'lunch', ingredients: [{ name: 'Chicken breast', qty: 0.5, unit: 'lbs' }, { name: 'Carrots', qty: 0.5, unit: 'lbs' }, { name: 'Potatoes', qty: 0.5, unit: 'lbs' }] },
  { name: 'Rice + Bone Broth Soup', meal_type: 'lunch', ingredients: [{ name: 'Rice', qty: 1, unit: 'cup' }, { name: 'Chicken broth', qty: 2, unit: 'cup' }, { name: 'Spinach', qty: 0.5, unit: 'bag' }] },
  { name: 'Steamed Fish + Greens', meal_type: 'lunch', ingredients: [{ name: 'Rice', qty: 1, unit: 'cup' }, { name: 'Broccoli', qty: 1, unit: 'bunch' }, { name: 'Garlic', qty: 0.5, unit: 'head' }] },
  { name: 'Yam Rib Soup', meal_type: 'dinner', ingredients: [{ name: 'Chicken broth', qty: 1, unit: 'box' }, { name: 'Potatoes', qty: 0.5, unit: 'lbs' }, { name: 'Carrots', qty: 0.5, unit: 'lbs' }] },
  { name: 'Braised Beef with Root Vegetables', meal_type: 'dinner', ingredients: [{ name: 'Ground beef', qty: 0.5, unit: 'lbs' }, { name: 'Carrots', qty: 0.5, unit: 'lbs' }, { name: 'Potatoes', qty: 0.5, unit: 'lbs' }, { name: 'Onions', qty: 0.5, unit: 'pcs' }] },
  { name: 'Congee with Vegetables', meal_type: 'dinner', ingredients: [{ name: 'Rice', qty: 0.5, unit: 'cup' }, { name: 'Spinach', qty: 0.5, unit: 'bag' }, { name: 'Carrots', qty: 0.25, unit: 'lbs' }] },
  { name: 'Pumpkin Porridge', meal_type: 'dinner', ingredients: [{ name: 'Rice', qty: 0.5, unit: 'cup' }, { name: 'Canned beans', qty: 0.5, unit: 'can' }] },
].map(tagMeal)

function pickRandom(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function getMealsForDay(isBusy, mealType) {
  const pool = isBusy ? BUSY_MEALS : FREE_MEALS
  const options = pool.filter(m => m.meal_type === mealType)
  if (options.length === 0) return null
  return options[Math.floor(Math.random() * options.length)]
}

export function filterByAllergies(meals, allergyKeywords) {
  if (!allergyKeywords || allergyKeywords.length === 0) return meals
  const lower = allergyKeywords.map(a => String(a).toLowerCase().trim()).filter(Boolean)
  if (lower.length === 0) return meals
  return meals.filter(m => {
    const ingNames = m.ingredients.map(i => i.name.toLowerCase())
    const hasAllergen = ingNames.some(n => lower.some(a => n.includes(a) || a.includes(n)))
    return !hasAllergen
  })
}

export function filterByDietaryPreference(meals, pref) {
  if (!pref || typeof pref !== 'string') return meals
  const p = pref.toLowerCase().trim()
  if (p.includes('dairy') || p.includes('no dairy') || p.includes('dairy-free')) {
    return meals.filter(m => !m.hasDairy)
  }
  if (p.includes('vegetarian') || p.includes('vegan')) {
    return meals.filter(m => !m.ingredients.some(i => ['chicken', 'beef', 'fish', 'meat'].some(x => i.name.toLowerCase().includes(x))))
  }
  return meals
}

export function filterByBodyCondition(meals, condition) {
  if (!condition || typeof condition !== 'string') return meals
  const c = condition.toLowerCase()
  if (c.includes('warm') || c.includes('heat') || c.includes('fire')) {
    return meals.filter(m => !m.cooling)
  }
  if (c.includes('cool') || c.includes('deficient')) {
    return meals.filter(m => m.nourishing || !m.cooling)
  }
  return meals
}

export function filterBySeasonalNeed(meals, seasonal) {
  if (!seasonal || typeof seasonal !== 'string') return meals
  const s = seasonal.toLowerCase()
  if (s.includes('spring') || s.includes('liver')) {
    return meals.filter(m => m.hasGreens || m.nourishing)
  }
  if (s.includes('winter') || s.includes('kidney')) {
    return meals.filter(m => m.nourishing)
  }
  return meals
}

export function filterByHealthGoal(meals, goal) {
  if (!goal || typeof goal !== 'string') return meals
  const g = goal.toLowerCase()
  if (g.includes('immunity') || g.includes('energy') || g.includes('vitality')) {
    return meals.filter(m => m.nourishing)
  }
  if (g.includes('weight') || g.includes('light')) {
    return meals.filter(m => m.hasGreens || !m.ingredients.some(i => ['butter', 'cheese'].some(x => i.name.toLowerCase().includes(x))))
  }
  return meals
}

export { BUSY_MEALS, FREE_MEALS }
