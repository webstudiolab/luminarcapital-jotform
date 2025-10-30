'use client'

import { useCallback } from 'react'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '@/hooks'
import CloseIcon from '@/ui/icons/Close'
import { closeModal, selectModal } from '@/store/slices/modalSlice'
import { IModalState } from '@/types'
import BecomeAPartnerModalForm from '@/components/forms/BecomeAPartnerModal/BecomeAPartnerModalForm'
import ApplyForFinancingModalForm from '@/components/forms/ApplyForFinancingModal/ApplyForFinancingModalForm'
import styles from './ModalWindow.module.scss'

const forms = {
  partner: <BecomeAPartnerModalForm />,
  financing: <ApplyForFinancingModalForm />,
}

const ModalWindow = () => {
  const dispatch = useAppDispatch()
  const { isOpen, modal, size } = useAppSelector(selectModal) as IModalState

  const handleClose = useCallback(() => {
    dispatch(closeModal())
  }, [dispatch])

  if (isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, type: 'linear' }}
        className={styles['modal']}
      >
        <div className={styles['modal-background']} onClick={handleClose} />
        <motion.div
          initial={{ opacity: 0, y: '10rem' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.2,
            type: 'linear',
          }}
          className={classNames(styles['modal-box'], styles[size])}
        >
          <div className={styles['modal-trigger']} onClick={handleClose}>
            <CloseIcon className={styles['modal-trigger-icon']} />
          </div>
          {forms[modal as keyof typeof forms]}
        </motion.div>
      </motion.div>
    )
  }

  return null
}

export default ModalWindow
