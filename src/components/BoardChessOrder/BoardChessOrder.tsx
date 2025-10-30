import classNames from 'classnames'
import Image from 'next/image'
import { IBoardChessOrderCard } from '@/types'
import styles from './BoardChessOrder.module.scss'

interface IBoardChessOrder {
  className?: string
  title: string
  data: IBoardChessOrderCard[]
  order: 'even' | 'odd'
}

const BoardChessOrder = ({
  className,
  title,
  data = [],
  order = 'odd',
}: IBoardChessOrder) => {
  if (data.length > 0) {
    return (
      <section
        className={classNames(
          styles['section'],
          'p-80-0 section-bg',
          className,
        )}
      >
        <div className="content-block">
          <div className="section-title text-center">
            <h2 className="h1">{title}</h2>
          </div>
          <div className={classNames(styles['section-list'], styles[order])}>
            {data.map((item, index) => (
              <div
                key={`personalized-experience-${index}`}
                className={styles['section-list-item']}
              >
                <div className="row">
                  <div className="col-md-12 col-lg-6 col-gutter-lr">
                    <div className={styles['section-content']}>
                      {item.label ? (
                        <p className={styles['section-content-label']}>
                          {item.label}
                        </p>
                      ) : null}
                      <p
                        className={classNames(
                          styles['section-content-title'],
                          'h2',
                        )}
                      >
                        {item.title}
                      </p>
                      <p className={styles['section-content-description']}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-12 col-lg-6 col-gutter-lr">
                    <div className={styles['section-banner']}>
                      <Image src={item.image} alt={item.title} fill />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return null
}

export default BoardChessOrder
