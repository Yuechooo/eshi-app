import { forwardRef } from 'react'

const variants = {
  primary:
    'rounded-2xl border border-primary bg-primary text-surface shadow-[0_2px_8px_-2px_rgba(139,168,136,0.45)] hover:brightness-[1.03] active:brightness-[0.98]',
  secondary:
    'rounded-2xl border border-primary bg-transparent text-primary hover:bg-primary-soft',
  ghost:
    'rounded-2xl border border-border bg-surface/90 text-muted shadow-card hover:border-primary/40 hover:text-primary hover:shadow-card-hover',
  action:
    'rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-card hover:border-primary hover:text-primary',
  dangerGhost:
    'rounded-2xl border border-accent bg-transparent text-accent hover:bg-accent/8',
  danger:
    'rounded-2xl border border-accent bg-accent text-surface hover:brightness-[1.02]',
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
}

const Button = forwardRef(function Button(
  {
    as: Comp = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    type,
    ...rest
  },
  ref
) {
  const resolvedType = type ?? (Comp === 'button' ? 'button' : undefined)
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-[filter,background-color,border-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-55'
  return (
    <Comp
      ref={ref}
      type={resolvedType}
      className={[base, variants[variant] || variants.primary, sizes[size] || sizes.md, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  )
})

export default Button
