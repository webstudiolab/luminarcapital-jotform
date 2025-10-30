import axios from 'axios'
import { QUERY_PARAMETERS, WORDPRESS_API_PATHS } from '@/config/constants'
import { IFetchPosts } from '@/types'

export const getPosts = async ({
  page = 1,
  per_page = QUERY_PARAMETERS.LIMIT,
  categories,
  order,
  order_by,
}: IFetchPosts) => {
  return await axios.get(
    `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.fetch}/posts`,
    { params: { page, per_page, categories, order_by, order } },
  )
}
