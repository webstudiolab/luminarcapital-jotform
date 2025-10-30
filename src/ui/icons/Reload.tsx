export default function ReloadIcon({
  color = 'currentColor',
}: {
  color?: string
}) {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <path
        d="M34.1667 9.16666H15.8333C9.64454 9.16666 5 13.6417 5 20M5.83333 30.8333H24.1667C30.3555 30.8333 35 26.3583 35 20M30.8333 13.3333L34.0914 10.3452C34.6971 9.78962 35 9.51184 35 9.16667C35 8.82149 34.6971 8.54371 34.0914 7.98816L30.8333 5M9.16667 26.6667L5.9086 29.6548C5.30287 30.2104 5 30.4882 5 30.8333C5 31.1785 5.30287 31.4563 5.9086 32.0118L9.16667 35"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
