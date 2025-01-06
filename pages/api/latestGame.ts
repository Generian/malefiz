import { NextApiRequest, NextApiResponse } from "next"
import { Server as HTTPServer } from "http"
import { Socket } from "net"
import { Game } from "./socket"

interface SocketWithServer extends Socket {
  server: ServerWithGames
}

interface ServerWithGames extends HTTPServer {
  games: { [key: string]: Game }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse & { socket: SocketWithServer }
) {
  if (!res?.socket?.server.games) {
    res.status(500).json({ error: "Games state is not initialized" })
    return
  }

  const { games } = res.socket.server
  let latestTimestamp = new Date(Date.now() - 3 * 60 * 60 * 1000).getTime()
  let latestGameId = ""
  console.log("Games from singleton:", games)
  if (games) {
    for (const game of Object.values(games)) {
      if ((game as Game).gameOver) continue
      const { actions, lobbyId } = game as Game
      if (!actions) continue
      for (const action of actions) {
        if (!action || !action.createdAt) continue
        if (action.createdAt > latestTimestamp) {
          latestTimestamp = action.createdAt
          latestGameId = lobbyId
        }
      }
    }
  }

  res.status(200).json(latestGameId)
}
