/** Northern-temperate band: spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb */
export function getSeasonBand(date = new Date()) {
  const m = date.getMonth()
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'autumn'
  return 'winter'
}
