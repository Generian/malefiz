import { Game } from "src/pages/api/socket"
import { getBlockMoveOptions, getPlayerGameState, itsMyTurn } from "./gameState"
import { Action } from "./gameValidation"
import { PlayerColor } from "./playerColors"
import { getAvailableMovePaths } from "./routing"

export const executeBotMove = (
  game: Game, 
  color: PlayerColor, 
  shortestPaths: { [key: number]: number },
  handleGameAction: (action: Action) => void
) => {
  const botsTurn = itsMyTurn(game, color)
  if (!botsTurn) return

  const turnType = getPlayerGameState(game, color)
  console.log(`Executing bot move for player: ${color}. Type: ${turnType}`)

  let action: Action | undefined = undefined

  switch (turnType) {
    case 'ROLL_DICE':
      action = {
        updateType: 'ROLL_DICE',
      }
      break

    case 'MOVE_PIECE':
      let availableMoveOptions: { start: number, end: number }[] = []
      game
        .pieces
        .filter(p => p.color == color)
        .forEach(piece => 
          availableMoveOptions
            .push(
              ...getAvailableMovePaths(piece.pos, color, game.players.filter(p => p.color == color)[0].diceValue, game.blocks, game.pieces)
              .map(p => {
                return {
                  start: piece.pos,
                  end: p[p.length - 1]
                }
              })
            )
        )

      // Sort move options
      availableMoveOptions = availableMoveOptions.sort((a, b) => shortestPaths[a.end] - shortestPaths[b.end])

      let chosenMoveOption = availableMoveOptions[0]

      // Filter out move back options
      const availableMoveOptionsNoMoveBacks = availableMoveOptions.filter(p => shortestPaths[p.end] < shortestPaths[p.start] || !shortestPaths[p.start])

      if (availableMoveOptionsNoMoveBacks.length) {
        console.log("moving forward")
        chosenMoveOption = availableMoveOptionsNoMoveBacks[0]
      }

      action = {
        updateType: 'MOVE_PIECE',
        activePiece: game.pieces.filter(p => p.pos == chosenMoveOption.start)[0],
        newPositionId: chosenMoveOption.end
      }

      break

    case 'MOVE_BLOCK':
      const blockMoveOptions = getBlockMoveOptions(game)

      const chosenBlockMoveOption = blockMoveOptions[0]

      action = {
        updateType: 'MOVE_BLOCK',
        newPositionId: chosenBlockMoveOption
      }
      break
  
    default:
      break
  }

  if (action) {
    handleGameAction(action)
  } else {
    console.error(`No action could be defined for bot: ${color}`)
  }
}