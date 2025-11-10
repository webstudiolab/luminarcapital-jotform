'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { ITab } from '@/types'
import BenefitCard from '@/ui/components/BenefitCard/BenefitCard'
import styles from './Benefits.module.scss'
import { scrollTo } from '@/utils/window/scrollTo'

interface IBenefits {
  className?: string
  benefits?: any[] // WordPress data
}

const tabs: ITab[] = [
  { title: 'Revenue Based Financing', value: 0 },
  { title: 'Early Repayment Discounts', value: 1 },
  { title: 'Revolving Working Capital', value: 2 },
]

const Benefits = ({ className, benefits, sectionTitle }: IBenefits & { sectionTitle?: string }) => {
  const router = useRouter()
  const {
    query: { origin = '0' },
  } = router
  const activeIndex = Number(origin)
  const ref = useRef<HTMLElement | null>(null)

  const handleFormSwitch = useCallback(
    (index: string) => {
      router.replace(
        {
          pathname: router.pathname,
          query: { origin: index },
        },
        undefined,
        { scroll: false },
      )
    },
    [router],
  )

  useEffect(() => {
    if (router.query.scroll) {
      ref.current?.scrollIntoView()
    }
  }, [router.query.scroll])

  useEffect(() => {
    if (router.query.origin && !router.query.scroll) {
      scrollTo('benefits-description')
    }
  }, [router.query.origin])

  // Group benefits by category (0, 1, or 2) based on order
  // Orders 1-3 = category 0, orders 4-5 = category 1, orders 6-7 = category 2
  const groupedBenefits = benefits.reduce((acc: any, benefit: any) => {
    const order = benefit.benefitFields?.order || 0
    let category = 0
    
    if (order >= 1 && order <= 3) category = 0
    else if (order >= 4 && order <= 5) category = 1
    else if (order >= 6 && order <= 7) category = 2
    
    if (!acc[category]) acc[category] = []
    acc[category].push(benefit)
    return acc
  }, {})

  const currentBenefits = groupedBenefits[activeIndex] || []

  return (
    <section
      ref={ref}
      className={classNames(styles['section'], 'p-100-0', className)}
      id="benefits"
    >
      <div className="content-block">
        <div
          className={classNames(
            styles['section-title'],
            'section-title text-center',
          )}
        >
          <h2 className="h1">{sectionTitle || 'Benefits of Financing Options'}</h2>
        </div>
        <div
          className="section-description text-center"
          id="benefits-description"
        >
          <p>Click on an option below to learn more!</p>
        </div>
      </div>
      <div className={styles['section-tabs']}>
        <div className={styles['section-tabs-panel']}>
          {tabs.map((tab, index) => (
            <div
              key={`financing-tab-${index}`}
              className={classNames(
                styles['tab'],
                activeIndex === tab.value ? styles['active'] : null,
              )}
              onClick={() => handleFormSwitch(String(tab.value))}
            >
              {tab.title}
            </div>
          ))}
        </div>
      </div>
      <div className={styles['section-list']}>
        <div className="content-block">
          <div className="row center-lg">
            {currentBenefits.map((benefit: any, index: number) => (
              <div
                key={`benefit-card-${index}`}
                className="col-xs-12 col-lg-6"
              >
                <BenefitCard
                  title={benefit.title}
                  description={benefit.content.replace(/<[^>]*>/g, '')} // Strip HTML tags
                  banner={benefit.benefitFields?.iconSvg?.node?.sourceUrl || ''}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits
