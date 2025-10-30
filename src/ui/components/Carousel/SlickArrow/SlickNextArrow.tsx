import classNames from 'classnames'
import { ISlickArrow } from '@/types'
import ArrowRightIcon from '@/ui/icons/ArrowRight'
import styles from './SlickArrow.module.scss'

const SlickNextArrow = (props: ISlickArrow) => {
  const { className, style, onClick } = props
  return (
    <div
      className={classNames(styles['arrow'], styles['arrow-next'], className)}
      style={{ ...style }}
      onClick={onClick}
    >
      <ArrowRightIcon />
    </div>
  )
}

export default SlickNextArrow
