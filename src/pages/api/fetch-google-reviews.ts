import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { IGoogleReview } from '@/types'

type Data = {
  reviews: IGoogleReview[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const key = 'AIzaSyAyz-ib4McsLXBTjFg9U4w2PAkOQqivqkQ'
  const placeId = 'ChIJzwAKy8WxEmsRh-SqQrC5mnk'

  const config = {
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${key}`,
  }

  const reviews = await axios(config)
    .then((response) => {
      return response.data.result.reviews
    })
    .catch((error) => {
      console.error('Error fetching Google reviews:', error)
    })

  res.status(200).json({ reviews: reviews })
}
