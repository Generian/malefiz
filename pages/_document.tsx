import { ThemeProvider } from '@mui/material'
import { Html, Head, Main, NextScript } from 'next/document'
import { theme } from 'src/styles/theme'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="google-site-verification" content="wUHmAjX7bgZFcGc6KDRvZ6NUVWi38HBSbDgfsEBIkH8" />
      </Head>
      <body>
        <ThemeProvider theme={theme}>
          <Main />
        </ThemeProvider>
        <NextScript />
      </body>
    </Html>
  )
}
