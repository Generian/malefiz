import { useRouter } from "next/router"
import { use, useEffect, useState } from "react"
import PageFrame from "src/components/PageFrame"
import { GameComp } from "src/game/Game"

export default function Home() {
  const [latestGame, setLatestGame] = useState("")

  const router = useRouter()

  useEffect(() => {
    const fetchLatestGame = async () => {
      try {
        const response = await fetch("/api/latestGame")
        const newLatestGameId = await response.json()
        console.log(
          "Fetched latest game Id:",
          newLatestGameId,
          "Previous game Id:",
          latestGame
        )
        if (newLatestGameId) {
          setLatestGame(newLatestGameId)
        }
      } catch (error) {
        console.error("Failed to fetch latest game:", error)
      }
    }

    fetchLatestGame()
    const intervalId = setInterval(fetchLatestGame, 30 * 1000) // Fetch every 60 seconds

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    router.push(`/watch${latestGame ? `?lid=${latestGame}` : ""}`)
  }, [latestGame])

  return (
    <PageFrame>
      <GameComp />
    </PageFrame>
  )
}
