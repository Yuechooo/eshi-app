import { useState, useCallback } from 'react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const STORAGE_KEY = 'eshi_schedule_context'

const DEFAULT_DAY = { level: 'normal', tags: [] }

function buildDefault() {
  return DAYS.reduce((acc, d) => ({ ...acc, [d]: { ...DEFAULT_DAY, tags: [] } }), {})
}

function loadSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefault()
    const parsed = JSON.parse(raw)
    return DAYS.reduce((acc, d) => ({
      ...acc,
      [d]: {
        level: parsed[d]?.level || 'normal',
        tags: Array.isArray(parsed[d]?.tags) ? parsed[d].tags : [],
      },
    }), {})
  } catch {
    return buildDefault()
  }
}

function persist(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

export function useScheduleContext() {
  const [schedule, setSchedule] = useState(loadSchedule)

  const setDayLevel = useCallback((day, level) => {
    setSchedule(prev => {
      const next = { ...prev, [day]: { ...prev[day], level } }
      persist(next)
      return next
    })
  }, [])

  const toggleDayTag = useCallback((day, tag) => {
    setSchedule(prev => {
      const tags = prev[day]?.tags || []
      const nextTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
      const next = { ...prev, [day]: { ...prev[day], tags: nextTags } }
      persist(next)
      return next
    })
  }, [])

  return { schedule, setDayLevel, toggleDayTag }
}
