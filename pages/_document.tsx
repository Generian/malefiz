import { ThemeProvider } from '@mui/material'
import { Html, Head, Main, NextScript } from 'next/document'
import { theme } from 'src/styles/theme'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <ThemeProvider theme={theme}>
          <Main />
        </ThemeProvider>
        <NextScript />
      </body>
    </Html>
  )
}
