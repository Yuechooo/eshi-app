import { Router } from 'express';
import { generateAndSaveMealPlan } from '../services/mealPlanGenerator.js';

const router = Router();

/**
 * POST /api/meal-plan/generate
 * Generate a weekly meal plan from profile + busy days, save to DB, return created meals.
 */
router.post('/generate', (req, res) => {
  try {
    const result = generateAndSaveMealPlan();
    res.json(result);
  } catch (err) {
    console.error('[Meal plan generate]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
