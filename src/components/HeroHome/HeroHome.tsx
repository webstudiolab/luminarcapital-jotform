import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import HeroBanner from '@/ui/components/HeroBanner/HeroBanner'
import styles from './HeroHome.module.scss'

const LottieFrame = dynamic(
  () => import('@/ui/components/LottieFrame/LottieFrame'),
  {
    ssr: false,
    loading: () => (
      <HeroBanner src="/banners/hero-home-banner.svg" title="Luminar Capital" />
    ),
  },
)

interface IHeroDefault {
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
  banner?: string
}

const HeroHome = ({
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
                  <h1>{title}</h1>
                </div>
                <div className={styles['heroDefault-description']}>
                  <p className="description">{description}</p>
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

export default HeroHome
