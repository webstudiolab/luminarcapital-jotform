export default function TrustPilotIcon({
  color = 'currentColor',
  className,
}: {
  color?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path
        d="M22.1726 25.1667L15.993 20.6346L9.8135 25.1667L12.1795 17.8424L6 13.3103L13.6409 13.3243L16.007 6L18.3591 13.3243H26L19.8205 17.8424L16.007 20.6346L20.3493 19.498"
        fill={color}
      />
    </svg>
  )
}
