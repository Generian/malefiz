import Head from 'next/head'
import PageFrame from 'src/components/PageFrame'
import { Game } from 'src/game/Game'

export default function Home() {
  return (
    <PageFrame>
        <Game />
    </PageFrame>
  )
}
