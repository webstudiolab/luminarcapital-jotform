import classNames from 'classnames'
import { ISlickArrow } from '@/types'
import ArrowLeftIcon from '@/ui/icons/ArrowLeft'
import styles from './SlickArrow.module.scss'

const SlickPrevArrow = (props: ISlickArrow) => {
  const { className, style, onClick } = props
  return (
    <button
      type="button"
      aria-label="Previous slide"
      className={classNames(styles['arrow'], styles['arrow-prev'], className)}
      style={{ ...style }}
      onClick={onClick}
    >
      <ArrowLeftIcon aria-hidden="true" />
    </button>
  )
}

export default SlickPrevArrow
