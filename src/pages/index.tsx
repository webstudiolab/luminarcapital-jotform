import Head from 'next/head'
import FinancingOptions from '@/routes/home/FinancingOptions/FinancingOptions'
import Button from '@/ui/components/Button/Button'
import CallToAction from '@/ui/components/CTA/CallToAction'
import HeroHome from '@/components/HeroHome/HeroHome'
import { useAppDispatch } from '@/hooks'
import { openModal } from '@/store/slices/modalSlice'
import BoardChessOrder from '@/components/BoardChessOrder/BoardChessOrder'
import { personalizedExperienceData } from '@/routes/home/personalizedExperienceData'
import { IBoardChessOrderCard } from '@/types'
import CTAStyles from '@/routes/home/CTA/CallToAction.module.scss'
import { getExperienceCards, getPageBySlug } from '@/lib/wordpress'

interface HomePageData {
  homePageFields?: {
    heroTitle?: string
    heroSubtitle?: string
    heroCtaText?: string
    heroCtaSecondaryText?: string
    heroBannerImage?: {
      node?: {
        sourceUrl?: string
      }
    }
    heroLottieJson?: {
      node?: {
        mediaItemUrl?: string
      }
    }
    financingSectionTitle?: string
    financingSectionDescription?: string
    reviewsSectionTitle?: string
    personalizedExperienceSectionTitle?: string
  }
}

interface HomeProps {
  experienceCards: IBoardChessOrderCard[]
  pageData: HomePageData | null
}

export default function Home({ experienceCards, pageData }: HomeProps) {
  const dispatch = useAppDispatch()
  const pageFields = pageData?.homePageFields || {}

  // Use WordPress if we have 3 cards with all fields, otherwise hardcoded
  const experienceData =
    experienceCards && 
    experienceCards.length >= 3 &&
    experienceCards[0].image &&
    experienceCards[0].label
      ? experienceCards.slice(0, 3)
      : personalizedExperienceData

  // Determine banner - Lottie JSON takes priority, then image, then hardcoded
  const heroBanner = 
    pageFields.heroLottieJson?.node?.mediaItemUrl ||
    pageFields.heroBannerImage?.node?.sourceUrl ||
    '/json/Main_illust.json'

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
          pageFields.heroTitle ||
          'Flexible financing options that fuel the growth of small businesses.'
        }
        description={
          pageFields.heroSubtitle ||
          'Do you find yourself seeking capital to expand your small business? We believe every business should have the opportunity to access the financing they need to grow.'
        }
        banner={heroBanner}
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() =>
                dispatch(openModal({ modal: 'partner', size: 'lg' }))
              }
            >
              {pageFields.heroCtaSecondaryText || 'Become a Partner'}
            </Button>
            <Button
              onClick={() =>
                dispatch(openModal({ modal: 'financing', size: 'xl' }))
              }
            >
              {pageFields.heroCtaText || 'Apply for Financing'}
            </Button>
          </>
        }
      />
      <FinancingOptions />
      <BoardChessOrder
        title={
          pageFields.personalizedExperienceSectionTitle ||
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
  let experienceCards: IBoardChessOrderCard[] = []
  let pageData: HomePageData | null = null

  try {
    experienceCards = await getExperienceCards()
    pageData = (await getPageBySlug('home')) as HomePageData | null
  } catch (err) {
    console.warn('WordPress fetch failed, using fallback data')
  }

  return {
    props: {
      experienceCards,
      pageData,
    },
    revalidate: 60,
  }
}
