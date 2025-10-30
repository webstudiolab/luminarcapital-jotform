export default function ClockIcon({
  color = 'currentColor',
}: {
  color?: string
}) {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <path
        d="M31.5893 14.344L35.7729 14.0893C32.7741 6.17429 24.1643 1.6662 15.7699 3.90758C6.82925 6.29485 1.51866 15.4348 3.90839 24.3222C6.29813 33.2096 15.4833 38.479 24.4239 36.0918C31.0623 34.3192 35.6994 28.8241 36.6693 22.4736M20.0026 13.333V19.9997L23.3359 23.333"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
