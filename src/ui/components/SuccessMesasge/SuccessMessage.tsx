'use client'

import classNames from 'classnames'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './SuccessMessage.module.scss'

interface ISuccessMessage {
  className?: string
  title?: string
  type?: 'partner' | 'financing'
}

const SuccessMessage = ({
  className,
  title = 'Successfully Submitted!',
  type = 'partner',
}: ISuccessMessage) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={classNames(styles['box'], className)}
    >
      <div className={styles['box-thumb']}>
        <Image src={`/banners/success-${type}.svg`} fill alt={title} />
      </div>
      <p className={classNames(styles['box-title'], 'h2')}>{title}</p>
    </motion.div>
  )
}

export default SuccessMessage
