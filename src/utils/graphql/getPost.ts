import { WORDPRESS_API_PATHS } from '@/config/constants'

export const getPost = async (slug: string) => {
  const res = await fetch(
    `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.graphql}`,
    {
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
      next: {
        revalidate: 0,
      },
    },
  )

  const { data } = await res.json()

  return data
}
