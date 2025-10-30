import axios from 'axios'

export const getReviews = async () => {
  return await axios.get(
    `${process.env.WORDPRESS_API_URL!}/wp-json/google-reviews/v1/reviews?limit=99&min_rating=4`,
  )
}
