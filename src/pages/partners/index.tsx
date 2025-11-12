import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import DefaultForms from '@/components/DefaultForms/DefaultForms'
import Portfolio from '@/routes/partners/Portfolio/Portfolio'
import { openModal } from '@/store/slices/modalSlice'
import { partnershipData } from '@/routes/partners/partnershipData'
import { IFinancingOptionCard } from '@/types'
import { getPartnerships, getPageBySlug } from '@/lib/wordpress'
import { getIconComponent } from '@/lib/iconMapper'

const BoardOfCards = dynamic(
  () => import('@/components/BoardOfCards/BoardOfCards'),
  { ssr: false },
)

interface PartnersPageData {
  partnersPageFields?: {
    heroTitle?: string
    heroDescription?: string
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
    portfolioSectionTitle?: string
    portfolioBannerImage?: {
      node?: {
        sourceUrl?: string
      }
    }
  }
}

interface PartnersProps {
  partnerships: Array<{
    id: string
    title: string
    description: string
    iconName: string
  }>
  pageData: PartnersPageData | null
}

export default function Partners({ partnerships, pageData }: PartnersProps) {
  const dispatch = useAppDispatch()
  const pageFields = pageData?.partnersPageFields || {}

  // Transform WordPress partnerships to component format
  const partnershipCards: IFinancingOptionCard[] =
    partnerships && partnerships.length >= 4
      ? partnerships.slice(0, 4).map((p) => ({
          title: p.title,
          description: p.description,
          icon: getIconComponent(p.iconName),
        }))
      : partnershipData

  const heroBanner = 
    pageFields.heroLottieJson?.node?.mediaItemUrl ||
    pageFields.heroBannerImage?.node?.sourceUrl ||
    '/json/partners.json'

  return (
    <>
      <Head>
        <title>Partners - Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroDefault
        title={pageFields.heroTitle || 'Partner with Luminar'}
        description={
          pageFields.heroDescription ||
          'Join us in our mission to empower small businesses with the financing they deserve, backed by a trusted partner.'
        }
        banner={heroBanner}
        actions={
          <>
            <Button
              onClick={() =>
                dispatch(openModal({ modal: 'partner', size: 'lg' }))
              }
            >
              Become a Partner
            </Button>
          </>
        }
      />
      <BoardOfCards
        title={pageFields.portfolioSectionTitle || 'The Luminar Partnership'}
        cards={partnershipCards}
      />
      <Portfolio />
      <DefaultForms />
    </>
  )
}

export const getStaticProps = async () => {
  let partnerships: Array<{
    id: string
    title: string
    description: string
    iconName: string
  }> = []
  let pageData: PartnersPageData | null = null

  try {
    partnerships = await getPartnerships()
    pageData = (await getPageBySlug('partners')) as PartnersPageData | null
  } catch (err) {
    console.warn('WordPress fetch failed, using fallback data')
  }

  return {
    props: {
      partnerships,
      pageData,
    },
    revalidate: 60,
  }
}
