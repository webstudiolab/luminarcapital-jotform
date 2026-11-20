import Head from 'next/head'
import HeroSimple from '@/components/HeroSimple/HeroSimple'
import AdditionalOwnerForm from '@/components/forms/AdditionalOwnerForm/AdditionalOwnerForm'
import styles from '@/components/forms/AdditionalOwnerForm/AdditionalOwnerPage.module.scss'

// Unlisted page: not linked anywhere on the site, not in the sitemap,
// and marked noindex. Shared directly by the Luminar team.
export default function AdditionalOwner() {
  return (
    <>
      <Head>
        <title>Additional Owner Information - Luminar Capital</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <HeroSimple
        title="Additional Owner Information"
        description="Please complete your details below to be added to an existing Luminar Capital application."
      />
      <section className={styles.section}>
        <div className="content-block">
          <div className={styles.card}>
            <AdditionalOwnerForm />
          </div>
        </div>
      </section>
    </>
  )
}
