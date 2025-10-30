import { ChangeEvent } from 'react'
import classNames from 'classnames'
import usePagination from '@mui/material/usePagination'
import styles from './Pagination.module.scss'

interface IPagination {
  className?: string
  page: number
  count: number
  onChange: (event: ChangeEvent<unknown>, page: number) => void | null // eslint-disable-line no-unused-vars
}

const Pagination = ({ className, page, count, onChange }: IPagination) => {
  const { items } = usePagination({
    count,
    page,
    onChange,
  })

  return (
    <div className={classNames(styles['pagination'], className)}>
      <div className={styles['pagination-panel']}>
        {items.map(({ page, type, selected, ...item }, index) => {
          let children = null

          if (type === 'start-ellipsis' || type === 'end-ellipsis') {
            children = '…'
          } else if (type === 'page') {
            children = (
              <span
                className={classNames(
                  styles['pagination-page-link'],
                  selected ? styles['active'] : '',
                )}
                {...item}
              >
                {page}
              </span>
            )
          }

          return (
            <li key={index} className={styles['pagination-page']}>
              {children}
            </li>
          )
        })}
      </div>
    </div>
  )
}

export default Pagination
