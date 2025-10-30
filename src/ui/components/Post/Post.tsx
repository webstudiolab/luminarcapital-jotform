import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/ui/components/Button/Button'
import ArrowRightIcon from '@/ui/icons/ArrowRight'
import { dateConverter } from '@/utils/dateConverter'
import { IPost } from '@/types'
import styles from './Post.module.scss'

const Post = ({ className, data }: { className?: string; data: IPost }) => {
  const { slug, excerpt, date, title, featured_image_src_medium } = data

  return (
    <div className={classNames(styles['post'], className)}>
      <Link href={`/learning-center/${slug}`} className={styles['post-thumb']}>
        {featured_image_src_medium ? (
          <Image
            src={featured_image_src_medium}
            alt={title.rendered}
            fill
            sizes="(min-width: 601px) 390rem, (max-width: 600px) 350rem"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            loading="lazy"
          />
        ) : null}
      </Link>
      <div className={styles['post-body']}>
        <p className={styles['post-body-title']}>{title.rendered}</p>
        <div
          className={styles['post-body-description']}
          dangerouslySetInnerHTML={{ __html: excerpt.rendered }}
        />
        <p className={styles['post-body-date']}>
          {dateConverter(date as string)}
        </p>
        <Button
          variant="link"
          icon={ArrowRightIcon}
          iconPosition="right"
          size="lg"
          className={styles['post-body-action']}
          href={`/learning-center/${slug}`}
        >
          See more
        </Button>
      </div>
    </div>
  )
}

export default Post
