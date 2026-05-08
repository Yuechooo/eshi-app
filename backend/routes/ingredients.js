import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const ingredients = db.prepare(`
      SELECT id, name, category, unit FROM ingredients ORDER BY category, name
    `).all();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT DISTINCT category FROM ingredients ORDER BY category
    `).all();
    res.json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, category, unit = 'pcs' } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category required' });
    }
    const result = db.prepare(`
      INSERT INTO ingredients (name, category, unit) VALUES (?, ?, ?)
    `).run(name.trim(), category.trim(), unit.trim());
    res.status(201).json({ id: result.lastInsertRowid, name, category, unit });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ingredient already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
