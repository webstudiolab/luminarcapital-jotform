import classNames from 'classnames'
import styles from './Burger.module.scss'

interface IBurger {
  className?: string
  isActive: boolean
  onClick?: () => void
}

const Burger = ({ className, isActive, onClick }: IBurger) => {
  return (
    <button
      type="button"
      aria-label={isActive ? 'Close menu' : 'Open menu'}
      aria-expanded={isActive}
      aria-controls="main-navigation"
      className={classNames(
        styles['burger'],
        isActive ? styles['active'] : null,
        className,
      )}
      onClick={onClick}
    >
      <div className={styles['burger-box']} aria-hidden="true">
        <div className={styles['burger-box-arrow']} />
        <div className={styles['burger-box-arrow']} />
        <div className={styles['burger-box-arrow']} />
      </div>
    </button>
  )
}

export default Burger
