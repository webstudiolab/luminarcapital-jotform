import { WORDPRESS_API_PATHS } from '@/config/constants'

export const getPost = async (slug: string) => {
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
          query GetPost {
            post(id:"${slug}", idType: SLUG) {
              id
              title
              content
              featuredImage {
                node {
                  mediaItemUrl
                }
              }
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('WordPress API Error:', res.status, res.statusText)
      throw new Error(`Failed to fetch post: ${res.status}`)
    }

    const { data, errors } = await res.json()

    if (errors) {
      console.error('GraphQL Errors:', errors)
      throw new Error('GraphQL query failed')
    }

    return data
  } catch (error) {
    console.error('Error fetching post:', error)
    return { post: null }
  }
}
