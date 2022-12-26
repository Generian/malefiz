import styles from 'styles/PieceMarker.module.css'
import { Piece } from './Game'
import { PIECE_SIZE } from './resources/styles'

interface PieceMarker {
  piece: Piece
  handleClick: any
}

export const PieceMarker = ({ piece, handleClick }: PieceMarker) => {
  return (
    <div 
      className={`${styles.default} ${styles[piece.color]}`}
      style={{ width: PIECE_SIZE, height:PIECE_SIZE, borderRadius: PIECE_SIZE/2 }}
      onClick={() => handleClick(piece)}
    >
    </div>
  )
}