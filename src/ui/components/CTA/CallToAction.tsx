import classNames from 'classnames'
import Button from '@/ui/components/Button/Button'
import styles from './CallToAction.module.scss'

interface ICallToAction {
  className?: string
  title: string
  description: string
  link?: {
    label: string
    href: string
  }
}

const CallToAction = ({
  className,
  title,
  description,
  link,
}: ICallToAction) => {
  return (
    <section className={classNames(styles['section'], className)}>
      <div className="content-block">
        <div className={styles['section-box']}>
          <h3 className={classNames(styles['section-title'], 'h1')}>{title}</h3>
          <p className={styles['section-description']}>{description}</p>
          {link ? (
            <div className={styles['section-action']}>
              <Button
                href={link.href}
                className={styles['section-action-item']}
              >
                {link.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default CallToAction
