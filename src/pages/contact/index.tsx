import Head from 'next/head'
import HeroSimple from '@/components/HeroSimple/HeroSimple'
import DefaultForms from '@/components/DefaultForms/DefaultForms'
import ContactsData from '@/routes/contact/ContactsData/ContactsData'
import { getPageBySlug } from '@/lib/wordpress'

export default function Contact({ pageData }: { pageData: unknown }) {
  const contactFields = pageData?.contactPageFields || {}

  return (
    <>
      <Head>
        <title>Get In Touch - Luminar Capital</title>
        <meta
          name="description"
          content="Flexible financing options that fuel the growth of small businesses."
        />
      </Head>
      <HeroSimple
        title="Get In Touch"
        description="Ready to explore your financing options? Interested in becoming a partner? Need assistance with an existing account? Have a question you'd like answered? Reach out, we're here to help!"
      />
      <ContactsData contactInfo={contactFields} />
      <DefaultForms />
    </>
  )
}

export const getStaticProps = async () => {
  const pageData = await getPageBySlug('contact')

  return {
    props: {
      pageData,
    },
    revalidate: 60,
  }
}
