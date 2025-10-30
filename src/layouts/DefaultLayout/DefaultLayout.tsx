import { ReactNode } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import MetaLayout from '@/layouts/MetaLayout/MetaLayout'
import ModalWindow from '@/components/ModalWindow/ModalWindow'
import styles from './DefaultLayout.module.scss'

const CookieMessage = dynamic(
  () => import('@/ui/components/CookieMessage/CookieMessage'),
  { ssr: false },
)

interface IDefaultLayout {
  children: ReactNode
}

const DefaultLayout = ({ children }: IDefaultLayout) => {
  return (
    <MetaLayout>
      <Header />
      <main className={styles['main']}>
        {children}
        <div
          className={classNames(
            styles['layout-footer-abstract'],
            'footer-abstract',
          )}
        />
      </main>
      <Footer />
      <ModalWindow />
      <CookieMessage />
      <GoogleAnalytics gaId="G-M9ZF18E4ER" />
    </MetaLayout>
  )
}

export default DefaultLayout
