import { initSchema } from '../db/schema.js';
import { seedIngredients } from './seedIngredients.js';

initSchema();
seedIngredients();
console.log('Database initialized successfully.');
