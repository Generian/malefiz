import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '@fontsource/roboto/400.css'
import ReactGA from 'react-ga'
import { initGoogleAnalytics } from 'src/utils/analytics'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import Script from 'next/script'
import { acceptedLanguageType } from 'src/utils/translations'
import { LanguageContext, LanguageContextProvider } from 'src/components/helper/LanguageContext'
import { getCookie } from 'src/utils/helper'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { updateLanguage } = useContext(LanguageContext)

  useEffect(() => {
    initGoogleAnalytics()
    // Record initial page view
    logPageView()

    // Record subsequent page views
    router.events.on('routeChangeComplete', logPageView)

    return () => {
      router.events.off('routeChangeComplete', logPageView)
    }
  }, [])

  const logPageView = () => {
    ReactGA.set({ page: window.location.pathname })
    ReactGA.pageview(window.location.pathname)
  }

  useEffect(() => {
    const language = getCookie('language') as acceptedLanguageType
    if (language) {
      updateLanguage(language)
    }
  }, [])

  return <>
    <link href='https://fonts.googleapis.com/css?family=Arbutus' rel='stylesheet'></link>
    <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-VX66E5NXM6"
        strategy="afterInteractive"
      />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-VX66E5NXM6');
      `}
    </Script>
    <LanguageContextProvider>
      <Component {...pageProps} />
    </LanguageContextProvider>
  </>
}
