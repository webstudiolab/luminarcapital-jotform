import { useCallback, useEffect, useState, ChangeEvent, useRef } from 'react'
import classNames from 'classnames'
import Post from '@/ui/components/Post/Post'
import Pagination from '@/components/Pagination/Pagination'
import { IPostsState } from '@/types'
import InformBox from '@/ui/components/InformBox/InformBox'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  fetchPosts,
  resetFilter,
  selectPosts,
  setPage,
} from '@/store/slices/postsSlice'
import { QUERY_PARAMETERS, STATUS } from '@/config/constants'
import PostsSkeleton from '@/ui/components/skeleton/PostsSkeleton/PostsSkeleton'
import styles from './Posts.module.scss'
import { scrollTo } from '@/utils/window/scrollTo'

const Posts = ({ className }: { className?: string }) => {
  const dispatch = useAppDispatch()
  const {
    data: { nodes: posts = [], pageInfo },
    filter: { page, categories, order, order_by },
    status,
  } = useAppSelector(selectPosts) as IPostsState
  const [totalPages, setTotalPages] = useState<number>(0)
  const ref = useRef<HTMLElement | null>(null)
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  useEffect(() => {
    return () => {
      dispatch(resetFilter())
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchPosts({ page: page as number, categories, order, order_by }))
  }, [dispatch, categories, page, order, order_by])

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)
      return
    }

    setTimeout(() => scrollTo('posts-filters'), 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Save totalPages in state
  useEffect(() => {
    if (
      (pageInfo.totalPages && totalPages !== pageInfo.totalPages) ||
      pageInfo.totalPages === 0
    ) {
      setTotalPages(pageInfo.totalPages as number)
    }
  }, [pageInfo.totalPages, totalPages])

  const handlePageChange = useCallback(
    (event: ChangeEvent<unknown>, newPage: number) => {
      event.preventDefault()
      dispatch(setPage(newPage))
    },
    [dispatch],
  )

  const isDataLoading = status === STATUS.PENDING || status === STATUS.IDLE
  const isDataLoaded = posts.length > 0 && status === STATUS.FULFILLED
  const isEmptyData = posts.length === 0 && status === STATUS.FULFILLED

  return (
    <section
      ref={ref}
      className={classNames(styles['posts'], 'posts', className)}
      id="posts"
    >
      <div className="content-block">
        <div className={styles['posts-list']}>
          <div className="row">
            {isDataLoading ? (
              <PostsSkeleton count={QUERY_PARAMETERS.LIMIT} />
            ) : null}
            {isDataLoaded ? (
              posts.map((post) => (
                <div
                  className="col-md-6 col-lg-4 col-gutter-lr"
                  key={`post-${post.id}`}
                >
                  <Post data={post} />
                </div>
              ))
            ) : isEmptyData ? (
              <div className="col-xs-12">
                <InformBox
                  title="No articles"
                  description="Sorry, there is no data available"
                />
              </div>
            ) : (
              <PostsSkeleton count={QUERY_PARAMETERS.LIMIT} />
            )}
          </div>
        </div>
        {!order && !order_by ? (
          <Pagination
            page={page}
            onChange={handlePageChange}
            count={totalPages}
          />
        ) : null}
      </div>
    </section>
  )
}

export default Posts
