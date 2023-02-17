import { Game } from "src/pages/api/socket"
import { PlayerColor } from "./playerColors"
import { positions } from "./positions"

export const getActivePlayer = (game: Game, myColor: PlayerColor) => {
  const playerColor = game.gameType == 'COMPETITION' ? myColor : game.activePlayerColor

  const player = game.players?.find(p => p.color == playerColor)

  return player
}

export const itsMyTurn = (game: Game, myColor: PlayerColor) => {
  let myTurn = false

  if (myColor) {
    const player = getActivePlayer(game, myColor)
    if (!player) return myTurn

    if (game.gameType == 'COMPETITION') {
      if (player.nextMoveTime) {
        myTurn = player.color == myColor && player.nextMoveTime <= new Date().getTime()
      } else {
        myTurn = player.color == myColor
      }
    } else {
      myTurn = player.color == myColor
    }
  } else {
    myTurn = true
  }

  return myTurn
}

export const getPlayerGameState = (game: Game, color: PlayerColor) => {
  return getActivePlayer(game, color)?.gameState
}

export const getBlockMoveOptions = (game: Game) => {
  return positions
    .filter(p => p.y > 1) // Filter out first rows
    .filter(p => p.y < Math.max(...positions.map(p => p.y))) // Filter out winning row
    .map(p => p.id)
    .filter(p => !game.blocks.includes(p)) // Filter for blocks
    .filter(p => !game.pieces.map(p => p.pos).includes(p)) // Filter out positions with players
}