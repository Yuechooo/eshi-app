import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getGroceryList, setGroceryOverride, clearGroceryOverride } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import { ingredientNamesZh, categoryNamesZh } from '../i18n'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'

const GROCERY_CHECKED_KEY = 'grocery_checked'

function loadCheckedIds() {
  try {
    const raw = localStorage.getItem(GROCERY_CHECKED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveCheckedIds(ids) {
  localStorage.setItem(GROCERY_CHECKED_KEY, JSON.stringify([...ids]))
}

function displayName(name, lang) {
  if (lang === 'zh' && ingredientNamesZh[name]) return ingredientNamesZh[name]
  return name
}

function displayCategory(cat, lang) {
  if (lang === 'zh' && categoryNamesZh[cat]) return categoryNamesZh[cat]
  return cat
}

export default function GroceryListPage() {
  const { t, lang } = useLanguage()
  const [grocery, setGrocery] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [checkedIds, setCheckedIds] = useState(() => loadCheckedIds())

  const toggleChecked = (ingredientId) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(ingredientId)) next.delete(ingredientId)
      else next.add(ingredientId)
      saveCheckedIds(next)
      return next
    })
  }

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    getGroceryList()
      .then(setGrocery)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleQuantityBlur = async (ingredientId, newVal) => {
    const num = parseFloat(newVal)
    if (isNaN(num) || num < 0) return
    setSavingId(ingredientId)
    try {
      await setGroceryOverride(ingredientId, num)
      setGrocery(prev => {
        const next = {}
        for (const [cat, items] of Object.entries(prev)) {
          next[cat] = items.map(it =>
            it.id === ingredientId ? { ...it, quantity: num, overridden: true } : it
          )
        }
        return next
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingId(null)
    }
  }

  const handleQuantityInput = (ingredientId, newVal) => {
    const num = parseFloat(newVal)
    setGrocery(prev => {
      const next = {}
      for (const [cat, items] of Object.entries(prev)) {
        next[cat] = items.map(it =>
          it.id === ingredientId ? { ...it, quantity: isNaN(num) || num < 0 ? 0 : num } : it
        )
      }
      return next
    })
  }

  const handleResetQuantity = async (ingredientId) => {
    setSavingId(ingredientId)
    try {
      await clearGroceryOverride(ingredientId)
      refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <div className="py-16 text-center text-sm text-muted">{t('loading')}</div>
  if (error) return <div className="py-16 text-center text-sm text-accent">{t('error')}: {error}. {t('errorBackend')}</div>

  const entries = Object.entries(grocery)
  if (entries.length === 0) {
    return (
      <section className="pb-20 sm:pb-24">
        <p className="mb-3 text-center text-sm text-muted">{t('emptyGrocery')}</p>
        <p className="text-center text-sm text-muted">
          <Link to="/meal-plan" className="font-medium text-primary underline-offset-2 hover:underline">{t('navMealPlan')}</Link>
          {' '}{t('emptyGroceryHint')}
        </p>
      </section>
    )
  }

  return (
    <section className="pb-20 sm:pb-24">
      <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <SectionTitle className="mb-2 sm:mb-3">{t('generatedList')}</SectionTitle>
          <p className="max-w-xl text-xs leading-relaxed text-muted sm:text-sm">{t('groceryHint')}</p>
        </div>
        <Button variant="secondary" className="shrink-0 self-start" onClick={refresh}>{t('refresh')}</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3">
        {entries.map(([category, items]) => (
          <Card key={category}>
            <h3 className="mb-4 font-display text-base font-semibold text-primary">{displayCategory(category, lang)}</h3>
            <ul className="m-0 list-none space-y-3 p-0">
              {items.map((item, i) => {
                const checked = checkedIds.has(item.id)
                return (
                  <li key={`${item.id}-${i}`} className={`flex flex-wrap items-center gap-2 text-sm ${checked ? 'text-muted line-through' : 'text-ink'}`}>
                    <button
                      type="button"
                      className={[
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors',
                        checked ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-muted hover:border-primary',
                      ].join(' ')}
                      onClick={() => toggleChecked(item.id)}
                      aria-label={checked ? t('groceryUncheck') : t('groceryCheck')}
                      title={checked ? t('groceryUncheck') : t('groceryCheck')}
                    >
                      {checked ? '✓' : '○'}
                    </button>
                    <span className="flex min-w-0 flex-shrink-0 items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="w-14 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        value={item.quantity}
                        onChange={e => handleQuantityInput(item.id, e.target.value)}
                        onBlur={e => handleQuantityBlur(item.id, e.target.value)}
                        disabled={savingId === item.id}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <span className="text-xs text-muted">{item.unit === 'pcs' ? t('unitPcs') : item.unit}</span>
                    </span>
                    <span className="min-w-0 flex-1">{displayName(item.name, lang)}</span>
                    {item.overridden && (
                      <button
                        type="button"
                        className="ml-auto rounded-full px-2 py-1 text-xs text-primary hover:bg-primary-soft"
                        onClick={() => handleResetQuantity(item.id)}
                        disabled={savingId === item.id}
                        title={t('resetQuantity')}
                      >
                        ↺
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  )
}
