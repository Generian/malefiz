import Head from 'next/head'
import { Game } from 'src/game/Game'

export default function Home() {
  return (
    <>
      <Head>
        <title>Malefiz</title>
        <meta name="description" content="Play Malefiz online" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Game />
      </main>
    </>
  )
}
