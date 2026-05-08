/**
 * Meal plan generation service.
 * Reads profile + busy_days (calendar), applies rule-based logic, saves to DB.
 */

import { db } from '../db/database.js';
import {
  BUSY_MEALS,
  FREE_MEALS,
  filterByAllergies,
  filterByDietaryPreference,
  filterByBodyCondition,
  filterBySeasonalNeed,
  filterByHealthGoal,
} from '../data/mealSuggestions.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

/**
 * Read the current user's profile from the database.
 */
export function getProfile() {
  const row = db.prepare(`
    SELECT birth_year, body_condition, seasonal_need, health_goal,
           dietary_preference, allergies, notes, busy_days
    FROM profile WHERE id = 1
  `).get();
  return row || {};
}

/**
 * Determine busy days from profile.busy_days (comma-separated).
 * Future: could read from calendar_events table.
 */
export function getBusyDaysForWeek(profile) {
  const raw = (profile?.busy_days || '').split(/[,，;\s]+/)
    .map(d => d.trim().toLowerCase())
    .filter(Boolean);
  return raw;
}

/**
 * Apply all profile-based filters to a meal pool.
 */
function applyProfileFilters(pool, profile) {
  let filtered = [...pool];
  const allergyKeywords = (profile?.allergies || '').split(/[,，;\s]+/).map(a => a.trim()).filter(Boolean);
  if (allergyKeywords.length > 0) {
    filtered = filterByAllergies(filtered, allergyKeywords);
  }
  filtered = filterByDietaryPreference(filtered, profile?.dietary_preference);
  filtered = filterByBodyCondition(filtered, profile?.body_condition);
  filtered = filterBySeasonalNeed(filtered, profile?.seasonal_need);
  filtered = filterByHealthGoal(filtered, profile?.health_goal);
  return filtered;
}

/**
 * Resolve ingredient name to DB id.
 */
function resolveIngredientIds(meal, getIngredientByName) {
  return meal.ingredients
    .map(i => ({ ...i, id: getIngredientByName(i.name) }))
    .filter(i => i.id != null);
}

/**
 * Pick a meal from the filtered pool. Falls back to less filtered options if empty.
 */
function pickMeal(isBusy, mealType, profile, getIngredientByName) {
  const basePool = (isBusy ? BUSY_MEALS : FREE_MEALS).filter(m => m.meal_type === mealType);
  if (basePool.length === 0) return null;

  let filtered = applyProfileFilters(basePool, profile);
  if (filtered.length === 0) filtered = basePool;

  const meal = filtered[Math.floor(Math.random() * filtered.length)];
  const resolved = resolveIngredientIds(meal, getIngredientByName);
  if (resolved.length === 0) return null;

  return { meal, resolved };
}

/**
 * Generate and save a weekly meal plan.
 */
export function generateAndSaveMealPlan() {
  const profile = getProfile();
  const busyDays = getBusyDaysForWeek(profile);
  const getIngredient = db.prepare('SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)');
  const getIngredientByName = (name) => getIngredient.get(name)?.id;

  const insertMeal = db.prepare('INSERT INTO meals (name, day_of_week, meal_type, notes) VALUES (?, ?, ?, ?)');
  const insertIng = db.prepare('INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');
  const deleteAll = db.prepare('DELETE FROM meals');

  const created = [];

  db.transaction(() => {
    deleteAll.run();
    for (const day of DAYS) {
      const isBusy = busyDays.includes(day);
      for (const mt of MEAL_TYPES) {
        const picked = pickMeal(isBusy, mt, profile, getIngredientByName);
        if (!picked) continue;
        const { meal, resolved } = picked;
        const r = insertMeal.run(meal.name, day, mt, null);
        const mealId = r.lastInsertRowid;
        for (const ing of resolved) {
          insertIng.run(mealId, ing.id, ing.qty || 1, ing.unit || null);
        }
        created.push({ id: mealId, name: meal.name, day_of_week: day, meal_type: mt });
      }
    }
  })();

  return { success: true, created };
}
