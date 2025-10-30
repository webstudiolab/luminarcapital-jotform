import { QUERY_PARAMETERS, WORDPRESS_API_PATHS } from '@/config/constants'

interface IGetPosts {
  category: string
  limit?: number
  not?: string
}

export const getPosts = async ({
  category = '',
  limit = QUERY_PARAMETERS.LIMIT,
  not = '',
}: IGetPosts) => {
  const res = await fetch(
    `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.graphql}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        query GetPosts {
          posts(first: ${limit}, where: { categoryName: "${category}", orderby: { field: DATE, order: DESC }, notIn: "${not}" }) {
            nodes {
              id
              slug
              title
              excerpt(format: RENDERED)
              date
              featuredImage {
                node {
                  sourceUrl(size: LARGE)
                }
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
    `,
      }),
      next: {
        revalidate: 0,
      },
    },
  )

  const { data } = await res.json()

  return data
}
