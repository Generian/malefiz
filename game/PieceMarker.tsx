import styles from 'styles/PieceMarker.module.css'
import { Piece } from './resources/gameTypes'

interface PieceMarker {
  piece: Piece
  pieceSize: number
  handleClick: (piece: Piece) => void
}

export const PieceMarker = ({ piece, pieceSize, handleClick }: PieceMarker) => {
  return (
    <div 
      className={`${styles.default} ${styles[piece.color]}`}
      style={{ width: pieceSize, height:pieceSize, borderRadius: pieceSize/2 }}
      onClick={() => handleClick(piece)}
    >
    </div>
  )
}