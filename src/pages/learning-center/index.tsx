import Head from 'next/head'
import HeroSimple from '@/components/HeroSimple/HeroSimple'
// import Filters from '@/routes/learning-center/Filters/Filters'
// import Posts from '@/routes/learning-center/Posts/Posts'
// import { ICategory } from '@/types'
import { getCategories } from '@/utils/axios/getCategories'
import InformBox from '@/ui/components/InformBox/InformBox'

// interface ILearningCenter {
//   categories: ICategory[]
// }

// export default function LearningCenter({ categories }: ILearningCenter) {
export default function LearningCenter() {
  return (
    <>
      <Head>
        <title>Learning Center - Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroSimple
        title="Luminar Learning Center"
        description="There are many options when it comes to financing for your business. We offer resources that can help take the complexity out of the process to ensure you find the best product suited for your needs."
      />
      <InformBox
        title="Coming Soon!"
        description="Exciting things are on the way - stay tuned!"
      />
      {/*<Filters categories={categories} />*/}
      {/*<Posts />*/}
    </>
  )
}

export const getStaticProps = async () => {
  let categories = []
  try {
    const result = await getCategories()
    if (result?.data) categories = result.data
  } catch (err) {
    console.warn('Skipping categories fetch – API URL missing or invalid')
  }
  return {
    props: {
      categories,
    },
  }
}
