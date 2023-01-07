import styles from 'styles/BlockMarker.module.css'
import { PIECE_SIZE } from './resources/styles'

export const BlockMarker = ({ pieceSize }: { pieceSize: number }) => {
  return (
    <div 
      className={styles.default}
      style={{ width: pieceSize, height:pieceSize, borderRadius: pieceSize/2 }}
    >
    </div>
  )
}