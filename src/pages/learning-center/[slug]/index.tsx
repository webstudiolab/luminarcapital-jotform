import { GetStaticPaths, GetStaticPropsContext } from 'next'
import Head from 'next/head'
import Article from '@/routes/article/Article/Article'
import { IPost } from '@/types'
import { getPost } from '@/utils/axios/getPost'
import { getPosts } from '@/utils/axios/getPosts'
import RecentArticles from '@/routes/article/RecentArticles/RecentArticles'

export default function ArticlePage({
  article,
  recentArticles,
}: {
  article: IPost
  recentArticles: IPost[]
}) {
  return (
    <>
      <Head>
        <title>{article.title.rendered || 'Luminar Capital'}</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <Article data={article} />
      {recentArticles.length ? (
        <RecentArticles posts={recentArticles} title="Recent Articles" />
      ) : null}
    </>
  )
}

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const { slug } = context.params!

  const { data: articles = {} } = await getPost(slug as string)
  const { data: recentArticles } = await getPosts({ page: 1, per_page: 3 })

  return {
    props: { article: articles[0], recentArticles },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
