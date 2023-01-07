import Head from 'next/head'

interface PageFrameProps {
  children: React.ReactNode
  title?: string
  landscapeMode?: boolean
}

export default function PageFrame({ children, title, landscapeMode }: PageFrameProps) {
  return (
    <>
      <Head>
        <title>{title ? title : "Malefiz | Spielen Sie Malefiz online!"}</title>
        <meta name="description" content="Malefiz online spielen. Spielspaß für die ganze Familie!" />
        {!landscapeMode && <meta name="viewport" content="width=device-width, initial-scale=1" />}
        {landscapeMode && <meta name="viewport" content="viewport-fit=cover, orientation=landscape" />}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {children}
      </main>
    </>
  )
}
