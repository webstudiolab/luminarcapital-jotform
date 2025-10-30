import classNames from 'classnames'
import Image from 'next/image'
import Rating from '@mui/material/Rating'
import { IGoogleReview } from '@/types'
import styles from './ReviewBox.module.scss'

interface IReviewBox {
  className?: string
  data: IGoogleReview
  isActive?: boolean
}

const ReviewBox = ({ className, data, isActive }: IReviewBox) => {
  return (
    <div
      className={classNames(
        styles['box'],
        isActive ? styles['active'] : null,
        className,
      )}
    >
      <div className={styles['box-header']}>
        <div className={styles['box-header-avatar']}>
          <Image
            src={data.profile_photo_url}
            alt={data.author_name}
            fill
            sizes="40rem"
          />
        </div>
        <div className={styles['box-header-content']}>
          <p className={styles['box-header-title']}>{data.author_name}</p>
          <Rating
            className={styles['box-header-rating']}
            name={`Review rating ${data.id}`}
            value={Number(data.rating)}
            readOnly
          />
        </div>
      </div>
      <div className={styles['box-body']}>
        <p className={styles['box-body-item']}>{data.text}</p>
      </div>
    </div>
  )
}

export default ReviewBox
