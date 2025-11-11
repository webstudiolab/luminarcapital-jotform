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
import { getExperienceCards, getPageBySlug } from '@/lib/wordpress'

interface HomePageData {
  homePageFields?: {
    heroTitle?: string
    heroSubtitle?: string
    heroCtaText?: string
    heroCtaSecondaryText?: string
    personalizedExperienceSectionTitle?: string
  }
}

export default function Home({
  experienceCards,
  homePageData,
}: {
  experienceCards: any[]
  homePageData: HomePageData
}) {
  const dispatch = useAppDispatch()
  const homeFields = homePageData?.homePageFields || {}

  // Use WordPress data if available, otherwise use hardcoded
  const experienceData =
    experienceCards && experienceCards.length > 0
      ? experienceCards
      : personalizedExperienceData

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
        title={
          homeFields.heroTitle ||
          'Flexible financing options that fuel the growth of small businesses.'
        }
        description={
          homeFields.heroSubtitle ||
          'Do you find yourself seeking capital to expand your small business? We believe every business should have the opportunity to access the financing they need to grow.'
        }
        banner="/json/Main_illust.json"
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() =>
                dispatch(openModal({ modal: 'partner', size: 'lg' }))
              }
            >
              {homeFields.heroCtaSecondaryText || 'Become a Partner'}
            </Button>
            <Button
              onClick={() =>
                dispatch(openModal({ modal: 'financing', size: 'xl' }))
              }
            >
              {homeFields.heroCtaText || 'Apply for Financing'}
            </Button>
          </>
        }
      />
      <FinancingOptions />
      <BoardChessOrder
        title={
          homeFields.personalizedExperienceSectionTitle ||
          'A Personalized Experience'
        }
        data={experienceData}
        order="even"
        className="personalized-experience"
      />
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
  let experienceCards: any[] = []
  let homePageData: any = null

  try {
    const result = await getReviews()
    if (result?.data) reviews = result.data
  } catch (err) {
    console.warn('Skipping reviews fetch – API URL missing or invalid')
  }

  try {
    experienceCards = await getExperienceCards()
    homePageData = await getPageBySlug('home')
  } catch (err) {
    console.warn('WordPress data fetch failed, using defaults')
  }

  return {
    props: {
      reviews,
      experienceCards,
      homePageData,
    },
    revalidate: 60,
  }
}
