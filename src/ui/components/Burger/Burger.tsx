import classNames from 'classnames'
import styles from './Burger.module.scss'

interface IBurger {
  className?: string
  isActive: boolean
  onClick?: () => void
}

const Burger = ({ className, isActive, onClick }: IBurger) => {
  return (
    <div
      className={classNames(
        styles['burger'],
        isActive ? styles['active'] : null,
        className,
      )}
      onClick={onClick}
    >
      <div className={styles['burger-box']}>
        <div className={styles['burger-box-arrow']} />
        <div className={styles['burger-box-arrow']} />
        <div className={styles['burger-box-arrow']} />
      </div>
    </div>
  )
}

export default Burger
