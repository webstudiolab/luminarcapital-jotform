import classNames from 'classnames'
import { IPost } from '@/types'
import Post from '@/ui/components/Post/Post'
import styles from './RecentArticles.module.scss'

interface IRecentArticles {
  className?: string
  title?: string
  posts: IPost[]
}

const RecentArticles = ({ className, title, posts = [] }: IRecentArticles) => {
  return (
    <section className={classNames(styles['section'], className)}>
      <div className="content-block">
        <h2 className={styles['section-title']}>{title}</h2>
        <div className="row">
          {posts.map((post) => (
            <div
              className="col-md-6 col-lg-4 col-gutter-lr"
              key={`post-${post.id}`}
            >
              <Post data={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentArticles
