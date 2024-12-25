import { Player } from "src/pages"
import { Game } from "src/pages/api/socket"
import { getBlockMoveOptions } from "./gameState"
import { GameState, GameType, Piece } from "./gameTypes"
import { nextPlayerColor, PlayerColor } from "./playerColors"
import {
  defaultBlocks,
  getNewPiecePositions,
  getResetPiecePosition,
  initialisePieces,
  positions,
  winningPosId,
} from "./positions"
import { getAvailableMovePaths } from "./routing"

interface GameUpdate {
  game: Game
  color: PlayerColor
  action: Action
}

export type Action = UPDATE_ROLL_DICE | UPDATE_MOVE_PIECE | UPDATE_MOVE_BLOCK

interface UPDATE_ROLL_DICE {
  updateType: "ROLL_DICE"
  playerColor?: PlayerColor
  diceValue?: number
}

export interface UPDATE_MOVE_PIECE {
  updateType: "MOVE_PIECE"
  activePiece: Piece
  newPositionId: number
  path?: number[]
  playerColor?: PlayerColor
}

interface UPDATE_MOVE_BLOCK {
  updateType: "MOVE_BLOCK"
  newPositionId: number
  playerColor?: PlayerColor
}

const updatePlayers = (game: Game, newPlayer: Player) => {
  let newPlayers = [...game.players]
  const index = newPlayers.indexOf(
    newPlayers.filter((p) => p.color == newPlayer.color)[0]
  )
  newPlayers.splice(index, 1, newPlayer)
  let newGame = { ...game }
  newGame.players = newPlayers
  return newGame
}

const nextMoveTime = (game: Game) => {
  return new Date().getTime() + game.cooldown * 1000
}

const generateDiceValue = () => {
  return Math.floor(Math.random() * 6) + 1
}

export const validateGameUpdate = ({ game, color, action }: GameUpdate) => {
  const player = game.players.find((p) => p.color == color)

  let isValid = false
  let reason = ""
  let newGame = { ...game }
  let newPlayer = player ? { ...player } : undefined
  let itsPlayersTurn = false
  let newAction = { ...action, playerColor: color }

  if (!game.gameOver) {
    // Check if it's players turn
    if (player?.gameState == action.updateType) {
      // Check if player is executing correct turn.
      if (game.gameType == "NORMAL") {
        itsPlayersTurn = game.activePlayerColor == color
      } else if (game.gameType == "COMPETITION") {
        itsPlayersTurn =
          !!player?.nextMoveTime && player?.nextMoveTime <= new Date().getTime()
      }
    } else {
      reason = `Player trying to execute ${action.updateType} although they should ${player?.gameState}.`
    }

    if (!!newPlayer) {
      if (!itsPlayersTurn) {
        reason = "Not player's turn."
      } else {
        switch (action.updateType) {
          case "ROLL_DICE":
            // Use dice value from replay data or generate new random value
            const diceValue = action.diceValue
              ? action.diceValue
              : generateDiceValue()
            newPlayer.diceValue = diceValue

            // Save dice value in action. Need to check again because of Typescript
            if (newAction.updateType == "ROLL_DICE") {
              newAction.diceValue = diceValue
            }
            newPlayer.gameState = "MOVE_PIECE"
            newGame.infos = [
              ...newGame.infos,
              {
                infoType: "ROLLED_DICE",
                player: newPlayer,
                diceValue: diceValue,
              },
            ]
            isValid = true
            break

          case "MOVE_PIECE":
            let pieceToMove: Piece[] | Piece | undefined = undefined

            if (action.activePiece) {
              // Check if piece still in position
              if (
                !game.pieces.find(
                  (p) =>
                    p.pos == action.activePiece?.pos &&
                    p.color == action.activePiece?.color
                )
              ) {
                reason = "Piece no longer in given position."
                break
              }
              pieceToMove = action.activePiece
            } else if (!action.activePiece) {
              pieceToMove = []
              const playerPieces = game.pieces.filter((p) => p.color == color)
              for (let i = 0; i < playerPieces.length; i++) {
                const movePaths = getAvailableMovePaths(
                  playerPieces[i].pos,
                  color,
                  newPlayer.diceValue,
                  game.blocks,
                  game.pieces
                )
                const pieceMoveOptions = movePaths.map((p) => p[p.length - 1])
                if (pieceMoveOptions.includes(action.newPositionId)) {
                  pieceToMove = [...pieceToMove, playerPieces[i]]
                }
              }
            }

            if (
              !pieceToMove ||
              (Array.isArray(pieceToMove) && pieceToMove.length == 0)
            ) {
              reason = "Can't find any piece to move to selected position."
              break
            } else if (Array.isArray(pieceToMove)) {
              if (pieceToMove.length > 1) {
                reason =
                  "Found more than one piece to move. Please select the piece to move first."
                break
              } else {
                pieceToMove = pieceToMove[0]
              }
            }

            // Filter out pieces of other players to check kick possibility:
            const otherPlayerPieces = game.pieces.filter(
              (p) => p.color != color
            )

            const movePaths = getAvailableMovePaths(
              pieceToMove.pos,
              newPlayer.color,
              newPlayer.diceValue,
              game.blocks,
              game.pieces
            )
            const moveOptions = movePaths.map((p) => p[p.length - 1])

            if (moveOptions.includes(action.newPositionId) && pieceToMove) {
              newGame.pieces = getNewPiecePositions(
                pieceToMove,
                action.newPositionId,
                game.pieces
              )
              newPlayer.gameState = "ROLL_DICE"

              // Check blocks
              if (game.blocks.includes(action.newPositionId)) {
                newGame.blocks = game.blocks.filter(
                  (b) => b != action.newPositionId
                )
                newPlayer.gameState = "MOVE_BLOCK"
              } else if (
                otherPlayerPieces
                  .map((p) => p.pos)
                  .includes(action.newPositionId)
              ) {
                // Check if piece gets thrown
                const pieceToReset = otherPlayerPieces.filter(
                  (o) => o.pos == action.newPositionId
                )[0]
                newGame.pieces = getNewPiecePositions(
                  pieceToReset,
                  getResetPiecePosition(pieceToReset, game.pieces),
                  newGame.pieces
                )
                newGame.infos = [
                  ...newGame.infos,
                  {
                    infoType: "KICKED_PLAYER",
                    player: newPlayer,
                    kickedPlayer: game.players.find(
                      (p) => p.color == pieceToReset.color
                    ),
                  },
                ]
              }

              // Add path to action for animation
              const path = movePaths.find(
                (p) => p[p.length - 1] == action.newPositionId
              )

              if (path && newAction.updateType == "MOVE_PIECE") {
                newAction = {
                  ...newAction,
                  path,
                }
              }

              if (
                newPlayer.diceValue != 6 &&
                newPlayer.gameState != "MOVE_BLOCK"
              ) {
                if (game.gameType == "COMPETITION") {
                  newPlayer.nextMoveTime = nextMoveTime(game)
                } else if (game.gameType == "NORMAL") {
                  const nextColor = nextPlayerColor(
                    game.activePlayerColor,
                    game.players.map((p) => p.color)
                  )
                  newGame.activePlayerColor = nextColor
                  newGame.infos = [
                    ...newGame.infos,
                    {
                      infoType: "TURN",
                      player: newGame.players.filter(
                        (p) => p.color == nextColor
                      )[0],
                    },
                  ]
                }
              }

              if (action.newPositionId == winningPosId) {
                newGame.gameOver = true
                newGame.infos = [
                  ...newGame.infos,
                  {
                    infoType: "GAMEOVER",
                    player: newPlayer,
                  },
                ]
              }

              isValid = true
            } else {
              reason = "Piece can't be moved. Not a valid move option."
            }
            break

          case "MOVE_BLOCK":
            const blockMoveOptions = getBlockMoveOptions(newGame)

            if (blockMoveOptions.includes(action.newPositionId)) {
              newGame.blocks = [...newGame.blocks, action.newPositionId]
              newPlayer.gameState = "ROLL_DICE"

              newGame.infos = [
                ...newGame.infos,
                {
                  infoType: "MOVED_BLOCK",
                  player: newPlayer,
                },
              ]

              if (player?.diceValue != 6) {
                if (game.gameType == "COMPETITION") {
                  newPlayer.nextMoveTime = nextMoveTime(game)
                } else if (game.gameType == "NORMAL") {
                  newGame.activePlayerColor = nextPlayerColor(
                    game.activePlayerColor,
                    game.players.map((p) => p.color)
                  )
                  newGame.infos = [
                    ...newGame.infos,
                    {
                      infoType: "TURN",
                      player: newGame.players.filter(
                        (p) => p.color == newGame.activePlayerColor
                      )[0],
                    },
                  ]
                }
              }

              isValid = true
            } else {
              reason = "Can't move block to selected position."
            }
            break

          default:
            reason = `Update type not supported: ${action}`
            break
        }
      }
      newGame = updatePlayers(newGame, newPlayer)
    } else {
      reason = "No player to execute turn could be identified."
    }

    if (isValid && newGame.actions) {
      newGame.actions = [...newGame.actions, newAction]
    }
  } else {
    reason = "Game is over."
  }

  return { isValid, reason, newGame }
}

export const initialiseGame = (
  players: Player[],
  gameType: GameType,
  cooldown: number,
  lobbyId?: string
): Game => {
  const game = {
    lobbyId: lobbyId ? lobbyId : "",
    gameType: gameType,
    players: players.map((p) => {
      return {
        ...p,
        nextMoveTime: new Date().getTime(),
        gameState: "ROLL_DICE" as GameState,
      }
    }),
    activePlayerColor: players.map((p) => p.color)[0],
    blocks: defaultBlocks,
    pieces: initialisePieces(players.map((c) => c.color)),
    cooldown: cooldown,
    gameOver: false,
    actions: [],
    infos: [],
  }
  return game
}
