import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

router.get('/', (req, res) => {
  try {
    const meals = db.prepare(`
      SELECT m.*, GROUP_CONCAT(
        json_object('ingredient_id', mi.ingredient_id, 'quantity', mi.quantity, 'unit', COALESCE(mi.unit, i.unit), 'ingredient_name', i.name)
      ) as ingredients_json
      FROM meals m
      LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id
      LEFT JOIN ingredients i ON mi.ingredient_id = i.id
      GROUP BY m.id
      ORDER BY 
        CASE m.day_of_week 
          WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3 
          WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6 
          WHEN 'sunday' THEN 7 ELSE 8 END,
        CASE m.meal_type 
          WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'dinner' THEN 3 
          WHEN 'snack' THEN 4 ELSE 5 END
    `).all();
    const parsed = meals.map(m => ({
      ...m,
      ingredients: m.ingredients_json ? JSON.parse('[' + m.ingredients_json + ']') : [],
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, day_of_week, meal_type, notes, ingredients = [] } = req.body;
    if (!name || !day_of_week || !meal_type) {
      return res.status(400).json({ error: 'Name, day_of_week, and meal_type required' });
    }
    if (!DAYS.includes(day_of_week.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid day_of_week' });
    }
    if (!MEAL_TYPES.includes(meal_type.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid meal_type' });
    }

    const insertMeal = db.prepare(`
      INSERT INTO meals (name, day_of_week, meal_type, notes) VALUES (?, ?, ?, ?)
    `);
    const insertIng = db.prepare(`
      INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)
    `);

    const run = db.transaction(() => {
      const mealResult = insertMeal.run(name.trim(), day_of_week.toLowerCase(), meal_type.toLowerCase(), notes || null);
      const mealId = mealResult.lastInsertRowid;
      for (const { ingredient_id, quantity = 1, unit } of ingredients) {
        if (ingredient_id) insertIng.run(mealId, ingredient_id, quantity, unit || null);
      }
      return mealId;
    });

    const mealId = run();
    res.status(201).json({ id: mealId, name, day_of_week, meal_type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, day_of_week, meal_type, notes, ingredients = [] } = req.body;
    const mealId = parseInt(req.params.id, 10);
    if (!name || !day_of_week || !meal_type) {
      return res.status(400).json({ error: 'Name, day_of_week, and meal_type required' });
    }
    if (!DAYS.includes(day_of_week.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid day_of_week' });
    }
    if (!MEAL_TYPES.includes(meal_type.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid meal_type' });
    }

    const updateMeal = db.prepare('UPDATE meals SET name = ?, day_of_week = ?, meal_type = ?, notes = ? WHERE id = ?');
    const deleteIngs = db.prepare('DELETE FROM meal_ingredients WHERE meal_id = ?');
    const insertIng = db.prepare('INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');

    db.transaction(() => {
      const r = updateMeal.run(name.trim(), day_of_week.toLowerCase(), meal_type.toLowerCase(), notes || null, mealId);
      if (r.changes === 0) throw new Error('Meal not found');
      deleteIngs.run(mealId);
      for (const { ingredient_id, quantity = 1, unit } of ingredients) {
        if (ingredient_id) insertIng.run(mealId, ingredient_id, quantity, unit || null);
      }
    })();
    res.json({ success: true });
  } catch (err) {
    res.status(err.message === 'Meal not found' ? 404 : 500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Meal not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
