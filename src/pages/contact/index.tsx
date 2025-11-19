import Head from 'next/head'
import HeroSimple from '@/components/HeroSimple/HeroSimple'
import DefaultForms from '@/components/DefaultForms/DefaultForms'
import ContactsData from '@/routes/contact/ContactsData/ContactsData'
import { getPageBySlug } from '@/lib/wordpress'

interface ContactPageData {
  contactPageFields?: {
    phone?: string
    email?: string
    address?: string
    googleMapsEmbedUrl?: string
  }
}

interface ContactProps {
  pageData: ContactPageData | null
}

export default function Contact({ pageData }: ContactProps) {
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
      
      {/* Google Maps Embed */}
      {contactFields.googleMapsEmbedUrl && (
        <section className="p-80-0">
          <div className="content-block">
            <div style={{ width: '100%', height: '450px', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={contactFields.googleMapsEmbedUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}
      
      <DefaultForms />
    </>
  )
}

export const getStaticProps = async () => {
  let pageData: ContactPageData | null = null

  try {
    pageData = (await getPageBySlug('contact')) as ContactPageData | null
  } catch (err) {
    console.warn('WordPress fetch failed for contact page')
  }

  return {
    props: {
      pageData,
    },
    revalidate: 60,
  }
}
