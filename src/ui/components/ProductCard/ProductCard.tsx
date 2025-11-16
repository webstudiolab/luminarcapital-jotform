import Image from 'next/image'
import classNames from 'classnames'
import Button from '@/ui/components/Button/Button'
import styles from './ProductCard.module.scss'

interface IProductCard {
  title: string
  description: string
  price: string
  image: string
  href: string
  className?: string
}

const ProductCard = ({
  title,
  description,
  price,
  image,
  href,
  className,
}: IProductCard) => {
  return (
    <div className={classNames(styles['card'], className)}>
      <div className={styles['card-image']}>
        <Image
          src={image}
          alt={title}
          width={400}
          height={400}
          loading="lazy"
          className={styles['card-image-item']}
        />
      </div>
      <div className={styles['card-content']}>
        <h3 className={styles['card-title']}>{title}</h3>
        <p className={styles['card-description']}>{description}</p>
        <div className={styles['card-footer']}>
          <span className={styles['card-price']}>{price}</span>
          <Button href={href} className={styles['card-button']}>
            Purchase
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
