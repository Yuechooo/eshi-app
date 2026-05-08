import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

const PROFILE_COLS = 'display_name, body_condition, seasonal_need, health_goal, birth_year, dietary_preference, allergies, notes, busy_days';

const DEFAULT_PROFILE = {
  display_name: '', body_condition: '', seasonal_need: '', health_goal: '',
  birth_year: null, dietary_preference: '', allergies: '', notes: '', busy_days: ''
};

router.get('/', (req, res) => {
  try {
    let row;
    try {
      row = db.prepare(`SELECT ${PROFILE_COLS} FROM profile WHERE id = 1`).get();
    } catch (e) {
      row = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    }
    if (!row) return res.json({ ...DEFAULT_PROFILE });
    const by = row.birth_year != null ? Math.floor(Number(row.birth_year)) : null
    res.json({
      display_name: row.display_name ?? '',
      body_condition: row.body_condition ?? '',
      seasonal_need: row.seasonal_need ?? '',
      health_goal: row.health_goal ?? '',
      birth_year: (by >= 1900 && by <= 2100) ? by : null,
      dietary_preference: row.dietary_preference ?? '',
      allergies: row.allergies ?? '',
      notes: row.notes ?? '',
      busy_days: row.busy_days ?? ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const body = req.body || {};
    const {
      display_name = '',
      body_condition = '',
      seasonal_need = '',
      health_goal = '',
      birth_year,
      dietary_preference = '',
      allergies = '',
      notes = '',
      busy_days = ''
    } = body;
    let by = null;
    if (birth_year != null && birth_year !== '') {
      const n = Number(birth_year);
      if (!isNaN(n) && n >= 1900 && n <= 2100) by = Math.floor(n);
    }
    const vals = [display_name || null, body_condition || null, seasonal_need || null, health_goal || null, by, dietary_preference || null, allergies || null, notes || null, busy_days || null];

    const exists = db.prepare('SELECT 1 FROM profile WHERE id = 1').get();
    if (exists) {
      db.prepare(`
        UPDATE profile SET
          display_name = ?, body_condition = ?, seasonal_need = ?, health_goal = ?,
          birth_year = ?, dietary_preference = ?, allergies = ?, notes = ?, busy_days = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).run(...vals);
    } else {
      db.prepare(`
        INSERT INTO profile (id, display_name, body_condition, seasonal_need, health_goal, birth_year, dietary_preference, allergies, notes, busy_days, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(...vals);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[Profile PUT]', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', (req, res) => {
  try {
    const exists = db.prepare('SELECT 1 FROM profile WHERE id = 1').get();
    if (exists) {
      db.prepare(`
        UPDATE profile SET
          display_name = NULL, body_condition = NULL, seasonal_need = NULL, health_goal = NULL,
          birth_year = NULL, dietary_preference = NULL, allergies = NULL, notes = NULL, busy_days = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).run();
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[Profile DELETE]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
