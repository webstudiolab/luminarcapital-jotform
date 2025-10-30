import classNames from 'classnames'
import styles from './HeroSimple.module.scss'

interface IHeroSimple {
  className?: string
  title?: string
  description?: string
}

const HeroSimple = ({ className, title, description }: IHeroSimple) => {
  return (
    <section className={classNames(styles['heroSimple'], className)}>
      <div className="content-block">
        <div className={styles['heroSimple-box']}>
          <h1
            className={classNames(styles['heroSimple-title'], 'font-display')}
          >
            {title}
          </h1>
          <p className={styles['heroSimple-description']}>{description}</p>
        </div>
      </div>
    </section>
  )
}

export default HeroSimple
