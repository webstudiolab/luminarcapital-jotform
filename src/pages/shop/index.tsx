import Head from 'next/head'
import classNames from 'classnames'
import ProductCard from '@/ui/components/ProductCard/ProductCard'
import CallToAction from '@/ui/components/CTA/CallToAction'
import { shopProducts } from '@/routes/shop/shopData'
import styles from './Shop.module.scss'

export default function Shop() {
  return (
    <>
      <Head>
        <title>Shop - Luminar Capital</title>
        <meta
          name="description"
          content="Browse our exclusive Luminar Capital branded merchandise."
        />
      </Head>
      
      <section className={classNames(styles['hero'], 'p-100-0')}>
        <div className="content-block">
          <div className={styles['hero-content']}>
            <h1 className={styles['hero-title']}>Luminar Capital Merchandise</h1>
            <p className={styles['hero-description']}>
              Explore our exclusive collection of branded merchandise. Show your support for innovative business financing.
            </p>
          </div>
        </div>
      </section>

      <section className={classNames(styles['shop'], 'p-100-0')}>
        <div className="content-block">
          <div className={styles['shop-grid']}>
            <div className="row">
              {shopProducts.map((product, index) => (
                <div
                  key={`product-${index}`}
                  className="col-xs-12 col-sm-6 col-md-4"
                >
                  <ProductCard
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    image={product.image}
                    href="#"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <CallToAction
        title="Questions About Our Merchandise?"
        description="Contact us for custom orders or bulk purchases for your team."
        link={{ label: 'Get in Touch', href: '/contact' }}
      />
    </>
  )
}
