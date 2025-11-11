import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import { valuesData } from '@/routes/why-luminar/valuesData'
import BoardChessOrder from '@/components/BoardChessOrder/BoardChessOrder'
import { advantageData } from '@/routes/why-luminar/advantageData'
import CallToAction from '@/ui/components/CTA/CallToAction'
import { openModal } from '@/store/slices/modalSlice'
import { IFinancingOptionCard, IBoardChessOrderCard } from '@/types'
import { getAdvantages, getValues, getPageBySlug } from '@/lib/wordpress'
import CreditCardIcon from '@/ui/icons/CreditCard'

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

interface WhyLuminarProps {
  advantages: IBoardChessOrderCard[]
  values: IFinancingOptionCard[]
  pageData: WhyLuminarPageData | null
}

export default function WhyLuminar({
  advantages,
  values,
  pageData,
}: WhyLuminarProps) {
  const dispatch = useAppDispatch()
  const pageFields = pageData?.whyLuminarPageFields || {}

  // Map iconName to actual icon component
  const advantagesCards =
    advantages && advantages.length === 4 ? advantages : advantageData
  const valuesCards =
    values && values.length === 4
      ? values.map((v) => ({
          title: v.title,
          description: v.description,
          icon: CreditCardIcon,
        }))
      : valuesData

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
        cards={valuesCards}
      />
      <BoardChessOrder
        title={pageFields.advantagesSectionTitle || 'The Luminar Advantage'}
        data={advantagesCards}
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
  let advantages: IBoardChessOrderCard[] = []
  let values: IFinancingOptionCard[] = []
  let pageData: WhyLuminarPageData | null = null

  try {
    advantages = await getAdvantages()
    values = await getValues()
    pageData = (await getPageBySlug('why-luminar')) as WhyLuminarPageData | null
  } catch (err) {
    console.warn('WordPress fetch failed, using fallback data')
  }

  return {
    props: {
      advantages,
      values,
      pageData,
    },
    revalidate: 60,
  }
}
