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
  const apiUrl =
    process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
    `${process.env.WORDPRESS_API_URL}/${WORDPRESS_API_PATHS.graphql}`

  try {
    const res = await fetch(apiUrl, {
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
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('WordPress API Error:', res.status, res.statusText)
      throw new Error(`Failed to fetch posts: ${res.status}`)
    }

    const { data, errors } = await res.json()

    if (errors) {
      console.error('GraphQL Errors:', errors)
      throw new Error('GraphQL query failed')
    }

    return data
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: { nodes: [], pageInfo: {} } }
  }
}
