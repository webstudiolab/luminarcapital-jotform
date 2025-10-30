import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import Image from 'next/image'
import BecomeAPartnerDefaultForm from '@/components/forms/BecomeAPartnerDefault/BecomeAPartnerDefaultForm'
import ApplyForFinancingDefaultForm from '@/components/forms/ApplyForFinancingDefault/ApplyForFinancingDefaultForm'
import { ITab } from '@/types'
import Tabs from '@/ui/components/Tabs/Tabs'
import styles from './DefaultForms.module.scss'

interface IDefaultForms {
  className?: string
}

const tabs: ITab[] = [
  { title: 'Become a Partner', value: 0 },
  { title: 'Apply for Financing', value: 1 },
]

const forms = {
  0: <BecomeAPartnerDefaultForm />,
  1: <ApplyForFinancingDefaultForm />,
}

const DefaultForms = ({ className }: IDefaultForms) => {
  const router = useRouter()
  const {
    query: { origin = '0' },
  } = router
  const activeIndex = Number(origin)

  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (router.query.scroll) {
      ref.current?.scrollIntoView()
    }
  }, [router.query.scroll])

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

  return (
    <section ref={ref} className={classNames(styles['section'], className)}>
      <div className="content-block">
        <div className={styles['section-box']}>
          <div className={styles['section-box-header']}>
            <div className={styles['section-box-icon']}>
              <Image src="/logo_icon.svg" alt="Let's get in touch!" fill />
            </div>
            <h3 className={classNames(styles['section-box-title'], 'h2')}>
              Let&apos;s get in touch!
            </h3>
            <p className={styles['section-box-description']}>
              Illuminate your company with Luminar Capital today.
            </p>
          </div>
          <Tabs
            data={tabs}
            onSwitch={handleFormSwitch}
            activeTab={origin as string}
          />
          <div className={styles['section-box-form']}>
            {forms[activeIndex as keyof typeof forms]}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DefaultForms
