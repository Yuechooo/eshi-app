import { db } from '../db/database.js';

const defaultIngredients = [
  { name: 'Chicken breast', category: 'Proteins', unit: 'lbs' },
  { name: 'Ground beef', category: 'Proteins', unit: 'lbs' },
  { name: 'Eggs', category: 'Proteins', unit: 'dozen' },
  { name: 'Milk', category: 'Dairy', unit: 'gallon' },
  { name: 'Cheese', category: 'Dairy', unit: 'oz' },
  { name: 'Butter', category: 'Dairy', unit: 'sticks' },
  { name: 'Yogurt', category: 'Dairy', unit: 'container' },
  { name: 'Bread', category: 'Bakery', unit: 'loaf' },
  { name: 'Rice', category: 'Grains', unit: 'lbs' },
  { name: 'Pasta', category: 'Grains', unit: 'box' },
  { name: 'Flour', category: 'Grains', unit: 'lbs' },
  { name: 'Broccoli', category: 'Vegetables', unit: 'bunch' },
  { name: 'Carrots', category: 'Vegetables', unit: 'lbs' },
  { name: 'Lettuce', category: 'Vegetables', unit: 'head' },
  { name: 'Tomatoes', category: 'Vegetables', unit: 'lbs' },
  { name: 'Onions', category: 'Vegetables', unit: 'lbs' },
  { name: 'Garlic', category: 'Vegetables', unit: 'head' },
  { name: 'Potatoes', category: 'Vegetables', unit: 'lbs' },
  { name: 'Spinach', category: 'Vegetables', unit: 'bag' },
  { name: 'Apples', category: 'Fruits', unit: 'lbs' },
  { name: 'Bananas', category: 'Fruits', unit: 'bunch' },
  { name: 'Lemons', category: 'Fruits', unit: 'pcs' },
  { name: 'Olive oil', category: 'Pantry', unit: 'bottle' },
  { name: 'Salt', category: 'Pantry', unit: 'container' },
  { name: 'Black pepper', category: 'Pantry', unit: 'container' },
  { name: 'Soy sauce', category: 'Pantry', unit: 'bottle' },
  { name: 'Canned beans', category: 'Pantry', unit: 'can' },
  { name: 'Chicken broth', category: 'Pantry', unit: 'box' },
];

export function seedIngredients() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO ingredients (name, category, unit) VALUES (@name, @category, @unit)
  `);
  const insertMany = db.transaction((ingredients) => {
    for (const ing of ingredients) {
      insert.run(ing);
    }
  });
  insertMany(defaultIngredients);
}
