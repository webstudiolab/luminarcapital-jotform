import classNames from 'classnames'
import Image from 'next/image'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import ArrowRightIcon from '@/ui/icons/ArrowRight'
import styles from './CTASolid.module.scss'
import { openModal } from '@/store/slices/modalSlice'

interface ICTASolid {
  className?: string
}

const CTASolid = ({ className }: ICTASolid) => {
  const dispatch = useAppDispatch()

  return (
    <section className={classNames(styles['section'], className)}>
      <div className="content-block">
        <div className={styles['section-box']}>
          <div className="row">
            <div className="col-xs-12 col-lg-6 col-gutter-lr">
              <div className={styles['section-box-content']}>
                <p className={classNames(styles['section-title'], 'h1')}>
                  What do you need to qualify?
                </p>
                <ul className={styles['section-list']}>
                  <li className={styles['section-list-item']}>
                    <ArrowRightIcon className={styles['section-list-icon']} />
                    Annual gross sales exceeding $150,000
                  </li>
                  <li className={styles['section-list-item']}>
                    <ArrowRightIcon className={styles['section-list-icon']} />
                    Time in business of at least 12 months
                  </li>
                  <li className={styles['section-list-item']}>
                    <ArrowRightIcon className={styles['section-list-icon']} />
                    Credit score exceeding 520
                  </li>
                </ul>
                <Button
                  color="white"
                  className={styles['section-action']}
                  onClick={() =>
                    dispatch(openModal({ modal: 'financing', size: 'xl' }))
                  }
                >
                  Apply for Financing
                </Button>
              </div>
            </div>
            <div className="col-xs-12 col-lg-6 col-gutter-lr">
              <div className={styles['section-box-banner']}>
                <Image
                  src="/banners/cta-solid-banner.svg"
                  alt="What do you need to qualify?"
                  width={0}
                  height={0}
                  loading="lazy"
                  className={styles['section-box-banner-item']}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASolid
