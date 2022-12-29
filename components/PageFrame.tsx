import Head from 'next/head'

interface PageFrameProps {
  children: React.ReactNode
  title?: string
}

export default function PageFrame({ children, title }: PageFrameProps) {
  return (
    <>
      <Head>
        <title>{title ? title : "Malefiz | Spielen Sie Malefiz online!"}</title>
        <meta name="description" content="Malefiz online spielen. Spielspaß für die ganze Familie!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {children}
      </main>
    </>
  )
}
