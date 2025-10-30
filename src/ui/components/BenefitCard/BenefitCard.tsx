import Image from 'next/image'
import classNames from 'classnames'
import styles from './BenefitCard.module.scss'

interface IBenefitCard {
  className?: string
  title: string
  description: string
  banner: string
}

const BenefitCard = ({
  className,
  title,
  description,
  banner,
}: IBenefitCard) => {
  return (
    <div className={classNames(styles['card'], className)}>
      <div className={styles['card-body']}>
        <h4 className={classNames(styles['card-body-title'], 'h2')}>{title}</h4>
        <p className={styles['card-body-description']}>{description}</p>
      </div>
      <div className={styles['card-banner']}>
        <Image
          className={styles['card-banner-item']}
          src={banner}
          alt={title}
          loading="lazy"
          width={0}
          height={0}
        />
      </div>
    </div>
  )
}

export default BenefitCard
