import { PlayerColor } from "./playerColors"

export type GameType = 'NORMAL' | 'COMPETITION'

export interface Piece {
  pos: number
  color: PlayerColor
}

export type GameState = 'ROLL_DICE' | 'SELECT_PIECE' | 'MOVE_PIECE' | 'MOVE_BLOCK' | 'END'

export type GameStateCompetition = {
  [key in PlayerColor]: GameState
}

export type DiceValueCompetition = {
  [key in PlayerColor]: number | undefined
}