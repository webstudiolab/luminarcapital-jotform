import { createElement } from 'react'
import classNames from 'classnames'
import { IFinancingOptionCard } from '@/types'
import Button from '@/ui/components/Button/Button'
import styles from './FinancingOptionCard.module.scss'

const FinancingOptionCard = ({
  className,
  title,
  description,
  icon,
  href,
}: IFinancingOptionCard) => {
  return (
    <div className={classNames(styles['card'], className)} aria-hidden="false">
      {icon ? (
        <div className={styles['card-icon']}>{createElement(icon)}</div>
      ) : null}
      <div>
        <h3 className={styles['card-title']}>{title}</h3>
        <p className={styles['card-description']}>{description}</p>
      </div>
      {href ? (
        <Button
          href={href}
          variant="outlined"
          size="lg"
          className={styles['card-action']}
        >
          Learn more
        </Button>
      ) : null}
    </div>
  )
}

export default FinancingOptionCard
