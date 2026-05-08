import { useState, useEffect } from 'react'
import { getProfile } from '../../api'
import { useLanguage } from '../../hooks/useLanguage'

export default function WelcomeArea() {
  const { t, lang } = useLanguage()
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    getProfile().then(p => setDisplayName(p.display_name || '')).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greetingKey = hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening'
  const greeting = t(greetingKey)
  const name = displayName || (lang === 'zh' ? '用户' : 'there')

  return (
    <header className="home-welcome">
      <h1>{greeting}, {name}</h1>
    </header>
  )
}
