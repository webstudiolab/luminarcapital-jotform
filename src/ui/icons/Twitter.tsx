export default function TwitterIcon({
  color = 'currentColor',
  className,
}: {
  color?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path
        d="M21.2706 7.58643H24.0818L17.9401 14.606L25.1654 24.1581H19.5081L15.0771 18.3648L10.007 24.1581H7.19406L13.7632 16.6498L6.83203 7.58643H12.633L16.6382 12.8817L21.2706 7.58643ZM20.284 22.4754H21.8417L11.7865 9.1807H10.1149L20.284 22.4754Z"
        fill={color}
      />
    </svg>
  )
}
