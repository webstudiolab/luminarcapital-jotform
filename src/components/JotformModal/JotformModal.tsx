import { useEffect, useState } from 'react'
import styles from './JotformModal.module.scss'

const JOTFORM_SRC = 'https://form.jotform.com/260432292234046'

const JotformModal = () => {
  const [src, setSrc] = useState('')
  const [loaded, setLoaded] = useState(false)

  // Defer iframe src injection by 300ms so the modal open animation
  // completes first, giving the user instant visual feedback while
  // Jotform boots in the background.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSrc(JOTFORM_SRC)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles['jotform']}>
      {/* Skeleton shown until iframe fires onLoad */}
      {!loaded && (
        <div className={styles['jotform-skeleton']}>
          <div className={styles['jotform-skeleton__logo']} />
          <div className={styles['jotform-skeleton__bar']} style={{ width: '60%' }} />
          <div className={styles['jotform-skeleton__bar']} style={{ width: '40%' }} />
          <div className={styles['jotform-skeleton__field']} />
          <div className={styles['jotform-skeleton__field']} />
          <div className={styles['jotform-skeleton__btn']} />
          <p className={styles['jotform-skeleton__text']}>Loading your application…</p>
        </div>
      )}

      <iframe
        id="JotFormIFrame-260432292234046"
        title="Luminar Capital - Business Financing Application"
        allowTransparency={true}
        allow="geolocation; microphone; camera; fullscreen; payment"
        src={src}
        frameBorder={0}
        style={{
          minWidth: '100%',
          maxWidth: '100%',
          border: 'none',
          // Hide iframe until loaded to prevent white flash
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          // Must keep height even when hidden so Jotform's resize script works
          minHeight: loaded ? 0 : '600px',
        }}
        scrolling="no"
        className={styles['jotform-iframe']}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

export default JotformModal
