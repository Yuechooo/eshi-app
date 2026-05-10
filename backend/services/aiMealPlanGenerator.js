import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/database.js';
import { getProfile } from './mealPlanGenerator.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const VALID_TAGS = [
  'warming', 'cooling', 'quick', 'nourishing', 'protein-rich',
  'light', 'digestion-friendly', 'seasonal', 'low-oil',
  'busy-day', 'fatigue-support', 'workout-support',
];

export async function generateWithAI() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to backend/.env to enable AI generation.');
  }

  const client = new Anthropic({ apiKey });
  const profile = getProfile();

  const ingredients = db.prepare('SELECT name FROM ingredients ORDER BY name').all();
  const ingredientNames = ingredients.map(i => i.name);

  const busyDays = (profile?.busy_days || '')
    .split(/[,，;\s]+/)
    .map(d => d.trim().toLowerCase())
    .filter(d => DAYS.includes(d));

  const scheduleIntensity = profile?.schedule_intensity || 'moderate';

  let dailyContext = {};
  try { dailyContext = JSON.parse(profile?.daily_context || '{}'); } catch (_) {}

  const profileLines = [
    `Body condition: ${profile.body_condition || 'not specified'}`,
    `Seasonal focus: ${profile.seasonal_need || 'not specified'}`,
    `Health goals: ${profile.health_goal || 'not specified'}`,
    `Dietary preference: ${profile.dietary_preference || 'none'}`,
    `Allergies/avoid: ${profile.allergies || 'none'}`,
    `Weekly schedule: ${scheduleIntensity}`,
    busyDays.length ? `Busy days: ${busyDays.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  const dailyContextLines = DAYS.map(d => {
    const tags = dailyContext[d] || [];
    const isBusy = busyDays.includes(d);
    const allTags = [...(isBusy ? ['busy'] : []), ...tags];
    return allTags.length ? `  ${d}: ${allTags.join(', ')}` : null;
  }).filter(Boolean);

  const userPrompt = `Create a 7-day meal plan (breakfast, lunch, dinner each day) for this user.

USER PROFILE:
${profileLines}
${dailyContextLines.length ? `\nDAILY CONTEXT:\n${dailyContextLines.join('\n')}` : ''}

PANTRY: ${ingredientNames.join(', ') || 'common pantry staples'}

RULES:
- Strictly respect allergies and dietary preferences
- Busy/heavy-schedule days: ≤3 ingredients, ≤20 min, easy difficulty
- Low-energy days: warm, easily digestible, comforting meals
- Workout days: higher protein
- Light-schedule days: allow slow-cooked nourishing meals
- Use pantry ingredients when possible; freely add new ones
- why_recommended: one sentence connecting the meal to the user's profile/day context
- tags: 1–3 from [${VALID_TAGS.join(', ')}]
- cooking_time: integer minutes
- difficulty: "easy", "medium", or "hard"
- plan_summary: 2–3 sentences explaining the overall strategy`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: 'You are an expert TCM-informed meal planner. You create practical, personalized weekly meal plans that blend Traditional Chinese Medicine principles with modern nutrition. Always follow dietary restrictions strictly.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [
      {
        name: 'save_meal_plan',
        description: 'Save the complete weekly meal plan with metadata and a brief overall summary.',
        input_schema: {
          type: 'object',
          required: ['meals', 'plan_summary'],
          properties: {
            plan_summary: {
              type: 'string',
              description: '2–3 sentences explaining the overall meal strategy based on the user profile.',
            },
            meals: {
              type: 'array',
              description: 'Exactly 21 meals: 7 days × 3 meal types.',
              items: {
                type: 'object',
                required: ['day_of_week', 'meal_type', 'name', 'ingredients', 'cooking_time', 'difficulty', 'tags', 'why_recommended'],
                properties: {
                  day_of_week: { type: 'string', enum: DAYS },
                  meal_type: { type: 'string', enum: MEAL_TYPES },
                  name: { type: 'string' },
                  notes: { type: 'string' },
                  cooking_time: { type: 'integer', minimum: 5, maximum: 90 },
                  difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                  tags: { type: 'array', items: { type: 'string' }, maxItems: 3 },
                  why_recommended: { type: 'string' },
                  ingredients: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 6,
                    items: {
                      type: 'object',
                      required: ['name', 'quantity'],
                      properties: {
                        name: { type: 'string' },
                        quantity: { type: 'number' },
                        unit: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'save_meal_plan' },
    messages: [{ role: 'user', content: userPrompt }],
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('AI did not return a valid meal plan. Please try again.');

  const { meals, plan_summary } = toolUse.input;
  const result = saveMealsToDb(meals);
  return { ...result, plan_summary };
}

function saveMealsToDb(aiMeals) {
  const getIngredient = db.prepare('SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)');
  const insertIngredient = db.prepare(
    "INSERT OR IGNORE INTO ingredients (name, category, unit) VALUES (?, 'Other', ?)"
  );
  const insertMeal = db.prepare(
    'INSERT INTO meals (name, day_of_week, meal_type, notes, cooking_time, difficulty, tags, why_recommended) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertIng = db.prepare(
    'INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)'
  );
  const deleteAll = db.prepare('DELETE FROM meals');

  const created = [];

  db.transaction(() => {
    deleteAll.run();
    for (const meal of aiMeals) {
      const r = insertMeal.run(
        meal.name,
        meal.day_of_week,
        meal.meal_type,
        meal.notes || null,
        meal.cooking_time || null,
        meal.difficulty || null,
        JSON.stringify(meal.tags || []),
        meal.why_recommended || null
      );
      const mealId = r.lastInsertRowid;

      for (const ing of (meal.ingredients || [])) {
        let row = getIngredient.get(ing.name);
        if (!row) {
          insertIngredient.run(ing.name, ing.unit || null);
          row = getIngredient.get(ing.name);
        }
        if (row) {
          insertIng.run(mealId, row.id, ing.quantity || 1, ing.unit || null);
        }
      }

      created.push({
        id: mealId,
        name: meal.name,
        day_of_week: meal.day_of_week,
        meal_type: meal.meal_type,
      });
    }
  })();

  return { success: true, created };
}
