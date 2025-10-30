import { useCallback } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { useAppDispatch } from '@/hooks'
import styles from './PPMessage.module.scss'
import { closeModal } from '@/store/slices/modalSlice'

const PPMessage = ({ className }: { className?: string }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleRedirect = useCallback(() => {
    dispatch(closeModal())
    void router.push('/privacy-policy')
  }, [router, dispatch])

  return (
    <p className={classNames(styles['message'], className)}>
      I agree to receive communications by text message from Luminar Capital
      about my inquiry. You may opt-out by replying STOP or reply HELP for more
      information. Message frequency varies. Message and data rates may apply.
      You may review our <span onClick={handleRedirect}>Privacy Policy</span> to
      learn how your data is used.
    </p>
  )
}

export default PPMessage
