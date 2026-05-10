import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import ingredientsRouter from './routes/ingredients.js';
import mealsRouter from './routes/meals.js';
import mealPlanRouter from './routes/mealPlan.js';
import groceryRouter from './routes/grocery.js';
import profileRouter from './routes/profile.js';
import { initSchema } from './db/schema.js';
import { seedIngredients } from './scripts/seedIngredients.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
initSchema();
seedIngredients();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/ingredients', ingredientsRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/meal-plan', mealPlanRouter);
app.use('/api/grocery', groceryRouter);
app.use('/api/profile', profileRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
