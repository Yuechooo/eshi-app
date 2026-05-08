export default function SectionTitle({ as = 'h2', className = '', children, ...rest }) {
  const Root = as
  return (
    <Root
      className={[
        'font-display text-xl font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-2xl',
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
