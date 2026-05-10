import { Router } from 'express';
import { generateAndSaveMealPlan } from '../services/mealPlanGenerator.js';
import { generateWithAI } from '../services/aiMealPlanGenerator.js';

const router = Router();

router.post('/generate', (req, res) => {
  try {
    const result = generateAndSaveMealPlan();
    res.json(result);
  } catch (err) {
    console.error('[Meal plan generate]', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-ai', async (req, res) => {
  try {
    const result = await generateWithAI();
    res.json(result);
  } catch (err) {
    console.error('[Meal plan AI generate]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
