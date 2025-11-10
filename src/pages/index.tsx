import Head from 'next/head'
import dynamic from 'next/dynamic'
import FinancingOptions from '@/routes/home/FinancingOptions/FinancingOptions'
import Button from '@/ui/components/Button/Button'
import CallToAction from '@/ui/components/CTA/CallToAction'
import HeroHome from '@/components/HeroHome/HeroHome'
import { useAppDispatch } from '@/hooks'
import { openModal } from '@/store/slices/modalSlice'
import { getExperienceCards, getPageBySlug } from '@/lib/wordpress'
import CTAStyles from '@/routes/home/CTA/CallToAction.module.scss'

const BoardChessOrder = dynamic(
  () => import('@/components/BoardChessOrder/BoardChessOrder'),
  { ssr: true },
)

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
  experienceCards: unknown[]
  homePageData: HomePageData
}) {
  const dispatch = useAppDispatch()
  const homeFields = homePageData?.homePageFields || {}
  const dispatch = useAppDispatch()
  const homeFields = homePageData?.homePageFields || {}

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
        banner={homeFields.heroLottieJson || '/json/Main_illust.json'}
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
        data={experienceCards}
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
  const experienceCards = await getExperienceCards()
  const pageData = await getPageBySlug('home')

  console.log('=== PAGE DATA DEBUG ===')
  console.log('Full pageData:', JSON.stringify(pageData, null, 2))
  console.log('homePageFields:', pageData?.homePageFields)
  console.log('======================')

  return {
    props: {
      experienceCards,
      pageData,
    },
    revalidate: 60,
  }
}
