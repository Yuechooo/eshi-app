import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getProfile, updateProfile, deleteProfile } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'

const BODY_OPTIONS = ['bodyWarm', 'bodyCool', 'bodyBalanced', 'bodyQiDeficient', 'bodyDamp', 'bodyOther']
const SEASONAL_OPTIONS = ['seasonalSpring', 'seasonalSummer', 'seasonalAutumn', 'seasonalWinter', 'seasonalNone']
const GOAL_OPTIONS = ['goalImmunity', 'goalWeight', 'goalEnergy', 'goalSleep', 'goalDigestion', 'goalStress', 'goalOther']
const SCHEDULE_INTENSITY_OPTIONS = ['scheduleIntensityLight', 'scheduleIntensityModerate', 'scheduleIntensityHeavy']
const DAY_TAG_OPTIONS = ['dayTagBusy', 'dayTagLowEnergy', 'dayTagWorkout', 'dayTagLateNight']
const DAY_TAG_KEYS = ['busy', 'lowEnergy', 'workout', 'lateNight']

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const EMPTY_FORM = {
  display_name: '',
  body_condition: '',
  seasonal_need: '',
  health_goal: [],
  birth_year: '',
  dietary_preference: '',
  allergies: '',
  notes: '',
  busy_days: [],
  schedule_intensity: '',
  daily_context: {}
}

function formatValue(t, key, value, opts) {
  if (!value) return ''
  return opts && opts.includes(value) ? t(value) : value
}

const inputClass =
  'w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25'

const tagClass = (on) =>
  [
    'rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
    on ? 'border-primary bg-primary text-surface' : 'border-border bg-bg text-ink hover:border-primary hover:bg-primary-soft hover:text-primary',
  ].join(' ')

export default function ProfilePage() {
  const { t } = useLanguage()
  const location = useLocation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [modalExiting, setModalExiting] = useState(false)

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const healthGoals = Array.isArray(form.health_goal) ? form.health_goal : (form.health_goal ? [form.health_goal] : [])
  const busyDays = Array.isArray(form.busy_days) ? form.busy_days : (form.busy_days ? String(form.busy_days).split(',') : [])
  const hasSavedUser =
    (form.display_name || '').trim() ||
    (form.body_condition || '').trim() ||
    (form.seasonal_need || '').trim() ||
    healthGoals.length > 0 ||
    (form.birth_year != null && form.birth_year !== '') ||
    (form.dietary_preference || '').trim() ||
    (form.allergies || '').trim() ||
    (form.notes || '').trim()

  const showForm = isAddingNew || !hasSavedUser || isEditing

  const normBirthYear = (v) => {
    if (v == null || v === '') return ''
    const n = Math.floor(Number(v))
    return !isNaN(n) && n >= 1900 && n <= 2100 ? String(n) : ''
  }

  useEffect(() => {
    getProfile()
      .then(p => {
        const goals = (p.health_goal || '').split(',').map(g => g.trim()).filter(Boolean)
        const busy = (p.busy_days || '').split(',').map(d => d.trim().toLowerCase()).filter(d => DAYS.includes(d))
        let dailyCtx = {}
        try { dailyCtx = JSON.parse(p.daily_context || '{}') } catch (_) {}
        setForm({
          display_name: p.display_name || '',
          body_condition: p.body_condition || '',
          seasonal_need: p.seasonal_need || '',
          health_goal: goals,
          birth_year: normBirthYear(p.birth_year),
          dietary_preference: p.dietary_preference || '',
          allergies: p.allergies || '',
          notes: p.notes || '',
          busy_days: busy,
          schedule_intensity: p.schedule_intensity || '',
          daily_context: dailyCtx
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const s = location.state
    if (s?.openModal) setProfileModalOpen(true)
    if (s?.addNew) setIsAddingNew(true)
  }, [location.state])

  const parseBirthYear = (val) => {
    if (val == null || val === '') return null
    const n = parseInt(String(val).replace(/\D/g, ''), 10)
    if (isNaN(n) || n < 1900 || n > 2100) return null
    return n
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const birthYear = parseBirthYear(form.birth_year)
      await updateProfile({
        ...form,
        birth_year: birthYear,
        health_goal: healthGoals.join(','),
        busy_days: busyDays.join(','),
        daily_context: JSON.stringify(form.daily_context || {})
      })
      setForm(f => ({
        ...f,
        birth_year: birthYear != null ? String(birthYear) : '',
        health_goal: healthGoals
      }))
      setSaved(true)
      setIsAddingNew(false)
      setIsEditing(false)
      window.dispatchEvent(new CustomEvent('profile-updated'))
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      const msg = e.message || ''
      setError(msg.includes('Backend not found') ? t('backendNotFound') : (msg || t('profileSaveError')))
    } finally {
      setSaving(false)
    }
  }

  const handleAddNewUser = () => {
    setIsAddingNew(true)
    setProfileModalOpen(false)
    setForm(EMPTY_FORM)
    setError(null)
  }

  const handleEdit = () => {
    setProfileModalOpen(false)
    setIsEditing(true)
  }

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setDeleteConfirmOpen(false)
      setModalExiting(true)
      await deleteProfile()
      await new Promise(r => setTimeout(r, 400))
      setProfileModalOpen(false)
      setModalExiting(false)
      setForm(EMPTY_FORM)
      setIsEditing(false)
      setIsAddingNew(false)
      window.dispatchEvent(new CustomEvent('profile-updated'))
    } catch (e) {
      setModalExiting(false)
      setError(e.message || t('profileSaveError'))
      setDeleteConfirmOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
  }

  const hasProfileData = form.body_condition || form.seasonal_need || healthGoals.length
  const summaryParts = []
  if (form.body_condition) summaryParts.push(formatValue(t, 'body_condition', form.body_condition, BODY_OPTIONS))
  if (form.seasonal_need) summaryParts.push(formatValue(t, 'seasonal_need', form.seasonal_need, SEASONAL_OPTIONS))
  healthGoals.forEach(g => summaryParts.push(formatValue(t, 'health_goal', g, GOAL_OPTIONS)))
  const summaryText = summaryParts.length ? summaryParts.join(' · ') : null

  if (loading) return <div className="py-16 text-center text-sm text-muted">{t('loading')}</div>

  return (
    <section className="mx-auto max-w-lg pb-20 pt-2 sm:pb-24">
      {(isAddingNew || !hasSavedUser) && (
        <>
          <SectionTitle className="mb-2">{t('profileTitle')}</SectionTitle>
          <p className="mb-6 text-sm leading-relaxed text-muted">{t('profileSubtitle')}</p>
        </>
      )}

      {showForm ? (
        <>
          {summaryText && (
            <div className="mb-5 rounded-2xl border border-border bg-primary-soft/50 px-4 py-3 shadow-card">
              <span className="text-sm font-medium leading-relaxed text-primary">{summaryText}</span>
            </div>
          )}
          {!hasProfileData && !isAddingNew && (
            <div className="mb-5 rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted">{t('profileSummaryEmpty')}</div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileBasicInfo')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileBasicInfoDesc')}</p>
              <div className="mb-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('displayName')}</label>
                  <input value={form.display_name} onChange={e => setField('display_name', e.target.value)} placeholder={t('placeholderDisplayName')} className={inputClass} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('birthYear')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={form.birth_year}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '')
                      setField('birth_year', v)
                    }}
                    placeholder={t('placeholderBirthYear')}
                    className={inputClass}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileBodyCondition')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileBodyConditionDesc')}</p>
              <div className="mb-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('bodyCondition')}</label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_OPTIONS.map(key => (
                      <button key={key} type="button" className={tagClass(form.body_condition === key)} onClick={() => setField('body_condition', form.body_condition === key ? '' : key)}>
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('seasonalNeed')}</label>
                  <div className="flex flex-wrap gap-2">
                    {SEASONAL_OPTIONS.map(key => (
                      <button key={key} type="button" className={tagClass(form.seasonal_need === key)} onClick={() => setField('seasonal_need', form.seasonal_need === key ? '' : key)}>
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileGoals')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileGoalsDesc')}</p>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('healthGoal')}</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map(key => (
                    <button
                      key={key}
                      type="button"
                      className={tagClass(healthGoals.includes(key))}
                      onClick={() => {
                        const next = healthGoals.includes(key) ? healthGoals.filter(g => g !== key) : [...healthGoals, key]
                        setField('health_goal', next)
                      }}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileSchedule')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileScheduleDesc')}</p>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('busyDays')}</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(d => (
                    <button
                      key={d}
                      type="button"
                      className={tagClass(busyDays.includes(d))}
                      onClick={() => {
                        const next = busyDays.includes(d) ? busyDays.filter(x => x !== d) : [...busyDays, d]
                        setField('busy_days', next)
                      }}
                    >
                      {t(d)}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileScheduleContext')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileScheduleContextDesc')}</p>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('scheduleIntensity')}</label>
                  <div className="flex flex-wrap gap-2">
                    {SCHEDULE_INTENSITY_OPTIONS.map(key => (
                      <button
                        key={key}
                        type="button"
                        className={tagClass(form.schedule_intensity === key)}
                        onClick={() => setField('schedule_intensity', form.schedule_intensity === key ? '' : key)}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('dailyContextLabel')}</label>
                  <div className="space-y-2">
                    {DAYS.map(day => {
                      const dayTags = form.daily_context?.[day] || []
                      return (
                        <div key={day} className="flex flex-wrap items-center gap-2">
                          <span className="w-12 shrink-0 text-xs text-muted">{t(day)}</span>
                          {DAY_TAG_OPTIONS.map((labelKey, i) => {
                            const tagKey = DAY_TAG_KEYS[i]
                            const active = dayTags.includes(tagKey)
                            return (
                              <button
                                key={tagKey}
                                type="button"
                                className={[
                                  'rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors sm:text-xs',
                                  active
                                    ? 'border-primary bg-primary text-surface'
                                    : 'border-border bg-bg text-muted hover:border-primary hover:bg-primary-soft hover:text-primary',
                                ].join(' ')}
                                onClick={() => {
                                  const next = active
                                    ? dayTags.filter(t => t !== tagKey)
                                    : [...dayTags, tagKey]
                                  setField('daily_context', { ...form.daily_context, [day]: next })
                                }}
                              >
                                {t(labelKey)}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileDietOptional')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileDietDesc')}</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('dietaryPreference')}</label>
                  <input value={form.dietary_preference} onChange={e => setField('dietary_preference', e.target.value)} placeholder={t('placeholderDietaryPreference')} className={inputClass} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('allergies')}</label>
                  <input value={form.allergies} onChange={e => setField('allergies', e.target.value)} placeholder={t('placeholderAllergies')} className={inputClass} />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t('profileNotesOptional')}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted sm:text-sm">{t('profileNotesDesc')}</p>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink sm:text-sm">{t('notes')}</label>
                <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder={t('placeholderNotes')} rows={3} className={`${inputClass} min-h-[4.5rem] resize-y`} />
              </div>
            </Card>

            <div className="flex flex-col items-start gap-3 pt-2">
              {error && <p className="m-0 text-sm text-accent">{error}</p>}
              {saved && <p className="m-0 text-sm font-medium text-primary">{t('saved')}</p>}
              <Button type="submit" disabled={saving} className="min-w-[140px]">
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-[profile-spin_0.7s_linear_infinite] rounded-full border-2 border-surface/40 border-t-surface" aria-hidden />
                    {t('saving')}
                  </span>
                ) : saved ? (
                  <span>✓ {t('saved')}</span>
                ) : (
                  t('save')
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          {(profileModalOpen || modalExiting) && (
            <div
              className={[
                'fixed inset-0 z-[200] flex items-center justify-center bg-ink/35 p-4',
                modalExiting ? 'opacity-0 transition-opacity duration-500' : 'animate-[profile-fade-in_0.25s_ease]',
              ].join(' ')}
              onClick={() => !modalExiting && setProfileModalOpen(false)}
            >
              <div
                className={[
                  'relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white to-[#f9f7f3] p-7 shadow-popover ring-1 ring-ink/[0.04] sm:p-8',
                  modalExiting ? 'scale-[0.98] opacity-0 transition-[opacity,transform] duration-500' : '',
                ].join(' ')}
                onClick={e => e.stopPropagation()}
              >
                <button type="button" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-xl leading-none text-muted hover:bg-border hover:text-ink" onClick={() => !modalExiting && setProfileModalOpen(false)} aria-label="Close" disabled={modalExiting}>×</button>
                <div className="mb-6 rounded-2xl border border-primary/12 bg-primary-soft/60 px-5 py-4 shadow-inner-well">
                  <span className="text-sm font-semibold leading-relaxed text-primary">{summaryText || t('profileSummaryEmpty')}</span>
                </div>
                <Card interactive={false} className="mb-4">
                  <h3 className="mb-3 font-display text-base font-semibold text-ink">{t('profileBasicInfo')}</h3>
                  <dl className="m-0 flex flex-col gap-2">
                    <dt className="text-xs font-medium text-muted">{t('displayName')}</dt>
                    <dd className="m-0 text-sm text-ink">{form.display_name || '—'}</dd>
                    <dt className="text-xs font-medium text-muted">{t('birthYear')}</dt>
                    <dd className="m-0 text-sm text-ink">{form.birth_year || '—'}</dd>
                  </dl>
                </Card>
                <Card interactive={false} className="mb-4">
                  <h3 className="mb-3 font-display text-base font-semibold text-ink">{t('profileBodyCondition')}</h3>
                  <dl className="m-0 flex flex-col gap-2">
                    <dt className="text-xs font-medium text-muted">{t('bodyCondition')}</dt>
                    <dd className="m-0 text-sm text-ink">{formatValue(t, 'body_condition', form.body_condition, BODY_OPTIONS) || '—'}</dd>
                    <dt className="text-xs font-medium text-muted">{t('seasonalNeed')}</dt>
                    <dd className="m-0 text-sm text-ink">{formatValue(t, 'seasonal_need', form.seasonal_need, SEASONAL_OPTIONS) || '—'}</dd>
                  </dl>
                </Card>
                <Card interactive={false} className="mb-4">
                  <h3 className="mb-3 font-display text-base font-semibold text-ink">{t('profileGoals')}</h3>
                  <dl className="m-0 flex flex-col gap-2">
                    <dt className="text-xs font-medium text-muted">{t('healthGoal')}</dt>
                    <dd className="m-0 text-sm text-ink">{healthGoals.length ? healthGoals.map(g => formatValue(t, 'health_goal', g, GOAL_OPTIONS)).join(', ') : '—'}</dd>
                  </dl>
                </Card>
                {busyDays.length > 0 && (
                  <Card interactive={false} className="mb-4">
                    <h3 className="mb-3 font-display text-base font-semibold text-ink">{t('profileSchedule')}</h3>
                    <dl className="m-0 flex flex-col gap-2">
                      <dt className="text-xs font-medium text-muted">{t('busyDays')}</dt>
                      <dd className="m-0 text-sm text-ink">{busyDays.map(d => t(d)).join(', ')}</dd>
                    </dl>
                  </Card>
                )}
                {(form.dietary_preference || form.allergies) && (
                  <Card interactive={false} className="mb-4">
                    <h3 className="mb-3 font-display text-base font-semibold text-ink">{t('profileDietOptional')}</h3>
                    <dl className="m-0 flex flex-col gap-2">
                      {form.dietary_preference && (
                        <>
                          <dt className="text-xs font-medium text-muted">{t('dietaryPreference')}</dt>
                          <dd className="m-0 text-sm text-ink">{form.dietary_preference}</dd>
                        </>
                      )}
                      {form.allergies && (
                        <>
                          <dt className="text-xs font-medium text-muted">{t('allergies')}</dt>
                          <dd className="m-0 text-sm text-ink">{form.allergies}</dd>
                        </>
                      )}
                    </dl>
                  </Card>
                )}
                {form.notes && (
                  <Card interactive={false} className="mb-4">
                    <h3 className="mb-3 font-display text-base font-semibold text-ink">{t('profileNotesOptional')}</h3>
                    <p className="m-0 text-sm leading-relaxed text-ink">{form.notes}</p>
                  </Card>
                )}
                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
                  <Button variant="secondary" className="w-full" onClick={handleEdit}>{t('edit')}</Button>
                  <Button variant="dangerGhost" className="w-full" onClick={handleDeleteClick}>{t('deleteProfile')}</Button>
                  <Button variant="secondary" className="w-full" onClick={handleAddNewUser}>{t('addNewUserInfo')}</Button>
                </div>
              </div>
            </div>
          )}

          {deleteConfirmOpen && !modalExiting && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/40 p-4" onClick={handleDeleteCancel}>
              <div className="w-full max-w-sm rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white to-[#f9f7f3] p-7 shadow-popover ring-1 ring-ink/[0.05]" onClick={e => e.stopPropagation()}>
                <h4 className="mb-2 font-display text-lg font-semibold text-ink">{t('deleteConfirmTitle')}</h4>
                <p className="mb-6 text-sm leading-relaxed text-muted">{t('deleteConfirmMessage')}</p>
                <div className="flex justify-end gap-3">
                  <button type="button" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm text-muted hover:border-muted hover:text-ink" onClick={handleDeleteCancel}>{t('cancel')}</button>
                  <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>{t('deleteConfirmBtn')}</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
