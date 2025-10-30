import axios from 'axios'
import { WORDPRESS_API_PATHS } from '@/config/constants'

export const getCategories = async () => {
  return await axios.get(
    `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.fetch}/categories?hide_empty=true`,
  )
}
