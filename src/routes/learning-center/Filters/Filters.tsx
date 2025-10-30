import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { ICategory, IPostsState } from '@/types'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { selectPosts, setCategory, setOrder } from '@/store/slices/postsSlice'
import styles from './Filters.module.scss'
import { STATUS } from '@/config/constants'

interface IFilters {
  className?: string
  categories: ICategory[]
}

const defaultCategories: ICategory[] = [
  {
    id: null,
    name: 'All',
    slug: 'all',
  },
  {
    id: 'latest',
    name: 'Latest Posts',
    slug: 'latest-posts',
  },
]

const Filters = ({ className, categories }: IFilters) => {
  const dispatch = useAppDispatch()
  const {
    filter: { categories: selectedCategory },
    data: { nodes: posts },
    status,
  } = useAppSelector(selectPosts) as IPostsState

  const completedCategories = useMemo(() => {
    return [...defaultCategories, ...categories]
  }, [categories])

  const [currentCategory, setCurrentCategory] = useState(
    completedCategories.filter((c) => c.id === selectedCategory)[0],
  )

  useEffect(() => {
    //   Reset filters on first render
    return () => {
      setCurrentCategory(completedCategories[0])
    }
  }, [completedCategories])

  const handleSelect = useCallback(
    (category: ICategory) => {
      if (category.id === 'latest') {
        dispatch(setOrder({ order: 'desc', order_by: 'date' }))
      } else {
        dispatch(setCategory(category.id))
      }
      setCurrentCategory(category)
    },
    [dispatch],
  )

  if (posts.length == 0 && status === STATUS.FULFILLED) return null

  return (
    <section
      className={classNames(styles['filters'], className)}
      id="posts-filters"
    >
      <div className="content-block">
        <div className={styles['filters-box']}>
          <div className={styles['filters-panel']}>
            {completedCategories.map((category, index) => (
              <button
                key={`filter-${category.slug}-${index}`}
                className={classNames(
                  styles['filters-button'],
                  currentCategory.name === category.name
                    ? styles['active']
                    : null,
                )}
                onClick={() => handleSelect(category)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Filters
