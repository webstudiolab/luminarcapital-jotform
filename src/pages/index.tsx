import Head from 'next/head'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import BoardChessOrder from '@/components/BoardChessOrder/BoardChessOrder'
import CTASolid from '@/ui/components/CTASolid/CTASolid'
import { openModal } from '@/store/slices/modalSlice'
import { getExperienceCards, getPageBySlug } from '@/lib/wordpress'

interface HomePageData {
  homePageFields?: {
    heroTitle?: string
    heroSubtitle?: string
    heroCtaText?: string
    heroCtaSecondaryText?: string
    personalizedExperienceSectionTitle?: string
    heroLottieJson?: {
      node?: {
        mediaItemUrl?: string
      }
    }
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

  return (
    <>
      <Head>
        <title>Luminar Capital - Flexible Financing Solutions</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroDefault
        title={
          homeFields.heroTitle ||
          'Flexible financing options that fuel the growth of small businesses.'
        }
        description={
          homeFields.heroSubtitle ||
          'Do you find yourself seeking capital to expand your small business? We believe every business should have the opportunity to access the financing they need to grow.'
        }
        banner={
          homeFields.heroLottieJson?.node?.mediaItemUrl ||
          '/json/Main_illust.json'
        }
        actions={
          <>
            <Button
              onClick={() =>
                dispatch(openModal({ modal: 'financing', size: 'xl' }))
              }
            >
              {homeFields.heroCtaText || 'Apply for Financing'}
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                dispatch(openModal({ modal: 'partner', size: 'lg' }))
              }
            >
              {homeFields.heroCtaSecondaryText || 'Become a Partner'}
            </Button>
          </>
        }
      />
      <BoardChessOrder
        title={
          homeFields.personalizedExperienceSectionTitle ||
          'A Personalized Experience'
        }
        data={experienceCards}
        order="even"
        className="personalized-experience"
      />
      <CTASolid />
    </>
  )
}

export const getStaticProps = async () => {
  const experienceCards = await getExperienceCards()
  const homePageData = await getPageBySlug('home')

  return {
    props: {
      experienceCards,
      homePageData,
    },
    revalidate: 60,
  }
}
