import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import classNames from 'classnames'
import styles from './PostsSkeleton.module.scss'

interface IPostsSkeleton {
  className?: string
  count?: number
}

const PostsSkeleton = ({ className, count = 3 }: IPostsSkeleton) => {
  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <>
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <div
            key={`post-skeleton-${index}`}
            className="col-xs-12 col-md-6 col-lg-4 col-gutter-lr"
          >
            <Skeleton
              borderRadius={10}
              className={classNames(styles['skeleton'], className)}
              baseColor="#EDEFF7"
            />
          </div>
        ))}
    </>
  )
}

export default PostsSkeleton
