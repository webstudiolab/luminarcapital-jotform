import classNames from 'classnames'
import { ISlickArrow } from '@/types'
import Button from '@/ui/components/Button/Button'
import styles from './SlickArrowPagination.module.scss'

const SlickPrevArrowPagination = (props: ISlickArrow) => {
  const { className, style, onClick } = props

  return (
    <Button
      {...style}
      className={classNames(
        styles['arrow'],
        styles['arrow-prev'],
        !onClick ? styles['hidden'] : null,
        className,
      )}
      onClick={onClick}
      variant="outlined"
    >
      Back
    </Button>
  )
}

export default SlickPrevArrowPagination
