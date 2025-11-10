import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import DefaultForms from '@/components/DefaultForms/DefaultForms'
import Portfolio from '@/routes/partners/Portfolio/Portfolio'
import { openModal } from '@/store/slices/modalSlice'
import { getPartnerships, getPageBySlug } from '@/lib/wordpress'

const BoardOfCards = dynamic(
  () => import('@/components/BoardOfCards/BoardOfCards'),
  { ssr: false },
)

export default function Partners({
  partnerships,
  pageData,
}: {
  partnerships: unknown[]
  pageData: unknown
}) {
  const dispatch = useAppDispatch()
  const pageFields = pageData?.partnersPageFields || {}

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
        banner="/json/partners.json"
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
        cards={partnerships}
      />
      <Portfolio />
      <DefaultForms />
    </>
  )
}

export const getStaticProps = async () => {
  const partnerships = await getPartnerships()
  const pageData = await getPageBySlug('partners')

  return {
    props: {
      partnerships,
      pageData,
    },
    revalidate: 60,
  }
}
