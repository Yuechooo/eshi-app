import { useState, useEffect } from 'react'
import { getMeals, getIngredients, addMeal, addIngredient, deleteMeal, updateMeal, generateMealPlan } from '../api'
import { ingredientNamesZh } from '../i18n'
import { useLanguage } from '../hooks/useLanguage'
import AddMealForm from '../components/AddMealForm'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function displayIngredientName(name, lang) {
  if (lang === 'zh' && ingredientNamesZh[name]) return ingredientNamesZh[name]
  return name
}

export default function MealPlanPage() {
  const { t, lang } = useLanguage()
  const [meals, setMeals] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [swapFrom, setSwapFrom] = useState(null)
  const [generating, setGenerating] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mealsData, ingredientsData] = await Promise.all([
        getMeals(),
        getIngredients(),
      ])
      setMeals(mealsData)
      setIngredients(ingredientsData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const handleAdd = async (data) => {
    if (data.id) {
      await updateMeal(data.id, { name: data.name, day_of_week: data.day_of_week, meal_type: data.meal_type, notes: data.notes, ingredients: data.ingredients })
      setEditingMeal(null)
    } else {
      await addMeal(data)
    }
    setShowAddMeal(false)
    refresh()
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      await generateMealPlan()
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const toIngPayload = (ings) => (ings || []).map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity ?? 1, unit: i.unit }))

  const handleSwap = async (mealA, mealB) => {
    await Promise.all([
      updateMeal(mealA.id, { name: mealA.name, day_of_week: mealB.day_of_week, meal_type: mealB.meal_type, notes: mealA.notes, ingredients: toIngPayload(mealA.ingredients) }),
      updateMeal(mealB.id, { name: mealB.name, day_of_week: mealA.day_of_week, meal_type: mealA.meal_type, notes: mealB.notes, ingredients: toIngPayload(mealB.ingredients) }),
    ])
    setSwapFrom(null)
    refresh()
  }

  const handleDelete = async (id) => {
    await deleteMeal(id)
    refresh()
  }

  const byDay = DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  meals.forEach(m => {
    if (byDay[m.day_of_week]) byDay[m.day_of_week].push(m)
  })

  if (loading) return <div className="py-16 text-center text-sm text-muted">{t('loading')}</div>
  if (error) return <div className="py-16 text-center text-sm text-accent">{t('error')}: {error}. {t('errorBackend')}</div>

  return (
    <section className="pb-20 sm:pb-24">
      <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle className="mb-0">{t('weeklyMealPlan')}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleGenerate} disabled={generating}>
            {generating ? t('loading') : t('generateMealPlan')}
          </Button>
          <Button onClick={() => { setEditingMeal(null); setShowAddMeal(true) }}>{t('addMeal')}</Button>
        </div>
      </div>
      <p className="mb-8 max-w-2xl text-xs leading-relaxed text-muted sm:mb-10 sm:text-sm">{t('generateMealPlanHint')}</p>

      {(showAddMeal || editingMeal) && (
        <AddMealForm
          ingredients={ingredients}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddMeal(false); setEditingMeal(null) }}
          showAddIngredient={showAddIngredient}
          setShowAddIngredient={setShowAddIngredient}
          onAddIngredient={addIngredient}
          onIngredientAdded={refresh}
          editMeal={editingMeal}
        />
      )}

      {swapFrom && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-primary/15 bg-primary-soft/80 px-5 py-4 text-sm font-medium text-primary shadow-inner-well">
          <span>{t('swapMealWith')}</span>
          <Button variant="ghost" size="sm" onClick={() => setSwapFrom(null)}>{t('cancelSwap')}</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
        {DAYS.map(day => (
          <Card key={day}>
            <h3 className="mb-4 font-display text-lg font-semibold tracking-tight text-primary">{t(day)}</h3>
            <ul className="m-0 list-none space-y-3 p-0">
              {byDay[day].length === 0 ? (
                <li className="text-sm italic text-muted">{t('noMeals')}</li>
              ) : (
                byDay[day].map(m => (
                  <li key={m.id} className="flex flex-col gap-2 border-b border-border pb-3 text-left last:border-b-0 last:pb-0">
                    <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted">{t(m.meal_type)}</span>
                    <strong className="text-sm font-semibold text-ink">{m.name}</strong>
                    {m.ingredients?.length > 0 && (
                      <span className="text-xs leading-snug text-muted">
                        {m.ingredients.map(i => displayIngredientName(i.ingredient_name, lang)).filter(Boolean).join(', ')}
                      </span>
                    )}
                    <div className="ml-auto flex flex-wrap justify-end gap-1">
                      {swapFrom ? (
                        swapFrom.id !== m.id && (
                          <Button variant="action" onClick={() => handleSwap(swapFrom, m)}>{t('swapMeal')}</Button>
                        )
                      ) : (
                        <>
                          <button type="button" className="rounded-full border border-transparent px-2 py-1 text-xs text-muted hover:border-border hover:bg-bg hover:text-primary" onClick={() => { setEditingMeal(m); setShowAddMeal(true) }} title={t('edit')}>✎</button>
                          <button type="button" className="rounded-full border border-transparent px-2 py-1 text-xs text-muted hover:border-border hover:bg-bg hover:text-primary" onClick={() => setSwapFrom(m)} title={t('swapMeal')}>⇄</button>
                          <button type="button" className="rounded-full border border-transparent px-2 py-1 text-xs text-muted hover:border-border hover:bg-bg hover:text-accent" onClick={() => handleDelete(m.id)} title={t('delete')}>×</button>
                        </>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  )
}
