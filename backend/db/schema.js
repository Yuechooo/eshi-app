import { db } from './database.js';

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      unit TEXT DEFAULT 'pcs',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meal_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT,
      body_condition TEXT,
      seasonal_need TEXT,
      health_goal TEXT,
      birth_year INTEGER,
      dietary_preference TEXT,
      allergies TEXT,
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_meals_day ON meals(day_of_week);
    CREATE INDEX IF NOT EXISTS idx_meal_ingredients_meal ON meal_ingredients(meal_id);
    CREATE INDEX IF NOT EXISTS idx_meal_ingredients_ingredient ON meal_ingredients(ingredient_id);
  `);

  try { db.exec(`ALTER TABLE profile ADD COLUMN birth_year INTEGER`); } catch (_) {}
  try { db.exec(`ALTER TABLE profile ADD COLUMN dietary_preference TEXT`); } catch (_) {}
  try { db.exec(`ALTER TABLE profile ADD COLUMN allergies TEXT`); } catch (_) {}
  try { db.exec(`ALTER TABLE profile ADD COLUMN notes TEXT`); } catch (_) {}
  try { db.exec(`ALTER TABLE profile ADD COLUMN busy_days TEXT`); } catch (_) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS grocery_overrides (
      ingredient_id INTEGER PRIMARY KEY,
      quantity REAL NOT NULL,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    )
  `);
}
