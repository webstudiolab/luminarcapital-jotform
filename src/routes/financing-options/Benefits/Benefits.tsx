import { createElement, useEffect, useRef } from 'react'
import classNames from 'classnames'
import styles from './Benefits.module.scss'
import { getIconComponent } from '@/lib/iconMap'
import { useRouter } from 'next/router'

interface BenefitFields {
  title?: string
  description?: string
  icon?: string
}

interface Benefit {
  id: string
  benefitFields?: BenefitFields
}

interface IBenefits {
  className?: string
  benefits: Benefit[]
  sectionTitle?: string
}

const Benefits = ({ className, benefits, sectionTitle }: IBenefits) => {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (router.query.scroll === 'benefits' && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [router.query])

  const sortedBenefits = [...benefits].sort(
    (a, b) =>
      ((a.benefitFields?.order as number) || 999) -
      ((b.benefitFields?.order as number) || 999),
  )

  return (
    <section
      ref={sectionRef}
      className={classNames(styles['section'], className)}
    >
      <div className="content-block">
        <div className={styles['section-panel']}>
          <h2 className="h1">
            {sectionTitle || 'Benefits of Financing Options'}
          </h2>
        </div>
        <div className={styles['section-panel']}>
          <div className="row">
            {sortedBenefits.map((benefit, index) => {
              const fields = benefit.benefitFields
              const iconName = fields?.icon || 'check'
              const IconComponent = getIconComponent(iconName)

              return (
                <div
                  key={`benefit-card-${index}`}
                  className="col-xs-12 col-lg-6"
                >
                  <div className={styles['benefit-card']}>
                    <div className={styles['benefit-card-icon']}>
                      {createElement(IconComponent)}
                    </div>
                    <div className={styles['benefit-card-content']}>
                      <h3 className={styles['benefit-card-title']}>
                        {fields?.title}
                      </h3>
                      <p className={styles['benefit-card-description']}>
                        {fields?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits
