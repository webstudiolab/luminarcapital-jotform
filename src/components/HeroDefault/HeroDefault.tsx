import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import styles from './HeroDefault.module.scss'

const LottieFrame = dynamic(
  () => import('@/ui/components/LottieFrame/LottieFrame'),
  {
    ssr: false,
  },
)

interface IHeroDefault {
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
  banner?: string
}

const HeroDefault = ({
  className,
  title,
  description,
  banner,
  actions,
}: IHeroDefault) => {
  return (
    <>
      <div className={styles['heroDefault-abstract']} />
      <section className={classNames(styles['heroDefault'], className)}>
        <div className="content-block">
          <div className="row">
            <div className="col-xs-12 col-lg-6 col-gutter-lr">
              <div className={styles['heroDefault-content']}>
                <div className={styles['heroDefault-title']}>
                  <h1 className="font-display">{title}</h1>
                </div>
                <div className={styles['heroDefault-description']}>
                  <p>{description}</p>
                </div>
                <div className={styles['heroDefault-actions']}>{actions}</div>
              </div>
            </div>
            <div className="col-xs-12 col-lg-6 col-gutter-lr">
              <div className={styles['heroDefault-banner']}>
                <LottieFrame data={banner} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroDefault
