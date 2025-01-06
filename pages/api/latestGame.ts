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
    res.status(500).json("")
    return
  }

  const { games } = res.socket.server
  let gameInfos = []
  let latestTimestamp = new Date(Date.now() - 10 * 60 * 1000).getTime()
  let latestGameId = ""
  let maxActionsLength = 0
  if (games) {
    for (const game of Object.values(games)) {
      if ((game as Game).gameOver) continue
      const { actions, lobbyId } = game as Game
      if (!actions) continue
      const currentGameActionsLength = actions.length
      if (currentGameActionsLength > maxActionsLength) {
        maxActionsLength = currentGameActionsLength
      }
      let currentGameLatestTimestamp = 0
      for (const action of actions) {
        if (!action || !action.createdAt) continue
        if (action.createdAt > latestTimestamp) {
          latestTimestamp = action.createdAt
          latestGameId = lobbyId
        }
        if (action.createdAt > currentGameLatestTimestamp) {
          currentGameLatestTimestamp = action.createdAt
        }
      }
      gameInfos.push({
        lobbyId,
        currentGameActionsLength,
        currentGameLatestTimestamp,
      })
    }
    if (latestGameId) {
      const furthestProgressedGame = gameInfos.find(
        (game) => game.currentGameActionsLength === maxActionsLength
      )
    }
  }

  res.status(200).json(latestGameId)
}
