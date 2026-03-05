'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/hooks'
import { closeModal } from '@/store/slices/modalSlice'
import styles from './JotformModal.module.scss'

const JotformModal = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js'
    script.async = true
    document.body.appendChild(script)

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return

      const data = event.data

      // JotForm sends colon-separated strings e.g. "submission-completed:260432292234046"
      // Also handle JSON object format as fallback
      if (
        (typeof data === 'string' && data.startsWith('submission-completed')) ||
        (typeof data === 'object' && data.action === 'submission-completed') ||
        (typeof data === 'object' && data.action === 'thankYou')
      ) {
        dispatch(closeModal())
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      document.body.removeChild(script)
      window.removeEventListener('message', handleMessage)
    }
  }, [dispatch])

  return (
    <div className={styles['jotform']}>
      <iframe
        id="JotFormIFrame-260432292234046"
        title="Luminar Capital - Business Financing Application"
        onLoad={() => window.parent.scrollTo(0, 0)}
        allowTransparency={true}
        allow="geolocation; microphone; camera; fullscreen; payment"
        src="https://form.jotform.com/260432292234046"
        frameBorder={0}
        style={{ minWidth: '100%', maxWidth: '100%', border: 'none' }}
        scrolling="yes"
        className={styles['jotform-iframe']}
      />
    </div>
  )
}

export default JotformModal
