import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import DefaultForms from '@/components/DefaultForms/DefaultForms'
import Portfolio from '@/routes/partners/Portfolio/Portfolio'
import { openModal } from '@/store/slices/modalSlice'
import { partnershipData } from '@/routes/partners/partnershipData'

const BoardOfCards = dynamic(
  () => import('@/components/BoardOfCards/BoardOfCards'),
  { ssr: false },
)

export default function Partners() {
  const dispatch = useAppDispatch()

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
        title="Partner with Luminar"
        description="Join us in our mission to empower small businesses with the financing they deserve, backed by a trusted partner."
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
      <BoardOfCards title="The Luminar Partnership" cards={partnershipData} />
      <Portfolio />
      <DefaultForms />
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
