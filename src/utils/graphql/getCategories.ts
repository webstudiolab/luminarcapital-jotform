import { WORDPRESS_API_PATHS } from '@/config/constants'

export const getCategories = async () => {
  const res = await fetch(
    `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.graphql}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        query GetCategories {
          categories{
				    nodes{
				      name
				      slug
				      id
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
