import { useCallback, useState } from 'react'
import Button from '@/ui/components/Button/Button'
import CloseIcon from '@/ui/icons/Close'
import {
  getFromLocalStorageWithExpiry,
  removeFromLocalStorage,
  setToLocalStorageWithExpiry,
} from '@/utils/localStorage/expiryLocalStorage'
import styles from './CookieMessage.module.scss'

const CookieMessage = () => {
  const [enableCookie, setEnableCookie] = useState<boolean | null>(
    getFromLocalStorageWithExpiry('enableCookie'),
  )

  const updateCookie = useCallback((status: boolean) => {
    setToLocalStorageWithExpiry('enableCookie', status)
    setEnableCookie(status)
  }, [])

  const handleRemoveCookie = useCallback(() => {
    removeFromLocalStorage('enableCookie')
    setEnableCookie(false)
  }, [])

  if (enableCookie === null) {
    return (
      <section className={styles['section']}>
        <div className="content-block">
          <div className={styles['section-box']}>
            <div
              className={styles['section-trigger']}
              onClick={() => handleRemoveCookie()}
            >
              <CloseIcon className={styles['section-trigger-icon']} />
            </div>
            <div className={styles['section-box-content']}>
              <h4>We Use Cookies</h4>
              <p className={styles['section-box-content-description']}>
                This website uses cookies to enhance user experience, analyze
                performance and traffic on our website. We also share
                information about your use of our site with our social media,
                advertising and analytics partners. If you&apos;d like to learn
                more, please visit our Privacy Policy.
              </p>
            </div>
            <div className={styles['section-box-action']}>
              <Button
                variant="outlined"
                className={styles['button']}
                onClick={() => updateCookie(false)}
              >
                Reject cookies
              </Button>
              <Button
                className={styles['button']}
                onClick={() => updateCookie(true)}
              >
                Accept all cookies
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return null
}

export default CookieMessage
