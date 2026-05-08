export default function Card({
  as = 'div',
  padded = true,
  compact = false,
  interactive = true,
  className = '',
  children,
  ...rest
}) {
  const Root = as
  const motion = interactive
    ? 'transition-[box-shadow,transform] duration-300 hover:shadow-card-hover'
    : 'transition-none hover:shadow-card'
  const padClass = !padded ? '' : compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
  return (
    <Root
      className={[
        'rounded-[1.375rem] border border-white/90 bg-gradient-to-b from-white via-white to-[#f9f7f3]',
        'shadow-card ring-1 ring-ink/[0.035]',
        motion,
        padClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Root>
  )
}
