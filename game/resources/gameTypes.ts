import { PlayerColor } from "./playerColors"

export interface Piece {
  pos: number
  color: PlayerColor
}

export type GameStates = 'ROLL_DICE' | 'SELECT_PIECE' | 'MOVE_PIECE' | 'MOVE_BLOCK' | 'END'