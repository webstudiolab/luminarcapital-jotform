export default function CloseIcon({
  color = 'currentColor',
  className,
}: {
  color?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M19.0002 4.99994L5.00024 18.9999M5.00024 4.99994L19.0002 18.9999"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
