import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'

export default function DietFoodCard({ food }) {
  const { lang } = useLanguage()
  const name = lang === 'zh' ? food.nameZh : food.nameEn
  const intro = lang === 'zh' ? food.introZh || food.descZh : food.introEn || food.descEn

  const suitableTags = food.userMatchTags || []
  const cautionTags = food.userCautionTags || []
  const seasonalTag = food.seasonalTag

  return (
    <Link
      to={`/diet/${food.id}`}
      className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-white/90 bg-gradient-to-b from-white to-[#faf8f4] text-inherit shadow-card outline-none ring-1 ring-ink/[0.035] transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/30 no-underline"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg">
        <img
          src={food.image}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-80" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h4 className="mb-2 font-display text-lg font-semibold leading-tight text-ink">{name}</h4>
        <p className="mb-4 flex-1 text-xs leading-relaxed text-muted sm:text-sm">{intro}</p>

        <div className="flex flex-wrap gap-1.5">
          {suitableTags.map((tag, i) => (
            <span
              key={`${food.id}-suit-${i}`}
              className="rounded-full border border-primary/20 bg-primary-soft/65 px-2 py-0.5 text-[0.65rem] font-medium text-primary sm:text-xs"
            >
              {lang === 'zh' ? tag.zh : tag.en}
            </span>
          ))}
          {cautionTags.map((tag, i) => (
            <span
              key={`${food.id}-caution-${i}`}
              className="rounded-full border border-secondary/20 bg-secondary-soft/65 px-2 py-0.5 text-[0.65rem] font-medium text-secondary sm:text-xs"
            >
              {lang === 'zh' ? tag.zh : tag.en}
            </span>
          ))}
          {!food.isSeasonal && seasonalTag && (
            <span
              key={`${food.id}-seasonal`}
              className="rounded-full border border-secondary/20 bg-secondary-soft/65 px-2 py-0.5 text-[0.65rem] font-medium text-secondary sm:text-xs"
            >
              {lang === 'zh' ? seasonalTag.zh : seasonalTag.en}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
