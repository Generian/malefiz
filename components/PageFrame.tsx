import Head from 'next/head'

interface PageFrameProps {
  children: React.ReactNode
  title?: string
  noZoom?: boolean
}

export default function PageFrame({ children, title, noZoom = false }: PageFrameProps) {
  return (
    <>
      <Head>
        <title>{title ? title : "Malefiz | Spielen Sie Malefiz online!"}</title>
        <meta name="description" content="Malefiz online spielen. Spielspaß für die ganze Familie!" />
        {!noZoom && <meta name="viewport" content="width=device-width, initial-scale=1" />}
        {noZoom && <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />}
        <link rel="icon" href="/favicon.ico" />
        {/* <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="8bfe88c6-fdaf-41f1-a309-756278ef2be8" data-blockingmode="auto" type="text/javascript"></script> */}
        {/* <script src="https://app.enzuzo.com/apps/enzuzo/static/js/__enzuzo-cookiebar.js?uuid=cdd6de02-3f46-11ee-8b2a-57763a880aa1"></script> */}
      </Head>
      <main>
        {children}
      </main>
    </>
  )
}
