import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '@fontsource/roboto/400.css'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <link href='https://fonts.googleapis.com/css?family=Arbutus' rel='stylesheet'></link>
    <Component {...pageProps} />
  </>
}
