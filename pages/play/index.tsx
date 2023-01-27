import Head from 'next/head'
import PageFrame from 'src/components/PageFrame'
import { GameComp } from 'src/game/Game'

export default function Home() {
  return (
    <PageFrame>
        <GameComp />
    </PageFrame>
  )
}
