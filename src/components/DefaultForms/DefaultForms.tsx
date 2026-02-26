import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import Image from 'next/image'
import { useAppDispatch } from '@/hooks'
import { openModal } from '@/store/slices/modalSlice'
import BecomeAPartnerDefaultForm from '@/components/forms/BecomeAPartnerDefault/BecomeAPartnerDefaultForm'
import { ITab } from '@/types'
import Tabs from '@/ui/components/Tabs/Tabs'
import Button from '@/ui/components/Button/Button'
import styles from './DefaultForms.module.scss'

interface IDefaultForms {
  className?: string
}

const tabs: ITab[] = [
  { title: 'Become a Partner', value: 0 },
  { title: 'Apply for Financing', value: 1 },
]

const DefaultForms = ({ className }: IDefaultForms) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
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
            {activeIndex === 0 && <BecomeAPartnerDefaultForm />}
            {activeIndex === 1 && (
              <div className={styles['section-box-jotform']}>
                <p className={styles['section-box-jotform-text']}>
                  Ready to apply? Our multi-step application takes just a few minutes to complete.
                </p>
                <Button
                  onClick={() =>
                    dispatch(openModal({ modal: 'jotform', size: 'xl' }))
                  }
                >
                  Start Your Application
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DefaultForms
