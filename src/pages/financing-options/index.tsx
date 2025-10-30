import Head from 'next/head'
import { useAppDispatch } from '@/hooks'
import Button from '@/ui/components/Button/Button'
import HeroDefault from '@/components/HeroDefault/HeroDefault'
import Benefits from '@/routes/financing-options/Benefits/Benefits'
import CallToAction from '@/ui/components/CTA/CallToAction'
import CTASolid from '@/ui/components/CTASolid/CTASolid'
import { openModal } from '@/store/slices/modalSlice'

export default function FinancingOptions() {
  const dispatch = useAppDispatch()

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
        title="Financing Options"
        description="Looking for financing catered to your business needs? Our personalized solutions factor incoming revenue and cash flow, not just your credit which provides a different approach compared to conventional products."
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
        title="Want to learn more about our financing options?"
        description="Contact us and connect with one of our financing professionals that can help you navigate through the steps!"
        link={{ label: 'Get in Touch', href: '/contact?origin=1' }}
      />
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
