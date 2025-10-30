export default function BurgerIcon({
  color = 'currentColor',
  className,
}: {
  color?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M4 5L20 5M4 12L20 12M4 19L20 19"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
