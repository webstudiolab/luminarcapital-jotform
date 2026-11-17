import '@/styles/index.scss'
import 'slick-carousel/slick/slick.css'
import 'react-loading-skeleton/dist/skeleton.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '@/store'
import DefaultLayout from '@/layouts/DefaultLayout/DefaultLayout'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { openModal } from '@/store/slices/modalSlice'
import { captureAttribution } from '@/utils/attribution'

function ModalHandler() {
  const router = useRouter()

  useEffect(() => {
    const { modal } = router.query
    if (modal === 'financing') {
      store.dispatch(openModal({ modal: 'financing', size: 'xl' }))
    } else if (modal === 'partner') {
      store.dispatch(openModal({ modal: 'partner', size: 'lg' }))
    }
  }, [router.query])

  return null
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    captureAttribution()
  }, [])

  return (
    <Provider store={store}>
      <DefaultLayout>
        <ModalHandler />
        <Component {...pageProps} />
      </DefaultLayout>
    </Provider>
  )
}
