import { Action } from "@prisma/client/runtime/library"
import prisma from "./prisma"
import { Game } from "src/pages/api/socket"
import { GameType } from "src/game/resources/gameTypes"
import { Player } from "src/pages"

export interface GameData {
  lobbyId: string
  createdAt: Date
  updatedAt: Date
  environment: string
  gameType: GameType
  players: Player[]
  activePlayerColor: string
  blocks: number[]
  pieces: string[]
  cooldown: number
  gameOver: boolean
  actions: Action[]
}

export const saveGametoDatabase = async (game: Game) => {
  const save = await prisma.game.upsert({
    where: {
      lobbyId: game.lobbyId,
    },
    update: {
      updatedAt: new Date().toISOString(),
      activePlayerColor: game.activePlayerColor,
      blocks: game.blocks,
      pieces: game.pieces.map((p) => JSON.stringify(p)),
      cooldown: game.cooldown,
      gameOver: game.gameOver,
      actions: game.actions ? game.actions.map((p) => JSON.stringify(p)) : [],
    },
    create: {
      lobbyId: game.lobbyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      gameType: game.gameType,
      players: game.players.map((p) => JSON.stringify(p)),
      activePlayerColor: game.activePlayerColor,
      blocks: game.blocks,
      pieces: game.pieces.map((p) => JSON.stringify(p)),
      cooldown: game.cooldown,
      gameOver: game.gameOver,
      actions: game.actions ? game.actions.map((p) => JSON.stringify(p)) : [],
    },
  })
}

export const retrieveSpecificGameFromDatabase = async (
  lobbyId: string
): Promise<GameData | null> => {
  const game = await prisma.game.findUnique({
    where: {
      lobbyId: lobbyId,
    },
  })

  // Parse content
  if (game?.actions) {
    game.actions = game.actions.map((a) => JSON.parse(a))
  }

  if (game?.pieces) {
    game.pieces = game.pieces.map((p) => JSON.parse(p))
  }

  if (game?.players) {
    game.players = game.players.map((p) => JSON.parse(p))
  }

  return game
}

export const retrieveListOfGamesFromDatabase = async (
  limit?: number
): Promise<GameData[]> => {
  const game = await prisma.game.findMany({
    take: limit ? limit : 10,
    orderBy: {
      createdAt: "desc",
    },
  })
  return game
}

// API call functions

export const fetchSpecificGameFromDatabase = async (
  lobbyId: string
): Promise<GameData | null> => {
  const res = await fetch(`/api/games/${lobbyId}`)
  let data = await res.json()

  return data?.gameData
}
