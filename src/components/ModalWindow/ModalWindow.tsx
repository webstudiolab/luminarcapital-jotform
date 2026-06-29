'use client'

import { useCallback, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '@/hooks'
import CloseIcon from '@/ui/icons/Close'
import { closeModal, selectModal } from '@/store/slices/modalSlice'
import { IModalState } from '@/types'
import BecomeAPartnerModalForm from '@/components/forms/BecomeAPartnerModal/BecomeAPartnerModalForm'
import FinancingApplicationForm from '@/components/forms/FinancingApplicationForm/FinancingApplicationForm'
import styles from './ModalWindow.module.scss'

const MODAL_TITLES: Record<string, string> = {
  partner: 'Become a Partner',
  financing: 'Apply for Financing',
  jotform: 'Apply for Financing',
}

const ModalWindow = () => {
  const dispatch = useAppDispatch()
  const { isOpen, modal, size } = useAppSelector(selectModal) as IModalState
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleClose = useCallback(() => {
    dispatch(closeModal())
  }, [dispatch])

  // Store previously focused element and focus close button when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Small delay to let the modal animate in before focusing
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    } else {
      // Return focus to the element that opened the modal
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return
    const modal = document.getElementById('modal-box')
    if (!modal) return

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(focusableSelectors),
      ).filter((el) => !el.closest('[aria-hidden="true"]'))

      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab, true)
    return () => document.removeEventListener('keydown', handleTab, true)
  }, [isOpen])

  if (!isOpen) return null

  const forms = {
    partner: <BecomeAPartnerModalForm />,
    financing: <FinancingApplicationForm />,
    jotform: <FinancingApplicationForm />,
  }

  const modalTitle = MODAL_TITLES[modal as string] || 'Dialog'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, type: 'linear' }}
      className={styles['modal']}
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
    >
      <div
        className={styles['modal-background']}
        onClick={handleClose}
        aria-hidden="true"
      />
      <motion.div
        id="modal-box"
        initial={{ opacity: 0, y: '10rem' }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.2,
          type: 'linear',
        }}
        className={classNames(styles['modal-box'], styles[size])}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close dialog"
          className={styles['modal-trigger']}
          onClick={handleClose}
        >
          <CloseIcon className={styles['modal-trigger-icon']} aria-hidden="true" />
        </button>
        {forms[modal as keyof typeof forms]}
      </motion.div>
    </motion.div>
  )
}

export default ModalWindow
