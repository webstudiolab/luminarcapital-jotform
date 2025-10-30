import classNames from 'classnames'
import Image from 'next/image'
import styles from './InformBox.module.scss'

interface IInformBox {
  className?: string
  title: string
  description?: string
}

const InformBox = ({ className, title, description }: IInformBox) => {
  return (
    <section className={classNames(styles['section'], 'informBox', className)}>
      <div className="content-block">
        <div className={styles['section-box']}>
          <div className={styles['section-box-icon']}>
            <Image src="/logo_icon.svg" alt={title} fill />
          </div>
          <p className={classNames(styles['section-box-title'], 'h2')}>
            {title}
          </p>
          <p className={styles['section-box-description']}>{description}</p>
        </div>
      </div>
    </section>
  )
}

export default InformBox
