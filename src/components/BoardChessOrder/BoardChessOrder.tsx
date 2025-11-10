import classNames from 'classnames'
import Image from 'next/image'
import styles from './BoardChessOrder.module.scss'

interface IBoardChessOrder {
  data: any[]
  order: 'even' | 'odd'
  title: string
  className?: string
}

interface BannerCardProps {
  data: any
  order: 'even' | 'odd'
  className?: string
}

const BannerCard = ({ data, order, className }: BannerCardProps) => {
  const imageUrl =
    data.advantageFields?.bannerImage?.node?.sourceUrl ||
    data.experienceCardFields?.image?.node?.sourceUrl ||
    ''

  return (
    <div
      className={classNames(
        styles['banner-card'],
        styles[`banner-card--${order}`],
        className,
      )}
    >
      <div className={styles['banner-card-wrapper']}>
        <div className={styles['banner-card-img']}>
          <Image
            src={imageUrl}
            alt={
              data.advantageFields?.title ||
              data.experienceCardFields?.title ||
              ''
            }
            width={600}
            height={400}
          />
        </div>
        <div className={styles['banner-card-content']}>
          <h3 className={styles['banner-card-title']}>
            {data.advantageFields?.title || data.experienceCardFields?.title}
          </h3>
          <p className={styles['banner-card-description']}>
            {data.advantageFields?.description ||
              data.experienceCardFields?.description}
          </p>
        </div>
      </div>
    </div>
  )
}

const BoardChessOrder = ({
  data,
  order,
  title,
  className,
}: IBoardChessOrder) => {
  return (
    <section className={classNames(styles['section'], className)}>
      <div className="content-block">
        <div className={styles['section-panel']}>
          <h2 className="h1">{title}</h2>
        </div>
        <div className={styles['section-panel']}>
          {data.map((item, index) => {
            const cardOrder =
              index % 2 === 0 ? order : order === 'even' ? 'odd' : 'even'
            return (
              <BannerCard
                key={`banner-card-${index}`}
                data={item}
                order={cardOrder}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BoardChessOrder
