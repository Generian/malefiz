import { ThemeProvider } from "@mui/material"
import { Html, Head, Main, NextScript } from "next/document"
import { theme } from "src/styles/theme"

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta
          name='google-site-verification'
          content='wUHmAjX7bgZFcGc6KDRvZ6NUVWi38HBSbDgfsEBIkH8'
        />
        {/* <script src="https://app.enzuzo.com/apps/enzuzo/static/js/__enzuzo-cookiebar.js?uuid=cdd6de02-3f46-11ee-8b2a-57763a880aa1"></script> */}
        {/* <script id="cookieyes" type="text/javascript" src="https://cdn-cookieyes.com/client_data/0878e4eb4e8cdda52cb078fc/script.js"></script> */}
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
