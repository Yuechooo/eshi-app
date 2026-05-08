import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

const getOverrides = () => {
  const rows = db.prepare('SELECT ingredient_id, quantity FROM grocery_overrides').all();
  return Object.fromEntries(rows.map(r => [r.ingredient_id, r.quantity]));
};

router.get('/', (req, res) => {
  try {
    const overrides = getOverrides();
    const rows = db.prepare(`
      SELECT 
        i.id, i.name, i.category, i.unit,
        SUM(mi.quantity) as total_quantity,
        COALESCE(mi.unit, i.unit) as display_unit
      FROM meal_ingredients mi
      JOIN ingredients i ON mi.ingredient_id = i.id
      JOIN meals m ON mi.meal_id = m.id
      GROUP BY i.id, COALESCE(mi.unit, i.unit)
      ORDER BY i.category, i.name
    `).all();

    const grouped = rows.reduce((acc, row) => {
      const key = row.category;
      if (!acc[key]) acc[key] = [];
      const qty = overrides[row.id] != null ? overrides[row.id] : row.total_quantity;
      acc[key].push({
        id: row.id,
        name: row.name,
        quantity: qty,
        unit: row.display_unit || 'pcs',
        overridden: overrides[row.id] != null,
      });
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/override', (req, res) => {
  try {
    const { ingredient_id, quantity } = req.body;
    if (ingredient_id == null || quantity == null || quantity < 0) {
      return res.status(400).json({ error: 'ingredient_id and non-negative quantity required' });
    }
    const upsert = db.prepare(`
      INSERT INTO grocery_overrides (ingredient_id, quantity) VALUES (?, ?)
      ON CONFLICT(ingredient_id) DO UPDATE SET quantity = excluded.quantity
    `);
    upsert.run(parseInt(ingredient_id, 10), parseFloat(quantity));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/override/:ingredientId', (req, res) => {
  try {
    const ingredientId = parseInt(req.params.ingredientId, 10);
    db.prepare('DELETE FROM grocery_overrides WHERE ingredient_id = ?').run(ingredientId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
