import '@/styles/index.scss'
import 'slick-carousel/slick/slick.css'
import 'react-loading-skeleton/dist/skeleton.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '@/store'
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
      />
      <DefaultLayout>
        <Component {...pageProps} />
      </DefaultLayout>
    </Provider>
  )
}
