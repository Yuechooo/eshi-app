import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MealPlanPage from './pages/MealPlanPage'
import GroceryListPage from './pages/GroceryListPage'
import DietPage from './pages/DietPage'
import DietFoodDetailPage from './pages/DietFoodDetailPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="meal-plan" element={<MealPlanPage />} />
          <Route path="diet" element={<DietPage />} />
          <Route path="diet/:foodId" element={<DietFoodDetailPage />} />
          <Route path="grocery" element={<GroceryListPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  )
}
