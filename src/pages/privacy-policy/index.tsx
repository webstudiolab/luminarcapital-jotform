import Head from 'next/head'
import TextTemplate from '@/ui/components/TextTemplate/TextTemplate'
import { data } from '@/routes/privacy-policy/data'

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <TextTemplate title="Privacy Policy" data={data} />
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
