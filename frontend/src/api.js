const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function getIngredients() {
  const res = await fetch(`${API}/ingredients`);
  if (!res.ok) throw new Error('Failed to fetch ingredients');
  return res.json();
}

export async function addIngredient(data) {
  const res = await fetch(`${API}/ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add ingredient');
  }
  return res.json();
}

export async function getMeals() {
  const res = await fetch(`${API}/meals`);
  if (!res.ok) throw new Error('Failed to fetch meals');
  return res.json();
}

export async function addMeal(data) {
  const res = await fetch(`${API}/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add meal');
  }
  return res.json();
}

export async function deleteMeal(id) {
  const res = await fetch(`${API}/meals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete meal');
  return res.json();
}

export async function updateMeal(id, data) {
  const res = await fetch(`${API}/meals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update meal');
  }
  return res.json();
}

export async function generateMealPlan() {
  try {
    const res = await fetch(`${API}/meal-plan/generate`, { method: 'POST' });
    const err = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(err.error || `Failed to generate meal plan (${res.status})`);
    }
    return err;
  } catch (e) {
    if (e.message.startsWith('Failed to generate') || e.message.startsWith('Cannot connect')) throw e;
    throw new Error('Cannot connect to backend. Please run npm run dev and ensure the server starts.');
  }
}

export async function getGroceryList() {
  const res = await fetch(`${API}/grocery`);
  if (!res.ok) throw new Error('Failed to fetch grocery list');
  return res.json();
}

export async function setGroceryOverride(ingredientId, quantity) {
  const res = await fetch(`${API}/grocery/override`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredient_id: ingredientId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to update quantity');
  return res.json();
}

export async function clearGroceryOverride(ingredientId) {
  const res = await fetch(`${API}/grocery/override/${ingredientId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear override');
  return res.json();
}

export async function deleteProfile() {
  const res = await fetch(`${API}/profile`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to delete profile');
  }
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API}/profile`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${API}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error || (res.status === 404 ? 'Backend not found. Is the server running?' : 'Something didn\'t save. Please try again.');
    throw new Error(msg);
  }
  return res.json();
}
