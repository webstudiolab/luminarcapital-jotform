import { useEffect, useRef } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface ILottieFrame {
  className?: string
  data: string | unknown
  ariaLabel?: string
}

const LottieFrame = ({ className, data, ariaLabel }: ILottieFrame) => {
  const animationContainer = useRef<HTMLDivElement | null>(null)
  const animationInstance = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (animationContainer.current && !animationInstance.current) {
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: data as string,
      })
    }

    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy()
        animationInstance.current = null
      }
    }
  }, [data])

  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%' }}
      ref={animationContainer}
      role="img"
      aria-label={ariaLabel || 'Decorative illustration'}
    />
  )
}

export default LottieFrame
