# Eshi / 依食

A full-stack web app for weekly grocery planning. Plan your meals, add ingredients, and get an auto-generated grocery list.

## Features

- **Weekly meal plan** — Add meals by day and type (breakfast, lunch, dinner, snack)
- **Auto-generated grocery list** — Quantities are aggregated from your meal plan
- **Ingredient database** — Pre-seeded with common items; add your own
- **Simple UI** — Clean React interface with DM Sans typography

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)

## Quick Start

```bash
# Install dependencies and init DB
npm run setup

# Run both backend and frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Project Structure

```
├── backend/
│   ├── db/            # SQLite schema & connection
│   ├── routes/        # API routes (ingredients, meals, grocery, profile)
│   └── scripts/       # DB init & seed
├── frontend/
│   └── src/
│       ├── api.js         # API client
│       ├── components/    # Layout, AddMealForm
│       ├── hooks/        # useLanguage
│       ├── pages/        # Home, MealPlan, GroceryList, Profile
│       └── i18n.js        # Translations (EN / 中文)
└── package.json
```

## Core Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Dashboard with meal count & quick links |
| Meal Plan | `/meal-plan` | Weekly meal planning |
| Grocery List | `/grocery` | Auto-generated from meals |
| Profile | `/profile` | Wellness preferences (body, season, goals) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients` | List all ingredients |
| POST | `/api/ingredients` | Add ingredient |
| GET | `/api/meals` | List all meals |
| POST | `/api/meals` | Add meal with ingredients |
| DELETE | `/api/meals/:id` | Delete meal |
| GET | `/api/grocery` | Get aggregated grocery list |
| GET | `/api/profile` | Get wellness preferences |
| PUT | `/api/profile` | Update wellness preferences |
