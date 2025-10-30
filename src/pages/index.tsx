import Head from 'next/head'
import FinancingOptions from '@/routes/home/FinancingOptions/FinancingOptions'
import Button from '@/ui/components/Button/Button'
import CallToAction from '@/ui/components/CTA/CallToAction'
import HeroHome from '@/components/HeroHome/HeroHome'
import { useAppDispatch } from '@/hooks'
import { openModal } from '@/store/slices/modalSlice'
import BoardChessOrder from '@/components/BoardChessOrder/BoardChessOrder'
import { personalizedExperienceData } from '@/routes/home/personalizedExperienceData'
import { getReviews } from '@/utils/axios/getReviews'
import { IGoogleReview } from '@/types'
import CTAStyles from '@/routes/home/CTA/CallToAction.module.scss'

export default function Home() {
  const dispatch = useAppDispatch()
  return (
    <>
      <Head>
        <title>Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroHome
        title="Flexible financing options that fuel the growth of small businesses."
        description="Do you find yourself seeking capital to expand your small business? We believe every business should have the opportunity to access the financing they need to grow."
        banner="/json/Main_illust.json"
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() =>
                dispatch(openModal({ modal: 'partner', size: 'lg' }))
              }
            >
              Become a Partner
            </Button>
            <Button
              onClick={() =>
                dispatch(openModal({ modal: 'financing', size: 'xl' }))
              }
            >
              Apply for Financing
            </Button>
          </>
        }
      />
      <FinancingOptions />
      <BoardChessOrder
        title="A Personalized Experience"
        data={personalizedExperienceData}
        order="even"
        className="personalized-experience"
      />
      {/* Hide Google Reviews
      <ClientReviews data={reviews} />
      */}
      <CallToAction
        title="Ready To Secure Business Financing?"
        description="Contact us and connect with one of our financing professionals that can help you navigate through the steps!"
        link={{ label: 'Get in Touch', href: '/contact' }}
        className={CTAStyles['section']}
      />
    </>
  )
}

export const getStaticProps = async () => {
  let reviews: IGoogleReview[] = []
  try {
    const result = await getReviews()
    if (result?.data) reviews = result.data
  } catch (err) {
    console.warn('Skipping reviews fetch – API URL missing or invalid')
  }
  return {
    props: {
      reviews,
    },
  }
}
