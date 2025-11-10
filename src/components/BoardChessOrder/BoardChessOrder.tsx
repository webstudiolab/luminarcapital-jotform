import classNames from 'classnames'
import Image from 'next/image'
import styles from './BoardChessOrder.module.scss'

interface IBoardChessOrder {
  className?: string
  title: string
  data: any[] // WordPress data
  order: 'even' | 'odd'
}

const BoardChessOrder = ({
  className,
  title,
  data = [],
  order = 'odd',
}: IBoardChessOrder) => {
  
  // Transform WordPress data to component format
  const formattedData = data.map((item: any) => {
    // Check if it's advantages or experience cards based on fields
    const isAdvantage = item.advantageFields
    const isExperienceCard = item.experienceCardFields
    
    if (isAdvantage) {
      return {
        title: item.title,
        description: item.content?.replace(/<[^>]*>/g, '') || '',
        image: item.advantageFields?.bannerImage?.node?.sourceUrl || '',
        label: undefined
      }
    }
    
    if (isExperienceCard) {
      return {
        title: item.title,
        description: item.content?.replace(/<[^>]*>/g, '') || '',
        image: item.experienceCardFields?.bannerImage?.node?.sourceUrl || '',
        label: item.experienceCardFields?.label || undefined
      }
    }
    
    return {
      title: item.title,
      description: item.content?.replace(/<[^>]*>/g, '') || '',
      image: '',
      label: undefined
    }
  })
  
  if (formattedData.length > 0) {
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
            {formattedData.map((item, index) => (
              <div
                key={`board-chess-item-${index}`}
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
                      {item.image && (
                        <Image src={item.image} alt={item.title} fill />
                      )}
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
