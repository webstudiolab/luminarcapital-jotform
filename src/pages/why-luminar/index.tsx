import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import BoardChessOrder from '@/components/BoardChessOrder/BoardChessOrder'
import CallToAction from '@/ui/components/CTA/CallToAction'
import { openModal } from '@/store/slices/modalSlice'
import { getAdvantages, getValues, getPageBySlug } from '@/lib/wordpress'

const BoardOfCards = dynamic(
  () => import('@/components/BoardOfCards/BoardOfCards'),
  { ssr: false },
)

interface WhyLuminarPageData {
  whyLuminarPageFields?: {
    heroTitle?: string
    heroDescription?: string
    advantagesSectionTitle?: string
    valuesSectionTitle?: string
  }
}

export default function WhyLuminar({
  advantages,
  values,
  pageData,
}: {
  advantages: any[]
  values: any[]
  pageData: WhyLuminarPageData
}) {
  const dispatch = useAppDispatch()
  const pageFields = pageData?.whyLuminarPageFields || {}

  return (
    <>
      <Head>
        <title>Why Luminar</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroDefault
        title={pageFields.heroTitle || 'Why Luminar Capital'}
        description={
          pageFields.heroDescription ||
          'There are many options when it comes to financing for your business, customers choose us as we seek long term partners, helping you to surpass your goals.'
        }
        banner="/json/why_lum.json"
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
      <BoardOfCards
        title={pageFields.valuesSectionTitle || 'Our Values'}
        cards={values}
      />
      <BoardChessOrder
        title={pageFields.advantagesSectionTitle || 'The Luminar Advantage'}
        data={advantages}
        order="odd"
        className="advantage"
      />
      <CallToAction
        title="Ready To Secure Business Financing?"
        description="Contact us and connect with one of our financing professionals that can help you navigate through the steps!"
        link={{ label: 'Get in Touch', href: '/contact' }}
      />
    </>
  )
}

export const getStaticProps = async () => {
  const advantages = await getAdvantages()
  const values = await getValues()
  const pageData = await getPageBySlug('why-luminar')

  return {
    props: {
      advantages,
      values,
      pageData,
    },
    revalidate: 60,
  }
}
