import Head from 'next/head'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import Benefits from '@/routes/financing-options/Benefits/Benefits'
import CallToAction from '@/ui/components/CTA/CallToAction'
import CTASolid from '@/ui/components/CTASolid/CTASolid'
import { openModal } from '@/store/slices/modalSlice'
import { getPageBySlug } from '@/lib/wordpress'

interface FinancingPageData {
  financingOptionsPageFields?: {
    heroTitle?: string
    heroDescription?: string
    ctaTitle?: string
    ctaDescription?: string
  }
}

export default function FinancingOptions({
  pageData,
}: {
  pageData: FinancingPageData
}) {
  const dispatch = useAppDispatch()
  const pageFields = pageData?.financingOptionsPageFields || {}

  return (
    <>
      <Head>
        <title>Financing Options - Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroDefault
        title={pageFields.heroTitle || 'Financing Options'}
        description={
          pageFields.heroDescription ||
          'Looking for financing catered to your business needs? Our personalized solutions factor incoming revenue and cash flow, not just your credit which provides a different approach compared to conventional products.'
        }
        banner="/json/financing.json"
        actions={
          <>
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
      <Benefits />
      <CTASolid />
      <CallToAction
        title={
          pageFields.ctaTitle ||
          'Want to learn more about our financing options?'
        }
        description={
          pageFields.ctaDescription ||
          'Contact us and connect with one of our financing professionals that can help you navigate through the steps!'
        }
        link={{ label: 'Get in Touch', href: '/contact?origin=1' }}
      />
    </>
  )
}

export const getStaticProps = async () => {
  let pageData: any = null

  try {
    pageData = await getPageBySlug('financing-options')
  } catch (err) {
    console.warn('WordPress data fetch failed')
  }

  return {
    props: {
      pageData,
    },
    revalidate: 60,
  }
}
