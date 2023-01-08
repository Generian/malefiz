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
      </Head>
      <main>
        {children}
      </main>
    </>
  )
}
