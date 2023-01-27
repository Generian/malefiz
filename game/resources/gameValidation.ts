import { Player } from "src/pages"
import { Game } from "src/pages/api/socket"
import { GameState, GameType, Piece } from "./gameTypes"
import { nextPlayerColor, PlayerColor } from "./playerColors"
import { defaultBlocks, getNewPiecePositions, getResetPiecePosition, initialisePieces, positions, winningPosId } from "./positions"
import { getAvailableMovePaths } from "./routing"

interface GameUpdate {
  game: Game
  color: PlayerColor
  action: Action
}

export type Action = UPDATE_ROLL_DICE | UPDATE_MOVE_PIECE | UPDATE_MOVE_BLOCK

interface UPDATE_ROLL_DICE {
  updateType: 'ROLL_DICE'
  diceValue: number
}

interface UPDATE_MOVE_PIECE {
  updateType: 'MOVE_PIECE'
  activePiece: Piece
  newPositionId: number
}

interface UPDATE_MOVE_BLOCK {
  updateType: 'MOVE_BLOCK'
  newPositionId: number
}

const updatePlayers = (game: Game, newPlayer: Player) => {
  let newPlayers = game.players
  const index = newPlayers.indexOf(newPlayers.filter(p => p.color == newPlayer.color)[0])
  newPlayers.splice(index, 1, newPlayer)
  let newGame = game
  newGame.players = newPlayers
  return newGame
}

export const validateGameUpdate = ({ game, color, action }: GameUpdate) => {
  const player = game.players.find(p => p.color == color)
  
  let isValid = false
  let reason = ''
  let newGame = {...game}
  let newPlayer = player
  let itsPlayersTurn = false

  // Check if it's players turn
  if (player?.gameState == action.updateType) { // Check if player is executing correct turn.
    if (game.gameType == 'NORMAL') {
      itsPlayersTurn = game.activePlayerColor == color
    } else if (game.gameType == 'COMPETITION') {
      itsPlayersTurn = !!player?.nextMoveTime && player?.nextMoveTime <= new Date().getTime()
    }
  } else {
    reason = `Player trying to execute ${action.updateType} although they should ${player?.gameState}.`
  }

  if (!!newPlayer) {
    if (!itsPlayersTurn) {
      reason = "Not player's turn."
    } else {
      switch (action.updateType) {
        case 'ROLL_DICE':
          newPlayer.diceValue = action.diceValue
          newPlayer.gameState = 'MOVE_PIECE'
          newGame.infos = [...newGame.infos, {
            infoType: 'ROLLED_DICE',
            player: newPlayer,
            diceValue: action.diceValue
          }]
          isValid = true
          break

        case 'MOVE_PIECE':
          // Check if piece still in position
          if (!game.pieces.find(p => p.pos == action.activePiece.pos && p.color == action.activePiece.color)) {
            reason = "Piece no longer in given position."
            break
          }

          const moveOptions = getAvailableMovePaths(action.activePiece.pos, newPlayer.color, newPlayer.diceValue, game.blocks, game.pieces).map(p => p[p.length - 1])

          // Filter out pieces of other players to check kick possibility:
          const otherPlayerPieces = game.pieces.filter(p => p.color != color)

          if (moveOptions.includes(action.newPositionId)) {
            newGame.pieces = getNewPiecePositions(action.activePiece, action.newPositionId, game.pieces)
            newPlayer.gameState = 'ROLL_DICE'

            if (game.blocks.includes(action.newPositionId)) {
              newGame.blocks = game.blocks.filter(b => b != action.newPositionId)
              newPlayer.gameState = 'MOVE_BLOCK'
            } else if (otherPlayerPieces.map(p => p.pos).includes(action.newPositionId)) {
              const pieceToReset = otherPlayerPieces.filter(o => o.pos == action.newPositionId)[0]
              newGame.pieces = getNewPiecePositions(pieceToReset, getResetPiecePosition(pieceToReset, game.pieces), newGame.pieces)
              newGame.infos = [...newGame.infos, {
                infoType: 'KICKED_PLAYER',
                player: newPlayer,
                kickedPlayer: game.players.find(p => p.color == pieceToReset.color)
              }]
            }

            if (newPlayer.diceValue != 6 && newPlayer.gameState != 'MOVE_BLOCK' && newGame.gameType == 'NORMAL') {
              const nextColor = nextPlayerColor(game.activePlayerColor, game.players.map(p => p.color))
              newGame.activePlayerColor = nextColor
              newGame.infos = [...newGame.infos, {
                infoType: 'TURN',
                player: newGame.players.filter(p => p.color == nextColor)[0]
              }]
            }

            if (action.newPositionId == winningPosId) {
              newGame.gameOver = true
              newGame.infos = [...newGame.infos, {
                infoType: 'GAMEOVER',
                player: newPlayer
              }]
            }

            isValid = true

          } else {
            reason = "Piece can't be moved. Not a valid move option."
          }
          break

        case 'MOVE_BLOCK':
          const blockMoveOptions = positions
            .filter(p => p.y > 1) // Filter out first rows
            .map(p => p.id)
            .filter(p => !game.blocks.includes(p)) // Filter for blocks
            .filter(p => !game.pieces.map(p => p.pos).includes(p)) // Filter out positions with players

          if (blockMoveOptions.includes(action.newPositionId)) {
            newGame.blocks = [...newGame.blocks, action.newPositionId]
            newPlayer.gameState = 'ROLL_DICE'
            newGame.infos = [...newGame.infos, {
              infoType: 'MOVED_BLOCK',
              player: newPlayer
            }]

            if (player?.diceValue != 6) {
              newGame.activePlayerColor = nextPlayerColor(game.activePlayerColor, game.players.map(p => p.color))
              newGame.infos = [...newGame.infos, {
                infoType: 'TURN',
                player: newGame.players.filter(p => p.color == newGame.activePlayerColor)[0]
              }]
              console.log("check")
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
    updatePlayers(newGame, newPlayer)
  } else {
    reason = "No player to execute turn could be identified."
  }

  if (isValid && newGame.actions) {
    newGame.actions = [...newGame.actions, action]
  }

  return { isValid, reason, newGame }
}

export const initialiseGame = (players: Player[], gameType: GameType, cooldown: number, lobbyId?: string): Game => {
  const game = {
    lobbyId: lobbyId ? lobbyId : '',
    gameType: gameType,
    players: players.map(p => {
      return {
        ...p,
        nextMoveTime: new Date().getTime(),
        gameState: 'ROLL_DICE' as GameState
      }
    }),
    activePlayerColor: players.map(p => p.color)[0],
    blocks: defaultBlocks,
    pieces: initialisePieces(players.map(c => c.color)),    
    cooldown: cooldown,
    gameOver: false,
    actions: [],
    infos: []
  }
  return game
}