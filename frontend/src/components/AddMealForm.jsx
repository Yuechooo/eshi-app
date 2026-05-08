import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { ingredientNamesZh, categoryNamesZh } from '../i18n'
import Card from './ui/Card'
import Button from './ui/Button'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEAL_TYPES = [
  { value: 'breakfast', labelKey: 'breakfast' },
  { value: 'lunch', labelKey: 'lunch' },
  { value: 'dinner', labelKey: 'dinner' },
  { value: 'snack', labelKey: 'snack' },
]

function displayName(name, lang) {
  if (lang === 'zh' && ingredientNamesZh[name]) return ingredientNamesZh[name]
  return name
}

function displayCategory(cat, lang) {
  if (lang === 'zh' && categoryNamesZh[cat]) return categoryNamesZh[cat]
  return cat
}

const inputClass =
  'min-w-[120px] flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25'

export default function AddMealForm({ ingredients, onSubmit, onCancel, showAddIngredient, setShowAddIngredient, onAddIngredient, onIngredientAdded, editMeal }) {
  const { t, lang } = useLanguage()
  const isEdit = !!editMeal
  const [name, setName] = useState(editMeal?.name ?? '')
  const [day, setDay] = useState(editMeal?.day_of_week ?? 'monday')
  const [mealType, setMealType] = useState(editMeal?.meal_type ?? 'breakfast')
  const [notes, setNotes] = useState(editMeal?.notes ?? '')
  const [selected, setSelected] = useState(() => {
    if (!editMeal?.ingredients?.length) return []
    return editMeal.ingredients.map(i => ({
      ingredient_id: i.ingredient_id,
      quantity: i.quantity ?? 1,
      unit: i.unit || undefined,
    }))
  })
  const [newIngName, setNewIngName] = useState('')
  const [newIngCategory, setNewIngCategory] = useState('Proteins')

  /* Sync form when switching edit target */
  useEffect(() => {
    queueMicrotask(() => {
      if (editMeal) {
        setName(editMeal.name ?? '')
        setDay(editMeal.day_of_week ?? 'monday')
        setMealType(editMeal.meal_type ?? 'breakfast')
        setNotes(editMeal.notes ?? '')
        setSelected((editMeal.ingredients || []).map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity ?? 1, unit: i.unit })))
      } else {
        setName('')
        setDay('monday')
        setMealType('breakfast')
        setNotes('')
        setSelected([])
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset form when meal id changes
  }, [editMeal?.id])

  const categories = [...new Set(ingredients.map(i => i.category))].sort()
  const effectiveCategory = categories.includes(newIngCategory) ? newIngCategory : (categories[0] || 'Proteins')

  const addIng = (ing, qty = 1, unit = '') => {
    if (selected.some(s => s.ingredient_id === ing.id)) return
    setSelected([...selected, { ingredient_id: ing.id, quantity: qty, unit: unit || ing.unit }])
  }

  const removeIng = (id) => setSelected(selected.filter(s => s.ingredient_id !== id))

  const generateMealName = () => {
    return selected
      .map(s => {
        const ing = ingredients.find(i => i.id === s.ingredient_id)
        return displayName(ing?.name || '', lang)
      })
      .filter(Boolean)
      .join(' + ')
  }

  useEffect(() => {
    if (isEdit) return
    queueMicrotask(() => {
      setName(selected.length > 0 ? generateMealName() : '')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- name derived from selected chips
  }, [selected, isEdit])

  const handleSubmit = (e) => {
    e.preventDefault()
    const mealName = name.trim() || generateMealName()
    if (!mealName) return
    const payload = { name: mealName, day_of_week: day, meal_type: mealType, notes: notes.trim() || undefined, ingredients: selected }
    if (isEdit) payload.id = editMeal.id
    onSubmit(payload)
    if (!isEdit) {
      setName('')
      setNotes('')
      setSelected([])
    }
  }

  const handleAddNewIngredient = async (e) => {
    e.preventDefault()
    if (!newIngName.trim()) return
    try {
      await onAddIngredient({ name: newIngName.trim(), category: effectiveCategory, unit: 'pcs' })
      setShowAddIngredient(false)
      setNewIngName('')
      onIngredientAdded()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <h3 className="mb-4 font-display text-base font-semibold text-ink">{isEdit ? t('editMeal') : t('addMealTitle')}</h3>
        <div className="mb-3 flex flex-wrap gap-3">
          <input placeholder={t('mealNameAuto')} value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          <select value={day} onChange={e => setDay(e.target.value)} className={`${inputClass} min-w-[100px] flex-none`}>
            {DAYS.map(d => <option key={d} value={d}>{t(d)}</option>)}
          </select>
          <select value={mealType} onChange={e => setMealType(e.target.value)} className={`${inputClass} min-w-[100px] flex-none`}>
            {MEAL_TYPES.map(m => <option key={m.value} value={m.value}>{t(m.labelKey)}</option>)}
          </select>
        </div>
        <input placeholder={t('notesOptional')} value={notes} onChange={e => setNotes(e.target.value)} className={`${inputClass} mb-4 w-full`} />

        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-ink">{t('ingredients')}</label>
            <button type="button" className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted hover:border-primary hover:text-primary" onClick={() => setShowAddIngredient(!showAddIngredient)}>
              {t('newIngredient')}
            </button>
          </div>
          {showAddIngredient && (
            <form className="mb-3 flex flex-wrap gap-2" onSubmit={handleAddNewIngredient}>
              <input placeholder={t('ingredientName')} value={newIngName} onChange={e => setNewIngName(e.target.value)} className={inputClass} />
              <select value={effectiveCategory} onChange={e => setNewIngCategory(e.target.value)} className={`${inputClass} flex-none`}>
                {categories.map(c => <option key={c} value={c}>{displayCategory(c, lang)}</option>)}
              </select>
              <Button type="submit" variant="secondary" size="sm">{t('add')}</Button>
            </form>
          )}
          <div className="mb-3 flex flex-wrap gap-2">
            {ingredients.map(ing => (
              <button
                key={ing.id}
                type="button"
                className={[
                  'rounded-full border px-3 py-1.5 text-xs transition-colors sm:text-sm',
                  selected.some(s => s.ingredient_id === ing.id)
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-bg text-ink hover:border-primary hover:text-primary',
                ].join(' ')}
                onClick={() => addIng(ing)}
              >
                {displayName(ing.name, lang)}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <ul className="m-0 mt-2 list-none space-y-2 p-0 text-sm">
              {selected.map(s => {
                const ing = ingredients.find(i => i.id === s.ingredient_id)
                const unit = s.unit || ing?.unit || 'pcs'
                return (
                  <li key={s.ingredient_id} className="flex flex-wrap items-center gap-2">
                    <span className="text-ink">{displayName(ing?.name, lang)} — {s.quantity} {unit === 'pcs' ? t('unitPcs') : unit}</span>
                    <button type="button" className="rounded-full px-2 py-0.5 text-xs text-muted hover:bg-bg hover:text-accent" onClick={() => removeIng(s.ingredient_id)}>×</button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
          <Button type="submit">{isEdit ? t('save') : t('addMealSubmit')}</Button>
        </div>
      </form>
    </Card>
  )
}
