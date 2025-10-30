import Head from 'next/head'
import TextTemplate from '@/ui/components/TextTemplate/TextTemplate'
import { data } from '@/routes/terms-of-service/data'

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms Of Service - Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <TextTemplate title="Terms Of Service" data={data} />
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
