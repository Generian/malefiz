import styles from 'styles/PieceMarker.module.css'
import { Piece } from './resources/gameTypes'

interface PieceMarker {
  piece: Piece
  pieceSize: number
  cursor?: {
    x: number
    y: number
  }
  handleClick?: (piece: Piece) => void
}

export const PieceMarker = ({ piece, pieceSize, cursor, handleClick }: PieceMarker) => {
  return (
    <div 
      className={`${styles.default} ${styles[piece.color]}`}
      style={{
        width: pieceSize, 
        height:pieceSize, 
        borderRadius: pieceSize/2,
        position: cursor ? 'fixed' : 'relative', 
        left: cursor ? cursor.x - pieceSize/2 : '', 
        top: cursor ? cursor.y - pieceSize/2 : '', 
        pointerEvents: cursor ? 'none' : 'all',
        zIndex: cursor ? 2 : ''
      }}
      onClick={handleClick ? () => handleClick(piece) : () => {}}
    >
    </div>
  )
}