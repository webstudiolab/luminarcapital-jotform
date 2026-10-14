import Head from 'next/head'
import { BUSINESS } from '@/config/business'

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  '@id': `${BUSINESS.url}/#organization`,
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  url: `${BUSINESS.url}/`,
  logo: BUSINESS.logo,
  image: BUSINESS.logo,
  description: BUSINESS.description,
  telephone: BUSINESS.phoneSchema,
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.address.street,
    addressLocality: BUSINESS.address.city,
    addressRegion: BUSINESS.address.region,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.country,
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  sameAs: BUSINESS.sameAs,
}

const OrganizationSchema = () => (
  <Head>
    <script
      key="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  </Head>
)

export default OrganizationSchema
